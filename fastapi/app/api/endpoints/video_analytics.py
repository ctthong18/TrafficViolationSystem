from fastapi import APIRouter

router = APIRouter()

# Placeholder endpoint - AI video analytics has been removed
@router.get("/")
async def video_analytics_placeholder():
    return {"message": "Video analytics endpoints have been removed"}