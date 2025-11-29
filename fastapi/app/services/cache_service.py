"""
Cache Service for Video Metadata
Implements Redis-based caching for video metadata to improve performance
"""
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import timedelta

try:
    import redis
    from redis import Redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from app.core.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """Service for caching video metadata and frequently accessed data"""
    
    def __init__(self):
        """Initialize Redis connection"""
        self.redis_client: Optional[Redis] = None
        self.enabled = False
        
        if REDIS_AVAILABLE and hasattr(settings, 'redis_url') and settings.redis_url:
            try:
                self.redis_client = redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                self.enabled = True
                logger.info("Redis cache service initialized successfully")
            except Exception as e:
                logger.warning(f"Redis not available, caching disabled: {e}")
                self.redis_client = None
                self.enabled = False
        else:
            logger.info("Redis not configured, caching disabled")
    
    def _make_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key with prefix"""
        return f"{prefix}:{identifier}"
    
    def get_video_metadata(self, video_id: int) -> Optional[Dict[str, Any]]:
        """
        Get cached video metadata
        
        Args:
            video_id: Video ID
            
        Returns:
            Cached video metadata dict or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            key = self._make_key("video_metadata", str(video_id))
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.debug(f"Cache HIT for video metadata: {video_id}")
                return json.loads(cached_data)
            
            logger.debug(f"Cache MISS for video metadata: {video_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached video metadata: {e}")
            return None
    
    def set_video_metadata(
        self,
        video_id: int,
        metadata: Dict[str, Any],
        ttl: int = 3600
    ) -> bool:
        """
        Cache video metadata
        
        Args:
            video_id: Video ID
            metadata: Video metadata dict
            ttl: Time to live in seconds (default: 1 hour)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            key = self._make_key("video_metadata", str(video_id))
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(metadata, default=str)
            )
            logger.debug(f"Cached video metadata: {video_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error caching video metadata: {e}")
            return False
    
    def invalidate_video_metadata(self, video_id: int) -> bool:
        """
        Invalidate cached video metadata
        
        Args:
            video_id: Video ID
            
        Returns:
            True if invalidated successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            key = self._make_key("video_metadata", str(video_id))
            self.redis_client.delete(key)
            logger.debug(f"Invalidated video metadata cache: {video_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating video metadata cache: {e}")
            return False
    
    def get_camera_video_stats(self, camera_id: int) -> Optional[Dict[str, Any]]:
        """
        Get cached camera video statistics
        
        Args:
            camera_id: Camera ID
            
        Returns:
            Cached stats dict or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            key = self._make_key("camera_stats", str(camera_id))
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.debug(f"Cache HIT for camera stats: {camera_id}")
                return json.loads(cached_data)
            
            logger.debug(f"Cache MISS for camera stats: {camera_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached camera stats: {e}")
            return None
    
    def set_camera_video_stats(
        self,
        camera_id: int,
        stats: Dict[str, Any],
        ttl: int = 300
    ) -> bool:
        """
        Cache camera video statistics
        
        Args:
            camera_id: Camera ID
            stats: Statistics dict
            ttl: Time to live in seconds (default: 5 minutes)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            key = self._make_key("camera_stats", str(camera_id))
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(stats, default=str)
            )
            logger.debug(f"Cached camera stats: {camera_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error caching camera stats: {e}")
            return False
    
    def invalidate_camera_stats(self, camera_id: int) -> bool:
        """
        Invalidate cached camera statistics
        
        Args:
            camera_id: Camera ID
            
        Returns:
            True if invalidated successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            key = self._make_key("camera_stats", str(camera_id))
            self.redis_client.delete(key)
            logger.debug(f"Invalidated camera stats cache: {camera_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating camera stats cache: {e}")
            return False
    
    def get_detection_list(
        self,
        cache_key: str
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get cached detection list
        
        Args:
            cache_key: Unique cache key for the detection query
            
        Returns:
            Cached detection list or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            key = self._make_key("detections", cache_key)
            cached_data = self.redis_client.get(key)
            
            if cached_data:
                logger.debug(f"Cache HIT for detections: {cache_key}")
                return json.loads(cached_data)
            
            logger.debug(f"Cache MISS for detections: {cache_key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached detections: {e}")
            return None
    
    def set_detection_list(
        self,
        cache_key: str,
        detections: List[Dict[str, Any]],
        ttl: int = 60
    ) -> bool:
        """
        Cache detection list
        
        Args:
            cache_key: Unique cache key for the detection query
            detections: List of detection dicts
            ttl: Time to live in seconds (default: 1 minute)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            key = self._make_key("detections", cache_key)
            self.redis_client.setex(
                key,
                ttl,
                json.dumps(detections, default=str)
            )
            logger.debug(f"Cached detections: {cache_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error caching detections: {e}")
            return False
    
    def invalidate_all_detections(self) -> bool:
        """
        Invalidate all cached detection lists
        
        Returns:
            True if invalidated successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            # Find all detection cache keys
            pattern = self._make_key("detections", "*")
            keys = self.redis_client.keys(pattern)
            
            if keys:
                self.redis_client.delete(*keys)
                logger.debug(f"Invalidated {len(keys)} detection cache entries")
            
            return True
            
        except Exception as e:
            logger.error(f"Error invalidating detection caches: {e}")
            return False
    
    def clear_all(self) -> bool:
        """
        Clear all cache entries (use with caution)
        
        Returns:
            True if cleared successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            self.redis_client.flushdb()
            logger.info("Cleared all cache entries")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False


# Singleton instance
cache_service = CacheService()
