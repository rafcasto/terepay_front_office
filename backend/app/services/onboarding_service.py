import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from flask import current_app
from urllib.parse import urlparse
from ..services.database_service import DatabaseService
logger = logging.getLogger(__name__)

class OnboardingService:
    @staticmethod
    def save_step1_data(firebase_uid, step1_data):
        """Save or update Step 1 onboarding data."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            # Prepare the data
            full_name = step1_data.get('fullName')
            dob = step1_data.get('dob') if step1_data.get('dob') else None
            address = step1_data.get('address')
            email = step1_data.get('email')
            phone_number = step1_data.get('phoneNumber')
            nz_residency_status = step1_data.get('nzResidencyStatus')
            tax_number = step1_data.get('taxNumber')
            
            # Use UPSERT (INSERT ... ON CONFLICT) to handle both insert and update
            cursor.execute("""
                INSERT INTO onboarding_applications (
                    firebase_uid, full_name, date_of_birth, address, email, 
                    phone_number, nz_residency_status, tax_number, step_completed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    date_of_birth = EXCLUDED.date_of_birth,
                    address = EXCLUDED.address,
                    email = EXCLUDED.email,
                    phone_number = EXCLUDED.phone_number,
                    nz_residency_status = EXCLUDED.nz_residency_status,
                    tax_number = EXCLUDED.tax_number,
                    step_completed = GREATEST(onboarding_applications.step_completed, 1),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, firebase_uid, full_name, email, step_completed, created_at, updated_at;
            """, (
                firebase_uid, full_name, dob, address, email, 
                phone_number, nz_residency_status, tax_number, 1
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to save Step 1 data: {e}")
            return False, str(e)

    @staticmethod
    def get_step1_data(firebase_uid):
        """Get Step 1 onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, firebase_uid, full_name, date_of_birth, address, email,
                    phone_number, nz_residency_status, tax_number, step_completed,
                    is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s;
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                # Convert to frontend-compatible format
                data = dict(result)
                # Convert date to string format for frontend
                if data['date_of_birth']:
                    data['date_of_birth'] = data['date_of_birth'].strftime('%Y-%m-%d')
                
                return True, data
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get Step 1 data: {e}")
            return False, str(e)

    @staticmethod
    def get_user_onboarding_status(firebase_uid):
        """Get user's onboarding completion status."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT step_completed, is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s;
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return True, dict(result)
            else:
                return True, {'step_completed': 0, 'is_completed': False}
                
        except Exception as e:
            logger.error(f"Failed to get onboarding status: {e}")
            return False, str(e)