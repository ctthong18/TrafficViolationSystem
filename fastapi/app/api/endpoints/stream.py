import cv2
import asyncio 
from fastapi import APIRouter, WebSocket
from app.ai.loader import load_model
import os

router = APIRouter()

clients = []
MODEL_ROOT = os.getenv("MODEL_PATH", "app")

@router.websocket("ws/detect")
async def wc_socket(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except:
        clients.remove(websocket)

async def broadcast(obj):
    for ws in clients:
        try:
            await ws.send_json(obj)
        except:
            clients.remove(ws)

async def run_detector():
    model = load_model(MODEL_ROOT)
    cap = cv2.VideoCapture(VIDEO_PATH)
    fps = cap.get(cv2.CAP_PROP_FPS)
    delay = 1 / fps 
    
    frame_index = 0
    
    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            frame_index = 0
            continue
        
        results = model.detect(frame)
        
        detections = []
        if results[0].boxes:
            for b in results[0].boxes.data.cpu().numpy():
                x1, y1, x2, y2 = map(int, b[:4])
                conf = float(b[4])
                cls = int(b[5])
                detections.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": conf,
                    "class_id": cls
                })
                
        await broadcast({
            "frame_index": frame_index,
            "detections": detections
        })
        
        frame_index += 1
        await asyncio.sleep(delay)