/**
 * Video Recorder Utility for MJPEG Streams
 *
 * This utility captures frames from an MJPEG video stream and creates
 * a video file that can be uploaded as evidence for traffic violations.
 */

export interface RecordingOptions {
  duration?: number; // Duration in milliseconds (default: 1000ms = 1s)
  frameRate?: number; // Target frame rate for recording (default: 10fps)
  quality?: number; // JPEG quality 0-1 (default: 0.8)
}

export interface RecordedVideoData {
  blob: Blob;
  duration: number;
  frameCount: number;
  timestamp: Date;
}

/**
 * Records frames from an img element displaying an MJPEG stream
 * and converts them into a video blob
 */
export class StreamRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frames: string[] = [];
  private isRecording = false;
  private recordingInterval: number | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas 2D context");
    }
    this.ctx = context;
  }

  /**
   * Capture a single frame from the video stream
   */
  private captureFrame(
    imgElement: HTMLImageElement,
    quality: number,
  ): string | null {
    try {
      // Set canvas dimensions to match image
      if (imgElement.naturalWidth === 0 || imgElement.naturalHeight === 0) {
        console.warn("Image not loaded yet");
        return null;
      }

      this.canvas.width = imgElement.naturalWidth;
      this.canvas.height = imgElement.naturalHeight;

      // Draw current frame to canvas
      // Note: Image must have crossOrigin set to avoid tainted canvas
      this.ctx.drawImage(imgElement, 0, 0);

      // Convert to data URL
      return this.canvas.toDataURL("image/jpeg", quality);
    } catch (error) {
      if (error instanceof DOMException && error.message.includes("insecure")) {
        console.error(
          'CORS error: Image element needs crossOrigin="anonymous" attribute',
        );
        throw new Error(
          'CORS error: Unable to capture frame. The stream image must have crossOrigin="anonymous" attribute set.',
        );
      }
      console.error("Error capturing frame:", error);
      return null;
    }
  }

  /**
   * Start recording frames from the stream
   */
  async startRecording(
    imgElement: HTMLImageElement,
    options: RecordingOptions = {},
  ): Promise<RecordedVideoData> {
    const { duration = 1000, frameRate = 10, quality = 0.8 } = options;

    if (this.isRecording) {
      throw new Error("Recording already in progress");
    }

    this.frames = [];
    this.isRecording = true;

    const frameInterval = 1000 / frameRate;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const recordingTimeout = setTimeout(() => {
        this.stopRecording();

        if (this.frames.length === 0) {
          reject(new Error("No frames captured during recording"));
          return;
        }

        // Convert frames to video blob
        this.createVideoFromFrames(this.frames, frameRate)
          .then((blob) => {
            resolve({
              blob,
              duration,
              frameCount: this.frames.length,
              timestamp: new Date(startTime),
            });
          })
          .catch(reject);
      }, duration);

      // Capture frames at specified interval
      this.recordingInterval = window.setInterval(() => {
        if (!this.isRecording) {
          return;
        }

        const frame = this.captureFrame(imgElement, quality);
        if (frame) {
          this.frames.push(frame);
        }
      }, frameInterval);
    });
  }

  /**
   * Stop the current recording
   */
  private stopRecording(): void {
    this.isRecording = false;
    if (this.recordingInterval !== null) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  /**
   * Create a video blob from captured frames using MediaRecorder API
   * Falls back to creating an image sequence if video encoding fails
   */
  private async createVideoFromFrames(
    frames: string[],
    frameRate: number,
  ): Promise<Blob> {
    try {
      // Try to create an actual video using canvas and MediaRecorder
      return await this.createVideoWithMediaRecorder(frames, frameRate);
    } catch (error) {
      console.warn("MediaRecorder failed, creating image sequence:", error);
      // Fallback: create a multi-frame image blob
      return this.createImageSequence(frames);
    }
  }

  /**
   * Create video using MediaRecorder API
   */
  private async createVideoWithMediaRecorder(
    frames: string[],
    frameRate: number,
  ): Promise<Blob> {
    // Create a canvas for video encoding
    const videoCanvas = document.createElement("canvas");
    const img = new Image();

    // Load first frame to get dimensions
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = frames[0];
    });

    videoCanvas.width = img.width;
    videoCanvas.height = img.height;
    const videoCtx = videoCanvas.getContext("2d");

    if (!videoCtx) {
      throw new Error("Failed to get video canvas context");
    }

    // Get canvas stream
    const stream = videoCanvas.captureStream(frameRate);

    // Set up MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });

    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };

      mediaRecorder.onerror = (error) => {
        reject(error);
      };

      mediaRecorder.start();

      // Draw frames sequentially
      const frameDuration = 1000 / frameRate;
      let currentFrame = 0;

      const drawNextFrame = () => {
        if (currentFrame >= frames.length) {
          mediaRecorder.stop();
          return;
        }

        const frameImg = new Image();
        frameImg.onload = () => {
          videoCtx.drawImage(frameImg, 0, 0);
          currentFrame++;
          setTimeout(drawNextFrame, frameDuration);
        };
        frameImg.src = frames[currentFrame];
      };

      drawNextFrame();
    });
  }

  /**
   * Fallback: Create a blob containing all frames as separate images
   * This can be used when video encoding is not available
   */
  private async createImageSequence(frames: string[]): Promise<Blob> {
    // Convert data URLs to blobs and create a simple container
    // For simplicity, we'll just return the first frame as a JPEG
    // In a real implementation, you might want to create a GIF or image archive

    const firstFrame = frames[0];
    const arr = firstFrame.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopRecording();
    this.frames = [];
  }
}

/**
 * Helper function to record video from an MJPEG stream
 */
export async function recordStream(
  imgElement: HTMLImageElement,
  options?: RecordingOptions,
): Promise<RecordedVideoData> {
  const recorder = new StreamRecorder();
  try {
    const result = await recorder.startRecording(imgElement, options);
    return result;
  } finally {
    recorder.dispose();
  }
}
