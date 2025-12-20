from fastapi import APIRouter

router = APIRouter()

# Placeholder endpoint - Video AI processing has been removed
@router.get("/")
async def video_ai_processing_placeholder():
    return {"message": "Video AI processing endpoints have been removed"}