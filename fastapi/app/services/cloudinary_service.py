"""
Cloudinary Service for video management
Handles video upload, deletion, URL generation, and thumbnail creation
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Dict, Optional, Any
from fastapi import UploadFile, HTTPException
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class CloudinaryService:
    """Service for managing videos on Cloudinary"""
    
    def __init__(self):
        """Initialize Cloudinary configuration"""
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True
        )
        logger.info(f"Cloudinary configured with cloud_name: {settings.cloudinary_cloud_name}")
    
    def upload_video(
        self,
        file: UploadFile,
        folder: str = "traffic_videos",
        public_id: Optional[str] = None,
        camera_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Upload video to Cloudinary with folder organization
        
        Args:
            file: Video file to upload
            folder: Cloudinary folder path (default: "traffic_videos")
            public_id: Optional custom public_id for the video
            camera_id: Optional camera ID for folder organization
            
        Returns:
            Dict containing:
                - public_id: Cloudinary public ID
                - secure_url: HTTPS URL to the video
                - url: HTTP URL to the video
                - duration: Video duration in seconds
                - format: Video format (mp4, avi, etc.)
                - bytes: File size in bytes
                - width: Video width in pixels
                - height: Video height in pixels
                - resource_type: "video"
                
        Raises:
            HTTPException: If upload fails
        """
        try:
            # Organize by camera if camera_id provided
            if camera_id:
                folder = f"{folder}/camera_{camera_id}"
            
            # Upload options
            upload_options = {
                "folder": folder,
                "resource_type": "video",
                "overwrite": False,
                "notification_url": None,  # Can be used for async processing notifications
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            # Upload the video
            logger.info(f"Uploading video to Cloudinary folder: {folder}")
            result = cloudinary.uploader.upload(
                file.file,
                **upload_options
            )
            
            logger.info(f"Video uploaded successfully: {result.get('public_id')}")
            
            return {
                "public_id": result.get("public_id"),
                "secure_url": result.get("secure_url"),
                "url": result.get("url"),
                "duration": result.get("duration"),  # in seconds
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "width": result.get("width"),
                "height": result.get("height"),
                "resource_type": result.get("resource_type"),
                "created_at": result.get("created_at"),
            }
            
        except cloudinary.exceptions.Error as e:
            logger.error(f"Cloudinary upload error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload video to Cloudinary: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during video upload: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during video upload: {str(e)}"
            )
    
    def delete_video(self, public_id: str) -> Dict[str, Any]:
        """
        Delete video from Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the video to delete
            
        Returns:
            Dict containing deletion result
            
        Raises:
            HTTPException: If deletion fails
        """
        try:
            logger.info(f"Deleting video from Cloudinary: {public_id}")
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="video",
                invalidate=True  # Invalidate CDN cache
            )
            
            if result.get("result") == "ok":
                logger.info(f"Video deleted successfully: {public_id}")
                return {
                    "success": True,
                    "result": result.get("result"),
                    "public_id": public_id
                }
            else:
                logger.warning(f"Video deletion returned non-ok result: {result}")
                return {
                    "success": False,
                    "result": result.get("result"),
                    "public_id": public_id
                }
                
        except cloudinary.exceptions.Error as e:
            logger.error(f"Cloudinary deletion error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete video from Cloudinary: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error during video deletion: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during video deletion: {str(e)}"
            )
    
    def get_video_url(
        self,
        public_id: str,
        transformations: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get optimized video URL with transformations
        
        Args:
            public_id: Cloudinary public ID of the video
            transformations: Optional dict of Cloudinary transformations
                Examples:
                - {"quality": "auto", "fetch_format": "auto"}
                - {"width": 1280, "height": 720, "crop": "limit"}
                - {"start_offset": "10", "duration": "30"}
                
        Returns:
            Secure HTTPS URL to the video with transformations applied
        """
        try:
            # Default transformations for optimized delivery
            default_transformations = {
                "quality": "auto:good",
                "fetch_format": "auto",
            }
            
            # Merge with custom transformations
            if transformations:
                default_transformations.update(transformations)
            
            # Generate URL with transformations
            url = cloudinary.CloudinaryVideo(public_id).build_url(
                **default_transformations,
                secure=True
            )
            
            logger.debug(f"Generated video URL for {public_id}: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Error generating video URL: {str(e)}")
            # Return basic URL without transformations as fallback
            return cloudinary.CloudinaryVideo(public_id).build_url(secure=True)
    
    def generate_thumbnail(
        self,
        public_id: str,
        timestamp: float = 0.0,
        width: int = 640,
        height: int = 360
    ) -> str:
        """
        Generate thumbnail from video at specific timestamp
        
        Args:
            public_id: Cloudinary public ID of the video
            timestamp: Time in seconds to capture thumbnail (default: 0.0)
            width: Thumbnail width in pixels (default: 640)
            height: Thumbnail height in pixels (default: 360)
            
        Returns:
            Secure HTTPS URL to the thumbnail image
        """
        try:
            # Generate thumbnail URL with transformations
            thumbnail_url = cloudinary.CloudinaryVideo(public_id).build_url(
                resource_type="video",
                format="jpg",
                start_offset=f"{timestamp}s",
                width=width,
                height=height,
                crop="fill",
                quality="auto:good",
                secure=True
            )
            
            logger.debug(f"Generated thumbnail for {public_id} at {timestamp}s: {thumbnail_url}")
            return thumbnail_url
            
        except Exception as e:
            logger.error(f"Error generating thumbnail: {str(e)}")
            # Return basic thumbnail as fallback
            return cloudinary.CloudinaryVideo(public_id).build_url(
                resource_type="video",
                format="jpg",
                secure=True
            )
    
    def get_video_info(self, public_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a video from Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the video
            
        Returns:
            Dict containing video metadata
            
        Raises:
            HTTPException: If video not found or API error
        """
        try:
            logger.info(f"Fetching video info from Cloudinary: {public_id}")
            result = cloudinary.api.resource(
                public_id,
                resource_type="video"
            )
            
            return {
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "duration": result.get("duration"),
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes"),
                "url": result.get("url"),
                "secure_url": result.get("secure_url"),
                "created_at": result.get("created_at"),
            }
            
        except cloudinary.exceptions.NotFound:
            logger.error(f"Video not found in Cloudinary: {public_id}")
            raise HTTPException(
                status_code=404,
                detail=f"Video not found: {public_id}"
            )
        except cloudinary.exceptions.Error as e:
            logger.error(f"Cloudinary API error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch video info: {str(e)}"
            )


# Singleton instance
cloudinary_service = CloudinaryService()
