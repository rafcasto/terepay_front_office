import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    PORT = int(os.getenv('PORT', 5000))
    
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
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0,
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