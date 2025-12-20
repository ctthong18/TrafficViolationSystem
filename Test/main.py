import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import json
import time
from datetime import datetime
import os

# ============================= CONFIG =============================
MODEL_VEHICLE = r'D:\git_project\TrafficViolationSystem\MODEL\best.pt'
MODEL_LP_DETECT = r'D:\git_project\TrafficViolationSystem\MODEL\license_plate_detector.pt'
MODEL_LP_RECOG  = r'D:\git_project\TrafficViolationSystem\MODEL\license_plates.pt'

VIDEO_PATH = r"D:\git_project\TrafficViolationSystem\Test\test2.mp4"
OUTPUT_VIDEO_PATH = r"D:\git_project\TrafficViolationSystem\Test\output2.avi"

CONFIDENCE_THRESHOLD = 0.25
IOU_THRESHOLD = 0.5

LINE_THICKNESS = 2
FONT_SCALE = 0.4
FONT_THICKNESS = 1

COLOR_CAR = (0, 255, 0)
COLOR_MOTORCYCLE = (255, 0, 0)
COLOR_BUS = (0, 0, 255)
COLOR_TRUCK = (0, 255, 255)

VEHICLE_CLASSES = {
    2: {'name': 'car', 'color': COLOR_CAR},
    3: {'name': 'motorcycle', 'color': COLOR_MOTORCYCLE},
    5: {'name': 'bus', 'color': COLOR_BUS},
    7: {'name': 'truck', 'color': COLOR_TRUCK},
}

# Perspective transform points (bird-eye view)
SOURCE_POINTS = np.array([
    [1252, 787],
    [2298, 803],
    [5039, 2159],
    [-550, 2159]
]).astype(np.float32)

TARGET_WIDTH = 20      # meters
TARGET_LENGTH = 30     # meters

# ============================= LOGGING CONFIG =============================
LOG_DIR = r"D:\git_project\TrafficViolationSystem\Logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE_PATH = os.path.join(LOG_DIR, f"detection_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
LOG_INTERVAL = 10  # In log ra console mỗi 10 frame

# ============================= LOGGER CLASS =============================
class DetectionLogger:
    def __init__(self, log_file_path):
        self.log_file_path = log_file_path
        self.log_data = {
            "video_info": {},
            "model_info": {},
            "detections": [],
            "summary": {
                "total_frames": 0,
                "total_vehicles": 0,
                "max_speed": 0,
                "license_plates_detected": 0,
                "vehicle_types": defaultdict(int)
            }
        }

    def log_video_info(self, width, height, fps, video_path):
        self.log_data["video_info"] = {
            "width": width,
            "height": height,
            "fps": fps,
            "video_path": video_path,
            "start_time": datetime.now().isoformat()
        }

    def log_model_info(self):
        self.log_data["model_info"] = {
            "vehicle_model": MODEL_VEHICLE,
            "lp_detect_model": MODEL_LP_DETECT,
            "lp_recog_model": MODEL_LP_RECOG,
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "iou_threshold": IOU_THRESHOLD,
            "vehicle_classes": {str(k): v["name"] for k, v in VEHICLE_CLASSES.items()}
        }

    def log_frame_detection(self, frame_count, detections, processing_time):
        frame_log = {
            "frame_number": frame_count,
            "timestamp": datetime.now().isoformat(),
            "processing_time_ms": round(processing_time * 1000, 2),
            "vehicle_count": len(detections),
            "detections": detections,
            "violations": []
        }

        for det in detections:
            speed = det.get("speed", 0)
            if speed > 60:
                frame_log["violations"].append({
                    "track_id": det["track_id"],
                    "type": "overspeed",
                    "speed": round(speed, 1),
                    "threshold": 60,
                    "license_plate": det.get("license_plate", "Unknown")
                })

            self.log_data["summary"]["total_vehicles"] += 1
            self.log_data["summary"]["vehicle_types"][det["vehicle_type"]] += 1

            if speed > self.log_data["summary"]["max_speed"]:
                self.log_data["summary"]["max_speed"] = speed

            if det.get("license_plate", "").strip():
                self.log_data["summary"]["license_plates_detected"] += 1

        self.log_data["detections"].append(frame_log)
        self.log_data["summary"]["total_frames"] = frame_count

        # In ra console mỗi LOG_INTERVAL frame
        if frame_count % LOG_INTERVAL == 0 or len(detections) == 0:
            print(f"\n[Frame {frame_count}]  Time: {datetime.now().strftime('%H:%M:%S')}")
            print(f"   Processing: {processing_time*1000:.2f} ms | Vehicles: {len(detections)}")
            for det in detections:
                warning = " OVER SPEED" if det.get("speed", 0) > 60 else ""
                print(f"   • {det['vehicle_type']} #{det['track_id']:3d} | "
                      f"{det['speed']:5.1f} km/h{warning} | LP: {det.get('license_plate', 'N/A')}")

    def save_log(self):
        self.log_data["summary"]["end_time"] = datetime.now().isoformat()
        self.log_data["summary"]["vehicle_types"] = dict(self.log_data["summary"]["vehicle_types"])

        with open(self.log_file_path, 'w', encoding='utf-8') as f:
            json.dump(self.log_data, f, indent=2, ensure_ascii=False)

        # Tạo file tóm tắt dễ đọc
        summary_path = self.log_file_path.replace('.json', '_summary.txt')
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("="*70 + "\n")
            f.write("     TRAFFIC VIOLATION DETECTION SYSTEM - SUMMARY REPORT\n")
            f.write("="*70 + "\n\n")
            f.write(f"Video            : {os.path.basename(VIDEO_PATH)}\n")
            f.write(f"Start time       : {self.log_data['video_info']['start_time']}\n")
            f.write(f"End time         : {self.log_data['summary']['end_time']}\n")
            f.write(f"Total frames     : {self.log_data['summary']['total_frames']}\n\n")

            f.write("DETECTION STATISTICS\n")
            f.write("-"*40 + "\n")
            f.write(f"Total vehicles detected   : {self.log_data['summary']['total_vehicles']}\n")
            f.write(f"License plates recognized : {self.log_data['summary']['license_plates_detected']}\n")
            f.write(f"Max speed recorded        : {self.log_data['summary']['max_speed']:.1f} km/h\n\n")

            f.write("VEHICLE TYPE DISTRIBUTION\n")
            f.write("-"*40 + "\n")
            total_veh = self.log_data['summary']['total_vehicles'] or 1
            for typ, cnt in self.log_data['summary']['vehicle_types'].items():
                perc = cnt / total_veh * 100
                f.write(f"{typ:12s} : {cnt:5d} ({perc:5.1f}%)\n")

            # Frame đông nhất & xe nhanh nhất
            if self.log_data["detections"]:
                busiest = max(self.log_data["detections"], key=lambda x: x["vehicle_count"])
                f.write(f"\nBusiest frame : #{busiest['frame_number']} ({busiest['vehicle_count']} vehicles)\n")

                all_dets = [d for fr in self.log_data["detections"] for d in fr["detections"]]
                if all_dets:
                    fastest = max(all_dets, key=lambda x: x["speed"])
                    f.write(f"Fastest vehicle: {fastest['vehicle_type']} #{fastest['track_id']} "
                            f"– {fastest['speed']:.1f} km/h – LP: {fastest.get('license_plate', 'N/A')}\n")

        print(f"\nLog saved: {self.log_file_path}")
        print(f"Summary report: {summary_path}")

# ============================= UTILITIES =============================
class ViewTransformer:
    def __init__(self, src: np.ndarray, w: float, h: float):
        target = np.array([[0, 0], [w, 0], [w, h], [0, h]], dtype=np.float32)
        self.m = cv2.getPerspectiveTransform(src.astype(np.float32), target)

    def transform_points(self, pts: np.ndarray):
        if len(pts) == 0:
            return pts
        pts = pts.reshape(-1, 1, 2).astype(np.float32)
        return cv2.perspectiveTransform(pts, self.m).reshape(-1, 2)

def extract_detection_data(results, lp_to_car, plate_text, track_history, speed_buffer, frame_count, fps):
    detections = []
    if not results or results[0].boxes.id is None:
        return detections

    boxes = results[0].boxes.xyxy.cpu().numpy()
    ids = results[0].boxes.id.int().cpu().numpy()
    clss = results[0].boxes.cls.int().cpu().numpy()
    confs = results[0].boxes.conf.cpu().numpy()

    for i, cid in enumerate(ids):
        if clss[i] not in VEHICLE_CLASSES:
            continue

        x1, y1, x2, y2 = boxes[i]
        vehicle_info = VEHICLE_CLASSES[clss[i]]

        speed = speed_buffer.get(cid, 0)
        plate = plate_text.get(cid, "")

        lp_bbox = None
        if cid in lp_to_car:
            lx1, ly1, lx2, ly2 = lp_to_car[cid]
            lp_bbox = [float(lx1), float(ly1), float(lx2), float(ly2)]

        detections.append({
            "track_id": int(cid),
            "vehicle_type": vehicle_info['name'],
            "bbox": [float(x1), float(y1), float(x2), float(y2)],
            "confidence": float(confs[i]),
            "speed": round(float(speed), 1),
            "speed_unit": "km/h",
            "license_plate": plate,
            "license_plate_bbox": lp_bbox,
            "class_id": int(clss[i]),
            "frame_position": {
                "x_center": float((x1 + x2) / 2),
                "y_bottom": float(y2)
            }
        })
    return detections

# ============================= MAIN =============================
# Khởi tạo models
yolo_vehicle = YOLO(MODEL_VEHICLE)
yolo_lp_det = YOLO(MODEL_LP_DETECT)
yolo_lp_recog = YOLO(MODEL_LP_RECOG)

# Video capture
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print("Không mở được video!")
    exit()

w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS) or 30

fourcc = cv2.VideoWriter_fourcc(*'MJPG')
out = cv2.VideoWriter(OUTPUT_VIDEO_PATH, fourcc, int(fps), (w, h))

view_transformer = ViewTransformer(SOURCE_POINTS, TARGET_WIDTH, TARGET_LENGTH)

# Tracking & buffer
track_history = defaultdict(lambda: [])   # (time, x_real, y_real)
speed_buffer = {}
plate_text = {}

# Logger
logger = DetectionLogger(LOG_FILE_PATH)
logger.log_video_info(w, h, fps, VIDEO_PATH)
logger.log_model_info()

print(f"Bắt đầu xử lý video: {VIDEO_PATH}")
print(f"Log sẽ lưu tại: {LOG_FILE_PATH}")
print("-" * 60)

font = cv2.FONT_HERSHEY_DUPLEX
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    start_time = time.time()

    # 1. Vehicle detection + tracking
    results = yolo_vehicle.track(
        frame,
        persist=True,
        conf=CONFIDENCE_THRESHOLD,
        iou=IOU_THRESHOLD,
        classes=list(VEHICLE_CLASSES.keys()),
        tracker="botsort.yaml",
        imgsz=1280,
        agnostic_nms=True,
        augment=True,
        verbose=False
    )

    # Vẽ vùng bird-eye
    cv2.polylines(frame, [SOURCE_POINTS.astype(np.int32)], True, (0, 255, 255), 2)

    # Nếu không có xe
    if not results or results[0].boxes.id is None:
        processing_time = time.time() - start_time
        detections_data = []
        logger.log_frame_detection(frame_count, detections_data, processing_time)

        out.write(frame)
        cv2.imshow("Traffic AI (Full System)", cv2.resize(frame, (1280, 720)))
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        continue

    boxes = results[0].boxes.xyxy.cpu().numpy()
    ids = results[0].boxes.id.int().cpu().numpy()
    clss = results[0].boxes.cls.int().cpu().numpy()

    # 2. License plate detection
    lp_results = yolo_lp_det(frame, conf=0.15, iou=0.5, imgsz=960, verbose=False)
    lp_boxes = [b.xyxy.cpu().numpy().flatten() for b in (lp_results[0].boxes or [])]

    # Gán biển số → xe gần nhất
    lp_to_car = {}
    for lp in lp_boxes:
        lx1, ly1, lx2, ly2 = lp
        lpx, lpy = (lx1 + lx2) / 2, (ly1 + ly2) / 2
        best_car_id = None
        min_dist = float('inf')

        for i, cid in enumerate(ids):
            x1, y1, x2, y2 = boxes[i]
            cx, cy = (x1 + x2) / 2, y2
            dist = np.hypot(cx - lpx, cy - lpy)
            if dist < min_dist:
                min_dist = dist
                best_car_id = cid
        if best_car_id is not None:
            lp_to_car[best_car_id] = lp

    # 3. License plate recognition
    for car_id, lp_box in lp_to_car.items():
        x1, y1, x2, y2 = map(int, lp_box)
        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        recog = yolo_lp_recog(crop, conf=0.3, verbose=False)
        if recog and recog[0].boxes is not None:
            chars = [(box.xyxy[0][0].item(), recog[0].names[int(box.cls.item())])
                     for box in recog[0].boxes]
            chars.sort(key=lambda x: x[0])
            text = "".join(c[1] for c in chars)
            if text.strip():
                plate_text[car_id] = text

    # 4. Tính tốc độ + vẽ lên frame
    for i, cid in enumerate(ids):
        if clss[i] not in VEHICLE_CLASSES:
            continue

        x1, y1, x2, y2 = map(int, boxes[i])
        info = VEHICLE_CLASSES[clss[i]]
        color = info['color']

        # Bird-eye position
        bx, by = (x1 + x2) / 2, y2
        x_real, y_real = view_transformer.transform_points(np.array([[bx, by]]))[0]
        t = frame_count / fps

        track_history[cid].append((t, x_real, y_real))
        if len(track_history[cid]) > fps * 3:
            track_history[cid].pop(0)

        # Tính tốc độ (dùng 7 frame gần nhất)
        speed = 0
        if len(track_history[cid]) >= 7:
            prev_t, prev_x, prev_y = track_history[cid][-7]
            dt = t - prev_t
            if dt > 0:
                dist_m = np.hypot(x_real - prev_x, y_real - prev_y)
                speed = (dist_m / dt) * 3.6  # m/s → km/h

        # Lọc nhiễu (EMA)
        if cid in speed_buffer:
            speed = speed_buffer[cid] * 0.8 + speed * 0.2
        speed_buffer[cid] = speed

        # Vẽ thông tin lên frame
        plate = plate_text.get(cid, "")
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        yy = y1 - 10
        cv2.putText(frame, f"{info['name']} #{cid}", (x1, yy), font, FONT_SCALE, (255,255,255), FONT_THICKNESS, cv2.LINE_AA)
        yy -= 18
        cv2.putText(frame, f"{int(speed)} km/h", (x1, yy), font, FONT_SCALE, (255,255,255), FONT_THICKNESS, cv2.LINE_AA)
        yy -= 18
        cv2.putText(frame, plate if plate else "no plate", (x1, yy), font, FONT_SCALE, (255,255,255), FONT_THICKNESS, cv2.LINE_AA)

        # Vẽ khung biển số
        if cid in lp_to_car:
            lx1, ly1, lx2, ly2 = map(int, lp_to_car[cid])
            cv2.rectangle(frame, (lx1, ly1), (lx2, ly2), (0, 180, 255), 2)

    # 5. Logging
    processing_time = time.time() - start_time
    detections_data = extract_detection_data(
        results, lp_to_car, plate_text, track_history, speed_buffer, frame_count, fps
    )
    logger.log_frame_detection(frame_count, detections_data, processing_time)

    # 6. Ghi video + hiển thị
    out.write(frame)
    cv2.imshow("Traffic AI (Full System)", cv2.resize(frame, (1280, 720)))
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ========================== KẾT THÚC ==========================
cap.release()
out.release()
cv2.destroyAllWindows()

logger.save_log()
print("\nHOÀN TẤT XỬ LÝ VIDEO!")
print(f"Video output: {OUTPUT_VIDEO_PATH}")