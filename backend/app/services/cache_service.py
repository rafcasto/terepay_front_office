# backend/app/services/cache_service.py
import redis
import json
import logging
from flask import current_app
from typing import Any, Optional
from functools import wraps

logger = logging.getLogger(__name__)

class CacheService:
    _instance = None
    _redis_client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CacheService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis(
                    host=current_app.config.get('REDIS_HOST', 'localhost'),
                    port=current_app.config.get('REDIS_PORT', 6379),
                    db=current_app.config.get('REDIS_DB', 0),
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self._redis_client.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.warning(f"Redis not available: {e}")
                self._redis_client = None
    
    @property
    def is_available(self) -> bool:
        return self._redis_client is not None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.is_available:
            return None
        
        try:
            value = self._redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL."""
        if not self.is_available:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            self._redis_client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.is_available:
            return False
        
        try:
            self._redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> bool:
        """Delete all keys matching pattern."""
        if not self.is_available:
            return False
        
        try:
            keys = self._redis_client.keys(pattern)
            if keys:
                self._redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return False

# Cache decorator
def cached(ttl: int = 300, key_prefix: str = ""):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = CacheService()
            
            # Create cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for {cache_key}, result cached")
            
            return result
        return wrapper
    return decorator