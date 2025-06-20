# backend/app/services/database_service.py
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import logging
from flask import current_app
from contextlib import contextmanager
import threading
import time

logger = logging.getLogger(__name__)

class DatabaseService:
    """Optimized database service with connection pooling."""
    _connection_pool = None
    _pool_lock = threading.Lock()
    _last_health_check = 0
    _health_check_interval = 300  # 5 minutes
    
    @classmethod
    def initialize_pool(cls):
        """Initialize connection pool on app startup."""
        with cls._pool_lock:
            if cls._connection_pool is None:
                try:
                    cls._connection_pool = psycopg2.pool.ThreadedConnectionPool(
                        minconn=2,          # Minimum connections to keep open
                        maxconn=20,         # Maximum connections allowed
                        dsn=current_app.config['DATABASE_URL'],
                        cursor_factory=RealDictCursor,
                        # Keep connections alive
                        keepalives_idle=600,
                        keepalives_interval=30,
                        keepalives_count=3,
                    )
                    logger.info("Database connection pool initialized successfully")
                    cls._perform_health_check()
                except Exception as e:
                    logger.error(f"Failed to initialize connection pool: {e}")
                    raise
    
    @classmethod
    def _perform_health_check(cls):
        """Perform periodic health check on connection pool."""
        current_time = time.time()
        if current_time - cls._last_health_check < cls._health_check_interval:
            return
        
        try:
            # Get connection directly from pool without triggering another health check
            if cls._connection_pool:
                conn = cls._connection_pool.getconn()
                try:
                    cursor = conn.cursor()
                    cursor.execute("SELECT 1;")
                    cursor.fetchone()
                    cls._last_health_check = current_time
                    logger.debug("Database health check passed")
                finally:
                    cls._connection_pool.putconn(conn)
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            # Don't reinitialize here to avoid recursion - just log the error
    
    @classmethod
    @contextmanager
    def get_connection(cls):
        """Get connection from pool with automatic cleanup."""
        if cls._connection_pool is None:
            cls.initialize_pool()
        
        # Perform periodic health check
        cls._perform_health_check()
        
        conn = None
        try:
            conn = cls._connection_pool.getconn()
            if conn.closed:
                # Connection is closed, get a new one
                cls._connection_pool.putconn(conn, close=True)
                conn = cls._connection_pool.getconn()
            
            yield conn
            
        except psycopg2.OperationalError as e:
            logger.error(f"Database operational error: {e}")
            if conn:
                cls._connection_pool.putconn(conn, close=True)
            raise
        except Exception as e:
            if conn:
                conn.rollback()
            raise
        finally:
            if conn and not conn.closed:
                cls._connection_pool.putconn(conn)
    
    @classmethod
    def close_pool(cls):
        """Close connection pool gracefully."""
        with cls._pool_lock:
            if cls._connection_pool:
                cls._connection_pool.closeall()
                cls._connection_pool = None
                logger.info("Database connection pool closed")
    
    # ==========================================================================
    # EXISTING METHODS UPDATED TO USE CONNECTION POOL
    # ==========================================================================
    
    @staticmethod
    def test_connection():
        """Test database connection using pool."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT version();")
                db_version = cursor.fetchone()
            return True, db_version
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False, str(e)
    
    @staticmethod
    def create_test_table():
        """Create a test table if it doesn't exist."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                # Create test table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS test_table (
                        id SERIAL PRIMARY KEY,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                conn.commit()
            return True, "Test table created successfully"
        except Exception as e:
            logger.error(f"Failed to create test table: {e}")
            return False, str(e)
    
    @staticmethod
    def insert_test_data(message):
        """Insert test data into the test table."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute(
                    "INSERT INTO test_table (message) VALUES (%s) RETURNING id, message, created_at;",
                    (message,)
                )
                
                result = cursor.fetchone()
                conn.commit()
            return True, dict(result)
        except Exception as e:
            logger.error(f"Failed to insert test data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_test_data():
        """Get all test data from the test table."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, message, created_at FROM test_table ORDER BY created_at DESC LIMIT 10;")
                results = cursor.fetchall()
            return True, [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Failed to get test data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_database_info():
        """Get database information."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get database version
                cursor.execute("SELECT version();")
                version = cursor.fetchone()['version']
                
                # Get current database name
                cursor.execute("SELECT current_database();")
                db_name = cursor.fetchone()['current_database']
                
                # Get current user
                cursor.execute("SELECT current_user;")
                current_user = cursor.fetchone()['current_user']
                
                # Get table count
                cursor.execute("""
                    SELECT COUNT(*) as table_count 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public';
                """)
                table_count = cursor.fetchone()['table_count']
                
            return True, {
                'version': version,
                'database_name': db_name,
                'current_user': current_user,
                'table_count': table_count
            }
        except Exception as e:
            logger.error(f"Failed to get database info: {e}")
            return False, str(e)