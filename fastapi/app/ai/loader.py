import os
from ultralytics import YOLO

class TrafficModel:
    def __init__(self, model_dir: str):
        model_path = os.path.join(model_dir, "violation_detection.pt")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model không tồn tại:", model_path)
        
        self.model = YOLO(model_path)
        
    def detect(self, frame):
        return self.model.track(
            frame,
            persist=True,
            conf=0.4,
            iou=0.5,
            classes=[0, 2, 3, 5, 7],
            verbose=False
        )

traffic_model = None

def load_model(model_root: str):
    global traffic_model
    if traffic_model is None:
        traffic_model = TrafficModel(model_root)
    return traffic_model
        