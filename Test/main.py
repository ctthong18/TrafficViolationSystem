import cv2
from ultralytics import YOLO
import os
import sys 
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_NAME = 'best.pt'
MODEL_PATH = os.path.join(SCRIPT_DIR, MODEL_NAME) 
VIDEO_PATH = r"C:\Users\LEGION\git_project\TrafficViolationSystem\Test\datatest.mp4" # Đổi thành đường dẫn video của bạn
OUTPUT_VIDEO_PATH = "traffic_detection.avi"
CONFIDENCE_THRESHOLD = 0.4
IOU_THRESHOLD = 0.5
LINE_THICKNESS = 2
FONT_SCALE = 0.6
FONT_THICKNESS = 2
COLOR_CAR = (0, 255, 0)
COLOR_MOTORCYCLE = (255, 0, 0)
COLOR_BUS = (0, 0, 255)
COLOR_TRUCK = (0, 255, 255)
VEHICLE_CLASSES = {
    2: {'name': 'car', 'color': COLOR_CAR},
    3: {'name': 'motorcycle', 'color': COLOR_MOTORCYCLE},
    5: {'name': 'bus', 'color': COLOR_BUS},
    7: {'name': 'truck', 'color': COLOR_TRUCK},
    0: {'name': 'person', 'color': (0, 165, 255)}, 
}
try:
    if not os.path.exists(MODEL_PATH):
        exit()     
    model = YOLO(MODEL_PATH)
except Exception as e:
    exit()
print(f"Đang mở video: {VIDEO_PATH}")
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    exit()
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = int(cap.get(cv2.CAP_PROP_FPS))
fourcc = cv2.VideoWriter_fourcc(*'MJPG')
OUTPUT_VIDEO_FULL_PATH = os.path.join(SCRIPT_DIR, OUTPUT_VIDEO_PATH)
out = cv2.VideoWriter(OUTPUT_VIDEO_FULL_PATH, fourcc, fps, (frame_width, frame_height))

if not out.isOpened():
    out = None
frame_count = 0
try:
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        frame_count += 1
        if frame_count == 1:
            continue
        results = model.track(
            frame,
            persist=True,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            classes=list(VEHICLE_CLASSES.keys()),
            verbose=False
        )

        if results[0].boxes:
            boxes_data = results[0].boxes.data.cpu().numpy()
            for box_data in boxes_data:
                if len(box_data) >= 7:
                    x1, y1, x2, y2 = int(box_data[0]), int(box_data[1]), int(box_data[2]), int(box_data[3])
                    track_id = int(box_data[4]) 
                    conf = float(box_data[5])
                    cls_id = int(box_data[6])
                elif len(box_data) >= 6: 
                    x1, y1, x2, y2 = int(box_data[0]), int(box_data[1]), int(box_data[2]), int(box_data[3])
                    conf = float(box_data[4])
                    cls_id = int(box_data[5])
                    track_id = -1
                else:
                    continue 
                if cls_id in VEHICLE_CLASSES:
                    cls_info = VEHICLE_CLASSES[cls_id]
                    cls_name = cls_info['name']
                    color = cls_info['color']
                    if track_id != -1:
                        label = cls_name 
                    else:
                        label = f'{cls_name} ({conf:.2f})'
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, LINE_THICKNESS)
                    (text_width, text_height), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, FONT_SCALE, FONT_THICKNESS)
                    cv2.rectangle(frame, (x1, y1 - text_height - baseline - 5), (x1 + text_width + 5, y1), color, -1)
                    cv2.putText(frame, label, (x1 + 2, y1 - baseline - 2), cv2.FONT_HERSHEY_SIMPLEX, FONT_SCALE, (255, 255, 255), FONT_THICKNESS)

        if out:
            out.write(frame)  
        cv2.imshow("Vehicles Detection", frame)
except Exception as e:
    print("lỗi frame")
cap.release()
if out:
    out.release()
cv2.destroyAllWindows()
if out:
    print(f"Video kết quả đã được lưu tại: {OUTPUT_VIDEO_FULL_PATH}")
