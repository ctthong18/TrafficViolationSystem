import io
import json
import os
import random
import socket
import tempfile
import time
from datetime import datetime
from threading import Thread

import requests
from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8000/api/v1/login")
VIDEO_SOURCE = os.getenv("VIDEO_SOURCE", "../fastapi/test_video.mp4")
UDP_HOST = os.getenv("UDP_HOST", "localhost")
UDP_PORT = int(os.getenv("UDP_PORT", 9999))

# Credentials - Make configurable via environment variables
CAMERA_ID = os.getenv("CAMERA_ID", "CAM-HN-002")
PASSWORD = os.getenv("CAMERA_PASSWORD", "camera123")

console = Console()

import cv2


class AICameraAgent:
    def __init__(self):
        self.token = None
        self.camera_id = None
        self.camera_info = None
        self.video_path = VIDEO_SOURCE if os.path.exists(VIDEO_SOURCE) else None
        self.cap = None
        # Setup UDP socket
        self.udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Video recording
        self.is_recording = False
        self.recorded_frames = []
        self.trigger_violation = False

    def login(self):
        console.print(f"[bold blue]Connecting to backend at {AUTH_URL}...[/bold blue]")
        try:
            payload = {"username_or_email": CAMERA_ID, "password": PASSWORD}
            # Sending as JSON to match LoginRequest schema
            response = requests.post(AUTH_URL, json=payload)

            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                console.print(
                    f"[bold green]Authenticated as {data.get('user', {}).get('full_name')} successfully![/bold green]"
                )
                return True
            else:
                console.print(
                    f"[bold red]Login Failed: {response.status_code} - {response.text}[/bold red]"
                )
                return False
        except Exception as e:
            console.print(f"[bold red]Connection Error: {e}[/bold red]")
            return False

    def select_camera(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            response = requests.get(f"{API_URL}/cameras/", headers=headers)
            if response.status_code == 200:
                cameras = response.json().get("items", [])
                if not cameras:
                    console.print("[yellow]No cameras found. Using default.[/yellow]")
                    self.camera_id = "CAM-SIM-001"
                    self.camera_info = {
                        "name": "Simulated Camera",
                        "location_name": "Console",
                    }
                    return True

                table = Table(title="Available Cameras")
                table.add_column("ID", style="cyan")
                table.add_column("Name", style="magenta")
                table.add_column("Location", style="green")

                for i, cam in enumerate(cameras):
                    table.add_row(str(i + 1), cam["name"], cam["location_name"])

                console.print(table)
                # Auto-select the camera matching CAMERA_ID
                selected = next(
                    (c for c in cameras if c["camera_id"] == CAMERA_ID), cameras[0]
                )

                self.camera_id = selected["camera_id"]
                self.camera_info = selected
                console.print(
                    f"[bold cyan]Selected Camera: {self.camera_id} - {selected['name']}[/bold cyan]"
                )

                # Setup localized video capture
                if self.video_path:
                    self.cap = cv2.VideoCapture(self.video_path)
                return True
            else:
                console.print(
                    f"[red]Failed to fetch cameras: {response.status_code} - {response.text}[/red]"
                )
                return False
        except Exception as e:
            console.print(f"[red]Error fetching cameras: {e}[/red]")
            return False

    def capture_video_clip(self, duration=1.0, fps=25):
        """Capture a video clip of specified duration"""
        frames = []
        start_time = time.time()

        while time.time() - start_time < duration:
            if self.cap and self.cap.isOpened():
                success, frame = self.cap.read()
                if success:
                    frames.append(frame)
                time.sleep(1.0 / fps)

        return frames

    def save_and_upload_video(self, frames, violation_data):
        """Save frames to temporary video file and upload to Cloudinary via API"""
        if not frames:
            console.print("[yellow]No frames captured[/yellow]")
            return

        temp_path = None
        final_path = None
        try:
            # Create temporary video file
            with tempfile.NamedTemporaryFile(suffix=".avi", delete=False) as tmp_file:
                temp_path = tmp_file.name

            # Write frames to AVI first (more reliable)
            height, width = frames[0].shape[:2]
            fourcc = cv2.VideoWriter.fourcc(*"XVID")
            out = cv2.VideoWriter(temp_path, fourcc, 25.0, (width, height))

            for frame in frames:
                out.write(frame)
            out.release()

            console.print(f"[cyan]Video saved as AVI: {temp_path}[/cyan]")

            # Convert to H.264 MP4 using ffmpeg for web compatibility
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as final_file:
                final_path = final_file.name

            console.print(
                "[cyan]Converting to H.264 MP4 for web compatibility...[/cyan]"
            )

            # Use ffmpeg to convert to web-compatible H.264
            import subprocess

            ffmpeg_cmd = [
                "ffmpeg",
                "-i",
                temp_path,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-crf",
                "23",
                "-pix_fmt",
                "yuv420p",
                "-y",  # Overwrite output file
                final_path,
            ]

            result = subprocess.run(
                ffmpeg_cmd, capture_output=True, text=True, timeout=30
            )

            if result.returncode != 0:
                console.print(
                    f"[yellow]FFmpeg conversion failed, using original AVI[/yellow]"
                )
                console.print(f"[dim]Error: {result.stderr}[/dim]")
                final_path = temp_path
            else:
                console.print(
                    f"[green]Video converted to H.264 MP4 successfully[/green]"
                )
                # Delete the temporary AVI file
                os.unlink(temp_path)
                temp_path = None

            console.print(f"[cyan]Final video path: {final_path}[/cyan]")

            # Get camera numeric ID from camera_id string
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{API_URL}/cameras/{self.camera_id}", headers=headers
            )

            if response.status_code != 200:
                console.print(
                    f"[red]Failed to get camera info: {response.status_code}[/red]"
                )
                # Clean up temporary files
                if final_path and os.path.exists(final_path):
                    os.unlink(final_path)
                if temp_path and os.path.exists(temp_path):
                    os.unlink(temp_path)
                return

            camera_data = response.json()
            camera_numeric_id = camera_data.get("id")

            # Upload video to API
            console.print("[cyan]Uploading video to Cloudinary via API...[/cyan]")

            with open(final_path, "rb") as video_file:
                files = {"file": ("violation_video.mp4", video_file, "video/mp4")}
                data = {
                    "camera_id": camera_numeric_id,
                    "recorded_at": datetime.now().isoformat(),
                }

                upload_response = requests.post(
                    f"{API_URL}/videos/upload",
                    files=files,
                    data=data,
                    headers={"Authorization": f"Bearer {self.token}"},
                )

                if upload_response.status_code == 201:
                    result = upload_response.json()
                    console.print(
                        "[bold green]Video uploaded successfully![/bold green]"
                    )
                    console.print(f"[green]Video ID: {result.get('video_id')}[/green]")
                    console.print(
                        f"[green]Cloudinary URL: {result.get('cloudinary_url')}[/green]"
                    )

                    # Now create the violation with video reference
                    violation_data["evidence_images"] = [
                        result.get("thumbnail_url", "")
                    ]
                    violation_data["video_id"] = result.get("video_id")
                    violation_data["ai_metadata"]["video_id"] = result.get("video_id")
                    violation_data["ai_metadata"]["cloudinary_url"] = result.get(
                        "cloudinary_url"
                    )

                    # Create violation record
                    vio_response = requests.post(
                        f"{API_URL}/violations/", json=violation_data, headers=headers
                    )

                    if vio_response.status_code == 200:
                        console.print(
                            "[bold green]Violation record created with video evidence![/bold green]"
                        )
                    else:
                        console.print(
                            f"[bold red]Video uploaded but violation creation failed: {vio_response.status_code}[/bold red]"
                        )
                        console.print(f"[red]Response: {vio_response.text}[/red]")
                        console.print(f"[yellow]Payload sent:[/yellow]")
                        import json

                        console.print(json.dumps(violation_data, indent=2, default=str))
                else:
                    console.print(
                        f"[red]Video upload failed: {upload_response.status_code} - {upload_response.text}[/red]"
                    )

            # Clean up temporary files
            if final_path and os.path.exists(final_path):
                os.unlink(final_path)
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
            console.print("[dim]Temporary files deleted[/dim]")

        except Exception as e:
            console.print(f"[bold red]Error saving/uploading video: {e}[/bold red]")
            import traceback

            console.print(f"[red]{traceback.format_exc()}[/red]")
            # Clean up temporary files on error
            if temp_path is not None and os.path.exists(temp_path):
                os.unlink(temp_path)
            if final_path is not None and os.path.exists(final_path):
                os.unlink(final_path)

    def keyboard_listener(self):
        """Listen for spacebar press to trigger violation"""
        try:
            from pynput import keyboard

            console.print(
                "[dim]Keyboard listener active - Press SPACE to trigger violation[/dim]"
            )

            def on_press(key):
                try:
                    if key == keyboard.Key.space:
                        if not self.is_recording:
                            console.print(
                                "[bold yellow]🎬 SPACEBAR PRESSED - Recording violation...[/bold yellow]"
                            )
                            self.trigger_violation = True
                except AttributeError:
                    pass

            # Start the listener
            with keyboard.Listener(on_press=on_press) as listener:
                listener.join()

        except ImportError:
            console.print(
                "[yellow]pynput module not available. Install with: pip install pynput[/yellow]"
            )
        except Exception as e:
            console.print(f"[red]Keyboard listener error: {e}[/red]")

    def simulate_stream(self):
        headers = {"Authorization": f"Bearer {self.token}"}

        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
            Layout(name="log", size=10),
        )

        source_name = (
            os.path.basename(self.video_path) if self.video_path else "Live Stream"
        )
        layout["header"].update(
            Panel(
                f"AI Edge Processor - Camera: {self.camera_id} | Source: {source_name}",
                style="bold white on blue",
            )
        )

        log_content = []

        def update_log(msg):
            log_content.append(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")
            if len(log_content) > 8:
                log_content.pop(0)
            layout["log"].update(
                Panel("\n".join(log_content), title="Process Log", border_style="blue")
            )

        # Simulation Loop
        with Live(layout, refresh_per_second=4):
            frame_count = 0
            while True:
                # 1. Capture Frame (Real or Simulated)
                frame_data = None
                if self.cap and self.cap.isOpened():
                    success, frame = self.cap.read()
                    if not success:
                        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue

                    # 1. OPTIMIZE FOR UDP: Resize and Compress
                    # Standard UDP packets are limited to 65KB.
                    # 854x480 (480p) at 60% quality provides better viewing (~30-40KB).
                    frame = cv2.resize(frame, (854, 480))

                    # Encode to JPEG with improved quality
                    ret, buffer = cv2.imencode(
                        ".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60]
                    )
                    if ret:
                        frame_data = buffer.tobytes()

                # 2. Push to Backend via UDP
                if frame_data:
                    try:
                        # Protocol: [ID_LEN (1 byte)] [ID (string)] [JPEG_DATA]
                        cam_id_bytes = self.camera_id.encode("utf-8")
                        header = bytes([len(cam_id_bytes)]) + cam_id_bytes
                        packet = header + frame_data

                        # Verify size: UDP max is 65,507 bytes.
                        # If exceeded, packet is dropped.
                        if len(packet) > 65000:
                            if frame_count % 10 == 0:
                                update_log(
                                    f"[yellow]Skipping oversized frame: {len(packet)} bytes[/yellow]"
                                )
                            continue

                        # Send via UDP to 127.0.0.1 (often more reliable than 'localhost')
                        self.udp_sock.sendto(packet, ("127.0.0.1", UDP_PORT))
                    except Exception as e:
                        pass  # Ignore UDP packet loss

                frame_count += 1

                # Update status
                status_text = f"UDP Stream: {frame_count} | Frame Size: {len(frame_data) if frame_data else 0}B | Quality: 60% | Resolution: 854x480 | [Press SPACE for violation]"
                layout["body"].update(
                    Panel(status_text, title="Edge-to-Cloud (UDP)", border_style="cyan")
                )

                # 3. Check for spacebar trigger or random violation
                should_detect_violation = self.trigger_violation or (
                    random.random() < 0.0001
                )  # 1% random chance

                if should_detect_violation:
                    if self.trigger_violation:
                        update_log(
                            "[bold yellow]🎬 MANUAL TRIGGER - Capturing violation evidence...[/bold yellow]"
                        )
                    else:
                        update_log("[yellow]Analyzing vehicle patterns...[/yellow]")

                    if (
                        self.trigger_violation or random.random() < 0.6
                    ):  # Always trigger on spacebar, 60% on random
                        violation_type = random.choice(
                            ["RED_LIGHT", "SPEED_10_20", "WRONG_LANE"]
                        )
                        plate = f"30F-{random.randint(10000, 99999)}"

                        update_log(
                            f"[bold red]🚨 VIOLATION DETECTED: {violation_type} at {plate}[/bold red]"
                        )

                        # Always capture video evidence for all violations
                        update_log("[cyan]📹 Capturing 1-second video clip...[/cyan]")
                        self.is_recording = True

                        # Capture frames for 1 second
                        video_frames = self.capture_video_clip(duration=1.0, fps=25)

                        update_log(f"[cyan]Captured {len(video_frames)} frames[/cyan]")

                        # Prepare violation data with proper types (convert to float for JSON serialization)
                        payload = {
                            "license_plate": plate,
                            "violation_type": violation_type,
                            "latitude": float(self.camera_info.get("latitude", 21.0))
                            if self.camera_info
                            else 21.0,
                            "longitude": float(self.camera_info.get("longitude", 105.8))
                            if self.camera_info
                            else 105.8,
                            "location_name": self.camera_info.get(
                                "location_name", "Unknown"
                            )
                            if self.camera_info
                            else "Unknown",
                            "camera_id": self.camera_id,
                            "detected_at": datetime.now().isoformat(),
                            "confidence_score": round(0.85 + random.random() * 0.14, 2),
                            "evidence_images": [],
                            "ai_metadata": {
                                "simulated": not self.trigger_violation,
                                "manual_trigger": self.trigger_violation,
                                "source_file": source_name,
                                "frames_captured": len(video_frames),
                            },
                        }

                        # Upload video in background thread to not block stream
                        upload_thread = Thread(
                            target=self.save_and_upload_video,
                            args=(video_frames, payload),
                        )
                        upload_thread.daemon = True
                        upload_thread.start()

                        self.is_recording = False
                        self.trigger_violation = False

                # Slow down to match capture rate (25 FPS)
                time.sleep(0.04)


if __name__ == "__main__":
    agent = AICameraAgent()
    if agent.login():
        if agent.select_camera():
            try:
                # Start keyboard listener in background thread
                listener_thread = Thread(target=agent.keyboard_listener)
                listener_thread.daemon = True
                listener_thread.start()

                console.print("[bold green]AI Edge Agent started![/bold green]")
                console.print(
                    "[bold cyan]Press SPACE to manually trigger violation with video capture[/bold cyan]"
                )

                agent.simulate_stream()
            except KeyboardInterrupt:
                console.print("\n[bold yellow]Shutting down AI Agent...[/bold yellow]")
        else:
            console.print("[bold red]Could not select camera. Exiting.[/bold red]")
