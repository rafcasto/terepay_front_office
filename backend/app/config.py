import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    PORT = int(os.getenv('PORT', 5000))
    
    # SSL Configuration
    SSL_CERT_PATH = os.getenv('SSL_CERT_PATH')
    SSL_KEY_PATH = os.getenv('SSL_KEY_PATH')
    USE_SSL = bool(os.getenv('USE_SSL', False))
    
    # Redis Cache Configuration
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    REDIS_TTL = int(os.getenv('REDIS_TTL', 300))  # Default cache TTL: 5 minutes
    
    # Firebase Configuration
    FIREBASE_SERVICE_ACCOUNT_KEY = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    FIREBASE_SERVICE_ACCOUNT_BASE64 = os.getenv('FIREBASE_SERVICE_ACCOUNT_BASE64')
    FIREBASE_SERVICE_ACCOUNT_FILE = os.getenv('FIREBASE_SERVICE_ACCOUNT_FILE', 'serviceAccountKey.json')
    
    # Database Configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,  # Recycle connections every 5 minutes
        'pool_timeout': 10,   # Reduced timeout for faster failure detection
        'max_overflow': 5,    # Allow 5 connections over pool_size
        'pool_size': 10,     # Maintain 10 connections for 100 users (1:10 ratio)
        'echo': False,
        'echo_pool': False,
        'pool_use_lifo': True,  # Last In First Out for better connection reuse
        'connect_args': {
            'connect_timeout': 10,    # Slightly increased for Neon's pooler
            'application_name': 'terepay_front_office',  # Helps with monitoring
            'tcp_user_timeout': 30000,  # 30 seconds in milliseconds
            'tcp_keepalives_idle': 60,
            'tcp_keepalives_interval': 10,
            'tcp_keepalives_count': 3
        }
    }
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    FLASK_ENV = 'production'

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}