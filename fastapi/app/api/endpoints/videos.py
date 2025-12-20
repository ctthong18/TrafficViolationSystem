from fastapi import APIRouter

router = APIRouter()

# Placeholder endpoint - AI video processing has been removed
@router.get("/")
async def videos_placeholder():
    return {"message": "Video processing endpoints have been removed"}