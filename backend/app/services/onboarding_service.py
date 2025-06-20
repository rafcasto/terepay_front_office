# backend/app/services/onboarding_service.py
import logging
from datetime import datetime
from ..services.database_service import DatabaseService

logger = logging.getLogger(__name__)

class OnboardingService:
    """Optimized onboarding service using connection pooling."""
    
    @staticmethod
    def _format_date_for_frontend(date_obj):
        """Convert date object to frontend format."""
        if not date_obj:
            return None
        return date_obj.strftime('%Y-%m-%d') if hasattr(date_obj, 'strftime') else str(date_obj)
    
    # ==========================================================================
    # STEP 1: PERSONAL INFORMATION
    # ==========================================================================
    
    @staticmethod
    def save_step1_data(firebase_uid, step1_data):
        """Save or update Step 1 onboarding data."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 1 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step1_data(firebase_uid):
        """Get Step 1 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                if result:
                    data = dict(result)
                    # Convert date to string format for frontend
                    if data['date_of_birth']:
                        data['date_of_birth'] = OnboardingService._format_date_for_frontend(data['date_of_birth'])
                    
                    return True, data
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 1 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # STEP 2: EMPLOYMENT & INCOME
    # ==========================================================================
    
    @staticmethod
    def save_step2_data(firebase_uid, step2_data):
        """Save or update Step 2 onboarding data."""
        try:
            with DatabaseService.get_connection() as conn:
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
                            step_completed, is_completed, created_at, updated_at;
                """, (
                    firebase_uid, employment_type, employer, job_title,
                    employment_duration, monthly_income, other_income, 2
                ))
                
                result = cursor.fetchone()
                conn.commit()
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 2 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step2_data(firebase_uid):
        """Get Step 2 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                if result:
                    return True, dict(result)
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 2 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # STEP 3: EXPENSES & OBLIGATIONS
    # ==========================================================================
    
    @staticmethod
    def save_step3_data(firebase_uid, step3_data):
        """Save or update Step 3 onboarding data."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 3 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step3_data(firebase_uid):
        """Get Step 3 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT 
                        id, firebase_uid, rent, monthly_expenses, debts, dependents,
                        step_completed, is_completed, created_at, updated_at
                    FROM onboarding_applications 
                    WHERE firebase_uid = %s
                """, (firebase_uid,))
                
                result = cursor.fetchone()
                
                if result:
                    return True, dict(result)
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 3 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # STEP 4: ASSETS & FINANCIAL PROFILE  
    # ==========================================================================
    
    @staticmethod
    def save_step4_data(firebase_uid, step4_data):
        """Save or update Step 4 onboarding data."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                # Prepare the data
                savings = step4_data.get('savings')
                assets = step4_data.get('assets')
                source_of_funds = step4_data.get('sourceOfFunds')
                expected_account_activity = step4_data.get('expectedAccountActivity')
                is_politically_exposed = step4_data.get('isPoliticallyExposed', False)
                
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
                            step_completed, is_completed, created_at, updated_at;
                """, (
                    firebase_uid, savings, assets, source_of_funds,
                    expected_account_activity, is_politically_exposed, 4
                ))
                
                result = cursor.fetchone()
                conn.commit()
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 4 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step4_data(firebase_uid):
        """Get Step 4 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                if result:
                    return True, dict(result)
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 4 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # STEP 5: LOAN REQUEST
    # ==========================================================================
    
    @staticmethod
    def save_step5_data(firebase_uid, step5_data):
        """Save or update Step 5 onboarding data."""
        try:
            with DatabaseService.get_connection() as conn:
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
                            step_completed, is_completed, created_at, updated_at;
                """, (
                    firebase_uid, loan_amount, loan_purpose, loan_term,
                    understands_terms, can_afford_repayments, has_received_advice, 5
                ))
                
                result = cursor.fetchone()
                conn.commit()
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 5 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step5_data(firebase_uid):
        """Get Step 5 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
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
                
                if result:
                    return True, dict(result)
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 5 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # STEP 6: DOCUMENTS & KYC
    # ==========================================================================
    
    @staticmethod
    def save_step6_data(firebase_uid, step6_data):
        """Save or update Step 6 onboarding data (document metadata only)."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                # Prepare the flattened document metadata
                identity_doc_name = step6_data.get('identityDocumentName')
                identity_doc_size = step6_data.get('identityDocumentSize')
                identity_doc_type = step6_data.get('identityDocumentType')
                
                address_proof_name = step6_data.get('addressProofName')
                address_proof_size = step6_data.get('addressProofSize')
                address_proof_type = step6_data.get('addressProofType')
                
                income_proof_name = step6_data.get('incomeProofName')
                income_proof_size = step6_data.get('incomeProofSize')
                income_proof_type = step6_data.get('incomeProofType')
                
                # Use UPSERT to handle both insert and update
                cursor.execute("""
                    INSERT INTO onboarding_applications (
                        firebase_uid, 
                        identity_document_name, identity_document_size, identity_document_type, identity_document_uploaded_at,
                        address_proof_name, address_proof_size, address_proof_type, address_proof_uploaded_at,
                        income_proof_name, income_proof_size, income_proof_type, income_proof_uploaded_at,
                        step_completed, is_completed
                    ) VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, %s, %s, %s, CURRENT_TIMESTAMP, %s, %s, %s, CURRENT_TIMESTAMP, %s, %s)
                    ON CONFLICT (firebase_uid) 
                    DO UPDATE SET
                        identity_document_name = EXCLUDED.identity_document_name,
                        identity_document_size = EXCLUDED.identity_document_size,
                        identity_document_type = EXCLUDED.identity_document_type,
                        identity_document_uploaded_at = CURRENT_TIMESTAMP,
                        address_proof_name = EXCLUDED.address_proof_name,
                        address_proof_size = EXCLUDED.address_proof_size,
                        address_proof_type = EXCLUDED.address_proof_type,
                        address_proof_uploaded_at = CURRENT_TIMESTAMP,
                        income_proof_name = EXCLUDED.income_proof_name,
                        income_proof_size = EXCLUDED.income_proof_size,
                        income_proof_type = EXCLUDED.income_proof_type,
                        income_proof_uploaded_at = CURRENT_TIMESTAMP,
                        step_completed = GREATEST(onboarding_applications.step_completed, 6),
                        is_completed = true,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id, firebase_uid, 
                            identity_document_name, identity_document_size, identity_document_type, identity_document_uploaded_at,
                            address_proof_name, address_proof_size, address_proof_type, address_proof_uploaded_at,
                            income_proof_name, income_proof_size, income_proof_type, income_proof_uploaded_at,
                            step_completed, is_completed, created_at, updated_at;
                """, (
                    firebase_uid, 
                    identity_doc_name, identity_doc_size, identity_doc_type,
                    address_proof_name, address_proof_size, address_proof_type,
                    income_proof_name, income_proof_size, income_proof_type,
                    6, True
                ))
                
                result = cursor.fetchone()
                conn.commit()
                
                return True, dict(result)
                
        except Exception as e:
            logger.error(f"Failed to save Step 6 data: {e}")
            return False, str(e)
    
    @staticmethod
    def get_step6_data(firebase_uid):
        """Get Step 6 onboarding data for a user."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT 
                        id, firebase_uid,
                        identity_document_name, identity_document_size, identity_document_type, identity_document_uploaded_at,
                        address_proof_name, address_proof_size, address_proof_type, address_proof_uploaded_at,
                        income_proof_name, income_proof_size, income_proof_type, income_proof_uploaded_at,
                        step_completed, is_completed, created_at, updated_at
                    FROM onboarding_applications 
                    WHERE firebase_uid = %s
                """, (firebase_uid,))
                
                result = cursor.fetchone()
                
                if result:
                    return True, dict(result)
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get Step 6 data: {e}")
            return False, str(e)
    
    # ==========================================================================
    # UTILITY METHODS
    # ==========================================================================
    
    @staticmethod
    def get_user_onboarding_status(firebase_uid):
        """Get user's onboarding completion status."""
        try:
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT step_completed, is_completed, created_at, updated_at
                    FROM onboarding_applications 
                    WHERE firebase_uid = %s;
                """, (firebase_uid,))
                
                result = cursor.fetchone()
                
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
            with DatabaseService.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT *
                    FROM onboarding_applications 
                    WHERE firebase_uid = %s;
                """, (firebase_uid,))
                
                result = cursor.fetchone()
                
                if result:
                    data = dict(result)
                    # Convert date to string format for frontend
                    if data.get('date_of_birth'):
                        data['date_of_birth'] = OnboardingService._format_date_for_frontend(data['date_of_birth'])
                    
                    return True, data
                else:
                    return True, None
                    
        except Exception as e:
            logger.error(f"Failed to get complete user data: {e}")
            return False, str(e)