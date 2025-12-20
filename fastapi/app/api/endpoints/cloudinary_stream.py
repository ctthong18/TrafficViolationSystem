from fastapi import APIRouter

router = APIRouter()

# Placeholder endpoint - Cloudinary stream has been removed
@router.get("/")
async def cloudinary_stream_placeholder():
    return {"message": "Cloudinary stream endpoints have been removed"}