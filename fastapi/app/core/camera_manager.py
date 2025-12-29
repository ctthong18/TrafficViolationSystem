import time

# Global in-memory buffer for camera frames pushed by AI Agents
# In production, this would use Redis or a dedicated media server
camera_frames = {} 

def update_frame(camera_id: str, frame: bytes):
    camera_frames[camera_id] = {
        "frame": frame,
        "timestamp": time.time()
    }

def get_frame(camera_id: str):
    return camera_frames.get(camera_id)
