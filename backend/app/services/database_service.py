import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from flask import current_app
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service class for PostgreSQL database operations."""
    
    @staticmethod
    def get_connection():
        """Get database connection."""
        try:
            database_url = current_app.config['DATABASE_URL']
            conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    @staticmethod
    def test_connection():
        """Test database connection."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()
            cursor.close()
            conn.close()
            return True, db_version
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False, str(e)
    
    @staticmethod
    def create_test_table():
        """Create a test table if it doesn't exist."""
        try:
            conn = DatabaseService.get_connection()
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
            cursor.close()
            conn.close()
            return True, "Test table created successfully"
        except Exception as e:
            logger.error(f"Failed to create test table: {e}")
            return False, str(e)
    
    @staticmethod
    def insert_test_data(message):
        """Insert test data into the test table."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO test_table (message) VALUES (%s) RETURNING id, message, created_at;",
                (message,)
            )
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            return True, dict(result)
        except Exception as e:
            logger.error(f"Failed to insert test data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_test_data():
        """Get all test data from the test table."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, message, created_at FROM test_table ORDER BY created_at DESC LIMIT 10;")
            results = cursor.fetchall()
            
            cursor.close()
            conn.close()
            return True, [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Failed to get test data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_database_info():
        """Get database information."""
        try:
            conn = DatabaseService.get_connection()
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
            
            cursor.close()
            conn.close()
            
            return True, {
                'version': version,
                'database_name': db_name,
                'current_user': current_user,
                'table_count': table_count
            }
        except Exception as e:
            logger.error(f"Failed to get database info: {e}")
            return False, str(e)