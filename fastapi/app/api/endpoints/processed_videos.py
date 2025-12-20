from fastapi import APIRouter

router = APIRouter()

# Placeholder endpoint - Processed videos has been removed
@router.get("/")
async def processed_videos_placeholder():
    return {"message": "Processed videos endpoints have been removed"}