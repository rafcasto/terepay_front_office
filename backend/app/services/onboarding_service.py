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
    def save_step2_data(firebase_uid, step2_data):
        """Save or update Step 2 onboarding data."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            # Prepare the data
            employment_type = step2_data.get('employmentType')
            employer = step2_data.get('employer')
            job_title = step2_data.get('jobTitle')
            employment_duration = step2_data.get('employmentDuration')
            monthly_income = step2_data.get('monthlyIncome')
            other_income = step2_data.get('otherIncome', 0)
            
            # Use UPSERT to handle both insert and update
            cursor.execute("""
                INSERT INTO onboarding_applications (
                    firebase_uid, employment_type, employer, job_title, 
                    employment_duration, monthly_income, other_income, step_completed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                    employment_type = EXCLUDED.employment_type,
                    employer = EXCLUDED.employer,
                    job_title = EXCLUDED.job_title,
                    employment_duration = EXCLUDED.employment_duration,
                    monthly_income = EXCLUDED.monthly_income,
                    other_income = EXCLUDED.other_income,
                    step_completed = GREATEST(onboarding_applications.step_completed, 2),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, firebase_uid, employment_type, employer, job_title, 
                         employment_duration, monthly_income, other_income, 
                         step_completed, created_at, updated_at;
            """, (
                firebase_uid, employment_type, employer, job_title, 
                employment_duration, monthly_income, other_income, 2
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to save Step 2 data: {e}")
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
    def get_step2_data(firebase_uid):
        """Get Step 2 onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, firebase_uid, employment_type, employer, job_title,
                    employment_duration, monthly_income, other_income, 
                    step_completed, is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s;
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return True, dict(result)
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get Step 2 data: {e}")
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

    @staticmethod
    def get_complete_user_data(firebase_uid):
        """Get all onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT *
                FROM onboarding_applications 
                WHERE firebase_uid = %s;
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                data = dict(result)
                # Convert date to string format for frontend
                if data.get('date_of_birth'):
                    data['date_of_birth'] = data['date_of_birth'].strftime('%Y-%m-%d')
                
                return True, data
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get complete user data: {e}")
            return False, str(e)
        

    @staticmethod
    def save_step3_data(firebase_uid, step3_data):
        """Save or update Step 3 onboarding data."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            # Prepare the data
            rent = step3_data.get('rent')
            monthly_expenses = step3_data.get('monthlyExpenses')
            debts = step3_data.get('debts')
            dependents = step3_data.get('dependents')
            
            # Validate that at least one field is provided
            if all(v is None for v in [rent, monthly_expenses, debts, dependents]):
                return False, "At least one Step 3 field must be provided"
            
            # Use UPSERT to handle both insert and update
            cursor.execute("""
                INSERT INTO onboarding_applications (
                    firebase_uid, rent, monthly_expenses, debts, dependents, step_completed
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                    rent = EXCLUDED.rent,
                    monthly_expenses = EXCLUDED.monthly_expenses,
                    debts = EXCLUDED.debts,
                    dependents = EXCLUDED.dependents,
                    step_completed = GREATEST(onboarding_applications.step_completed, 3),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, firebase_uid, rent, monthly_expenses, debts, dependents,
                        step_completed, created_at, updated_at;
            """, (
                firebase_uid, rent, monthly_expenses, debts, dependents, 3
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to save Step 3 data: {e}")
            return False, str(e)

    @staticmethod
    def get_step3_data(firebase_uid):
        """Get Step 3 onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, firebase_uid, rent, monthly_expenses, debts, dependents,
                    step_completed, is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return True, dict(result)
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get Step 3 data: {e}")
            return False, str(e)

    

    @staticmethod
    def save_step4_data(firebase_uid, step4_data):
        """Save or update Step 4 onboarding data."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            # Prepare the data
            savings = step4_data.get('savings')
            assets = step4_data.get('assets')
            source_of_funds = step4_data.get('sourceOfFunds')
            expected_account_activity = step4_data.get('expectedAccountActivity')
            is_politically_exposed = step4_data.get('isPoliticallyExposed')
            
            # Use UPSERT to handle both insert and update
            cursor.execute("""
                INSERT INTO onboarding_applications (
                    firebase_uid, savings, assets, source_of_funds, 
                    expected_account_activity, is_politically_exposed, step_completed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                    savings = EXCLUDED.savings,
                    assets = EXCLUDED.assets,
                    source_of_funds = EXCLUDED.source_of_funds,
                    expected_account_activity = EXCLUDED.expected_account_activity,
                    is_politically_exposed = EXCLUDED.is_politically_exposed,
                    step_completed = GREATEST(onboarding_applications.step_completed, 4),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, firebase_uid, savings, assets, source_of_funds,
                        expected_account_activity, is_politically_exposed,
                        step_completed, created_at, updated_at;
            """, (
                firebase_uid, savings, assets, source_of_funds, 
                expected_account_activity, is_politically_exposed, 4
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to save Step 4 data: {e}")
            return False, str(e)

    @staticmethod
    def get_step4_data(firebase_uid):
        """Get Step 4 onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, firebase_uid, savings, assets, source_of_funds,
                    expected_account_activity, is_politically_exposed,
                    step_completed, is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return True, dict(result)
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get Step 4 data: {e}")
            return False, str(e)

    @staticmethod
    def save_step5_data(firebase_uid, step5_data):
        """Save or update Step 5 onboarding data."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            # Prepare the data
            loan_amount = step5_data.get('loanAmount')
            loan_purpose = step5_data.get('loanPurpose')
            loan_term = step5_data.get('loanTerm')
            understands_terms = step5_data.get('understandsTerms', False)
            can_afford_repayments = step5_data.get('canAffordRepayments', False)
            has_received_advice = step5_data.get('hasReceivedAdvice', False)
            
            # Use UPSERT to handle both insert and update
            cursor.execute("""
                INSERT INTO onboarding_applications (
                    firebase_uid, loan_amount, loan_purpose, loan_term,
                    understands_terms, can_afford_repayments, has_received_advice, step_completed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (firebase_uid) 
                DO UPDATE SET
                    loan_amount = EXCLUDED.loan_amount,
                    loan_purpose = EXCLUDED.loan_purpose,
                    loan_term = EXCLUDED.loan_term,
                    understands_terms = EXCLUDED.understands_terms,
                    can_afford_repayments = EXCLUDED.can_afford_repayments,
                    has_received_advice = EXCLUDED.has_received_advice,
                    step_completed = GREATEST(onboarding_applications.step_completed, 5),
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, firebase_uid, loan_amount, loan_purpose, loan_term,
                        understands_terms, can_afford_repayments, has_received_advice,
                        step_completed, created_at, updated_at;
            """, (
                firebase_uid, loan_amount, loan_purpose, loan_term,
                understands_terms, can_afford_repayments, has_received_advice, 5
            ))
            
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, dict(result)
            
        except Exception as e:
            logger.error(f"Failed to save Step 5 data: {e}")
            return False, str(e)

    @staticmethod
    def get_step5_data(firebase_uid):
        """Get Step 5 onboarding data for a user."""
        try:
            conn = DatabaseService.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, firebase_uid, loan_amount, loan_purpose, loan_term,
                    understands_terms, can_afford_repayments, has_received_advice,
                    step_completed, is_completed, created_at, updated_at
                FROM onboarding_applications 
                WHERE firebase_uid = %s
            """, (firebase_uid,))
            
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if result:
                return True, dict(result)
            else:
                return True, None
                
        except Exception as e:
            logger.error(f"Failed to get Step 5 data: {e}")
            return False, str(e)