from flask import Blueprint, request, jsonify
from ..services.onboarding_service import OnboardingService
from ..services.database_service import DatabaseService
from ..middleware.auth import verify_firebase_token
from ..utils.responses import success_response, error_response
import logging

logger = logging.getLogger(__name__)

onboarding_bp = Blueprint('onboarding', __name__, url_prefix='/api/onboarding')

@onboarding_bp.route('/step1', methods=['POST'])
@verify_firebase_token
def save_step1():
    """Save Step 1 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get JSON data from request
        step1_data = request.get_json()
        
        if not step1_data:
            return error_response(
                "No data provided",
                400,
                'NO_DATA'
            )
        
        # Validate required fields
        required_fields = ['fullName', 'dob', 'address', 'email', 'phoneNumber', 'nzResidencyStatus']
        missing_fields = [field for field in required_fields if not step1_data.get(field)]
        
        if missing_fields:
            return error_response(
                f"Missing required fields: {', '.join(missing_fields)}",
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        
        # Validate residency status
        valid_statuses = ['citizen', 'permanent_resident', 'temporary_resident', 'work_visa', 'student_visa']
        if step1_data.get('nzResidencyStatus') not in valid_statuses:
            return error_response(
                "Invalid residency status",
                400,
                'INVALID_RESIDENCY_STATUS'
            )
        
        # Save to database
        success, result = OnboardingService.save_step1_data(firebase_uid, step1_data)
        
        if success:
            return success_response(
                result,
                "Step 1 data saved successfully"
            )
        else:
            return error_response(
                f"Failed to save Step 1 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in save_step1: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step2', methods=['POST'])
@verify_firebase_token
def save_step2():
    """Save Step 2 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get JSON data from request
        step2_data = request.get_json()
        
        if not step2_data:
            return error_response(
                "No data provided",
                400,
                'NO_DATA'
            )
        
        # Validate required fields
        required_fields = ['employmentType']
        missing_fields = [field for field in required_fields if not step2_data.get(field)]
        
        if missing_fields:
            return error_response(
                f"Missing required fields: {', '.join(missing_fields)}",
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        
        # Validate employment type
        valid_employment_types = ['full_time', 'part_time', 'self_employed', 'contract', 'casual', 'unemployed', 'retired', 'student']
        if step2_data.get('employmentType') not in valid_employment_types:
            return error_response(
                "Invalid employment type",
                400,
                'INVALID_EMPLOYMENT_TYPE'
            )
        
        # Validate employment duration if provided
        if step2_data.get('employmentDuration'):
            valid_durations = ['less_than_3_months', '3_to_6_months', '6_months_to_1_year', '1_to_2_years', '2_to_5_years', 'more_than_5_years']
            if step2_data.get('employmentDuration') not in valid_durations:
                return error_response(
                    "Invalid employment duration",
                    400,
                    'INVALID_EMPLOYMENT_DURATION'
                )
        
        # Business logic validation for employed individuals
        employment_type = step2_data.get('employmentType')
        if employment_type not in ['unemployed', 'retired']:
            # For employed individuals, require additional fields
            if not step2_data.get('employer'):
                return error_response(
                    "Employer name is required for employed individuals",
                    400,
                    'MISSING_EMPLOYER'
                )
            
            if not step2_data.get('jobTitle'):
                return error_response(
                    "Job title is required for employed individuals",
                    400,
                    'MISSING_JOB_TITLE'
                )
            
            if not step2_data.get('employmentDuration'):
                return error_response(
                    "Employment duration is required for employed individuals",
                    400,
                    'MISSING_EMPLOYMENT_DURATION'
                )
            
            if not step2_data.get('monthlyIncome') or step2_data.get('monthlyIncome') <= 0:
                return error_response(
                    "Monthly income is required and must be greater than 0 for employed individuals",
                    400,
                    'INVALID_MONTHLY_INCOME'
                )
        
        # For unemployed/retired, ensure they have some form of income
        if employment_type in ['unemployed', 'retired']:
            monthly_income = step2_data.get('monthlyIncome', 0)
            other_income = step2_data.get('otherIncome', 0)
            
            if monthly_income <= 0 and other_income <= 0:
                return error_response(
                    "Please specify your income source. Enter the amount in either monthly income or other income field.",
                    400,
                    'NO_INCOME_SPECIFIED'
                )
        
        # Save to database
        success, result = OnboardingService.save_step2_data(firebase_uid, step2_data)
        
        if success:
            # Transform database format to frontend format for response
            frontend_data = {
                'employmentType': result.get('employment_type'),
                'employer': result.get('employer'),
                'jobTitle': result.get('job_title'),
                'employmentDuration': result.get('employment_duration'),
                'monthlyIncome': float(result.get('monthly_income')) if result.get('monthly_income') else None,
                'otherIncome': float(result.get('other_income')) if result.get('other_income') else 0,
                'stepCompleted': result.get('step_completed', 2),
                'isCompleted': result.get('is_completed', False)
            }
            
            return success_response(
                frontend_data,
                "Step 2 data saved successfully"
            )
        else:
            return error_response(
                f"Failed to save Step 2 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in save_step2: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step1', methods=['GET'])
@verify_firebase_token
def get_step1():
    """Get Step 1 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        print("uid id " + firebase_uid)
        # Get data from database
        success, result = OnboardingService.get_step1_data(firebase_uid)
        
        if success:
            if result:
                # Transform database format to frontend format
                frontend_data = {
                    'fullName': result.get('full_name'),
                    'dob': result.get('date_of_birth'),
                    'address': result.get('address'),
                    'email': result.get('email'),
                    'phoneNumber': result.get('phone_number'),
                    'nzResidencyStatus': result.get('nz_residency_status'),
                    'taxNumber': result.get('tax_number'),
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(
                    frontend_data,
                    "Step 1 data retrieved successfully"
                )
            else:
                return success_response(
                    {},
                    "No Step 1 data found for user"
                )
        else:
            return error_response(
                f"Failed to retrieve Step 1 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in get_step1: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step2', methods=['GET'])
@verify_firebase_token
def get_step2():
    """Get Step 2 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get data from database
        success, result = OnboardingService.get_step2_data(firebase_uid)
        
        if success:
            if result:
                # Transform database format to frontend format
                frontend_data = {
                    'employmentType': result.get('employment_type'),
                    'employer': result.get('employer'),
                    'jobTitle': result.get('job_title'),
                    'employmentDuration': result.get('employment_duration'),
                    'monthlyIncome': float(result.get('monthly_income')) if result.get('monthly_income') else None,
                    'otherIncome': float(result.get('other_income')) if result.get('other_income') else 0,
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(
                    frontend_data,
                    "Step 2 data retrieved successfully"
                )
            else:
                return success_response(
                    {},
                    "No Step 2 data found for user"
                )
        else:
            return error_response(
                f"Failed to retrieve Step 2 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in get_step2: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/status', methods=['GET'])
@verify_firebase_token
def get_onboarding_status():
    """Get user's onboarding status."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get status from database
        success, result = OnboardingService.get_user_onboarding_status(firebase_uid)
        
        if success:
            return success_response(
                result,
                "Onboarding status retrieved successfully"
            )
        else:
            return error_response(
                f"Failed to retrieve onboarding status: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in get_onboarding_status: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/initialize', methods=['POST'])
@verify_firebase_token  
def initialize_onboarding():
    """Initialize onboarding for a user (create tables if needed)."""
    try:
        # Create tables
        success, message = DatabaseService.test_connection()
        
        if success:
            return success_response(
                {'tables_created': True},
                message
            )
        else:
            return error_response(
                f"Failed to initialize onboarding: {message}",
                500,
                'INITIALIZATION_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in initialize_onboarding: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step3', methods=['POST'])
@verify_firebase_token
def save_step3():
    """Save Step 3 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get JSON data from request
        step3_data = request.get_json()
        
        if not step3_data:
            return error_response(
                "No data provided",
                400,
                'NO_DATA'
            )
        
        # Validate required fields
        required_fields = ['rent', 'monthlyExpenses', 'debts', 'dependents']
        missing_fields = []
        
        for field in required_fields:
            value = step3_data.get(field)
            if value is None:
                missing_fields.append(field)
        
        if missing_fields:
            return error_response(
                f"Missing required fields: {', '.join(missing_fields)}",
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        
        # Validate numeric fields
        numeric_fields = ['rent', 'monthlyExpenses', 'debts', 'dependents']
        for field in numeric_fields:
            value = step3_data.get(field)
            if value is not None and not isinstance(value, (int, float)):
                return error_response(
                    f"Field '{field}' must be a number",
                    400,
                    'INVALID_FIELD_TYPE'
                )
            
            # Validate ranges
            if field == 'rent' and value is not None and (value < 0 or value > 10000):
                return error_response(
                    "Rent must be between 0 and 10,000",
                    400,
                    'INVALID_RENT_AMOUNT'
                )
            elif field == 'monthlyExpenses' and value is not None and (value < 0 or value > 20000):
                return error_response(
                    "Monthly expenses must be between 0 and 20,000",
                    400,
                    'INVALID_EXPENSES_AMOUNT'
                )
            elif field == 'debts' and value is not None and (value < 0 or value > 500000):
                return error_response(
                    "Debts must be between 0 and 500,000",
                    400,
                    'INVALID_DEBTS_AMOUNT'
                )
            elif field == 'dependents' and value is not None and (value < 0 or value > 10):
                return error_response(
                    "Dependents must be between 0 and 10",
                    400,
                    'INVALID_DEPENDENTS_COUNT'
                )
        
        # Save to database
        success, result = OnboardingService.save_step3_data(firebase_uid, step3_data)
        
        if success:
            # Transform database format to frontend format for response
            frontend_data = {
                'rent': float(result.get('rent')) if result.get('rent') is not None else None,
                'monthlyExpenses': float(result.get('monthly_expenses')) if result.get('monthly_expenses') is not None else None,
                'debts': float(result.get('debts')) if result.get('debts') is not None else None,
                'dependents': int(result.get('dependents')) if result.get('dependents') is not None else None,
                'stepCompleted': result.get('step_completed', 3),
                'isCompleted': result.get('is_completed', False)
            }
            
            return success_response(
                frontend_data,
                "Step 3 data saved successfully"
            )
        else:
            return error_response(
                f"Failed to save Step 3 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in save_step3: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step3', methods=['GET'])
@verify_firebase_token
def get_step3():
    """Get Step 3 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get data from database
        success, result = OnboardingService.get_step3_data(firebase_uid)
        
        if success:
            if result:
                # Transform database format to frontend format
                frontend_data = {
                    'rent': float(result.get('rent')) if result.get('rent') is not None else None,
                    'monthlyExpenses': float(result.get('monthly_expenses')) if result.get('monthly_expenses') is not None else None,
                    'debts': float(result.get('debts')) if result.get('debts') is not None else None,
                    'dependents': int(result.get('dependents')) if result.get('dependents') is not None else None,
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(
                    frontend_data,
                    "Step 3 data retrieved successfully"
                )
            else:
                return success_response(
                    {},
                    "No Step 3 data found for user"
                )
        else:
            return error_response(
                f"Failed to retrieve Step 3 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in get_step3: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )
    
# Add these routes to your existing onboarding.py in backend/app/routes/onboarding.py

@onboarding_bp.route('/step4', methods=['POST'])
@verify_firebase_token
def save_step4():
    """Save Step 4 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get JSON data from request
        step4_data = request.get_json()
        
        if not step4_data:
            return error_response("No data provided", 400, 'NO_DATA')
        
        # Save to database
        success, result = OnboardingService.save_step4_data(firebase_uid, step4_data)
        
        if success:
            # Transform database format to frontend format for response
            frontend_data = {
                'savings': float(result.get('savings')) if result.get('savings') else None,
                'assets': float(result.get('assets')) if result.get('assets') else None,
                'sourceOfFunds': result.get('source_of_funds'),
                'expectedAccountActivity': result.get('expected_account_activity'),
                'isPoliticallyExposed': result.get('is_politically_exposed', False),
                'stepCompleted': result.get('step_completed', 4),
                'isCompleted': result.get('is_completed', False)
            }
            
            return success_response(frontend_data, "Step 4 data saved successfully")
        else:
            return error_response(f"Failed to save Step 4 data: {result}", 500, 'DATABASE_ERROR')
            
    except Exception as e:
        logger.error(f"Error in save_step4: {e}")
        return error_response("Internal server error", 500, 'INTERNAL_ERROR')

@onboarding_bp.route('/step4', methods=['GET'])
@verify_firebase_token
def get_step4():
    """Get Step 4 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get data from database
        success, result = OnboardingService.get_step4_data(firebase_uid)
        
        if success:
            if result:
                # Transform database format to frontend format
                frontend_data = {
                    'savings': float(result.get('savings')) if result.get('savings') else None,
                    'assets': float(result.get('assets')) if result.get('assets') else None,
                    'sourceOfFunds': result.get('source_of_funds'),
                    'expectedAccountActivity': result.get('expected_account_activity'),
                    'isPoliticallyExposed': result.get('is_politically_exposed', False),
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(frontend_data, "Step 4 data retrieved successfully")
            else:
                return success_response({}, "No Step 4 data found for user")
        else:
            return error_response(f"Failed to retrieve Step 4 data: {result}", 500, 'DATABASE_ERROR')
            
    except Exception as e:
        logger.error(f"Error in get_step4: {e}")
        return error_response("Internal server error", 500, 'INTERNAL_ERROR')
    
@onboarding_bp.route('/step5', methods=['POST'])
@verify_firebase_token
def save_step5():
    """Save Step 5 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get JSON data from request
        step5_data = request.get_json()
        
        if not step5_data:
            return error_response(
                "No data provided",
                400,
                'NO_DATA'
            )
        
        # Validate required fields
        required_fields = ['loanAmount', 'loanPurpose']
        missing_fields = []
        
        for field in required_fields:
            value = step5_data.get(field)
            if value is None or value == '':
                missing_fields.append(field)
        
        if missing_fields:
            return error_response(
                f"Missing required fields: {', '.join(missing_fields)}",
                400,
                'MISSING_REQUIRED_FIELDS'
            )
        
        # Validate loan amount
        loan_amount = step5_data.get('loanAmount')
        if loan_amount is not None:
            if not isinstance(loan_amount, (int, float)) or loan_amount < 100 or loan_amount > 2000:
                return error_response(
                    "Loan amount must be between $100 and $2,000",
                    400,
                    'INVALID_LOAN_AMOUNT'
                )
        
        # Validate boolean declarations
        declarations = ['understandsTerms', 'canAffordRepayments', 'hasReceivedAdvice']
        for declaration in declarations:
            value = step5_data.get(declaration, False)
            if not value:
                return error_response(
                    f"All responsible lending declarations must be acknowledged",
                    400,
                    'MISSING_DECLARATIONS'
                )
        
        # Save to database
        success, result = OnboardingService.save_step5_data(firebase_uid, step5_data)
        
        if success:
            # Transform database format to frontend format for response
            frontend_data = {
                'loanAmount': float(result.get('loan_amount')) if result.get('loan_amount') else None,
                'loanPurpose': result.get('loan_purpose'),
                'loanTerm': result.get('loan_term'),
                'understandsTerms': result.get('understands_terms', False),
                'canAffordRepayments': result.get('can_afford_repayments', False),
                'hasReceivedAdvice': result.get('has_received_advice', False),
                'stepCompleted': result.get('step_completed', 5),
                'isCompleted': result.get('is_completed', False)
            }
            
            return success_response(
                frontend_data,
                "Step 5 data saved successfully"
            )
        else:
            return error_response(
                f"Failed to save Step 5 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in save_step5: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )

@onboarding_bp.route('/step5', methods=['GET'])
@verify_firebase_token
def get_step5():
    """Get Step 5 onboarding data."""
    try:
        # Get user ID from Firebase token
        firebase_uid = request.firebase_user['uid']
        
        # Get data from database
        success, result = OnboardingService.get_step5_data(firebase_uid)
        
        if success:
            if result:
                # Transform database format to frontend format
                frontend_data = {
                    'loanAmount': float(result.get('loan_amount')) if result.get('loan_amount') else None,
                    'loanPurpose': result.get('loan_purpose'),
                    'loanTerm': result.get('loan_term'),
                    'understandsTerms': result.get('understands_terms', False),
                    'canAffordRepayments': result.get('can_afford_repayments', False),
                    'hasReceivedAdvice': result.get('has_received_advice', False),
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(
                    frontend_data,
                    "Step 5 data retrieved successfully"
                )
            else:
                return success_response(
                    {},
                    "No Step 5 data found for user"
                )
        else:
            return error_response(
                f"Failed to retrieve Step 5 data: {result}",
                500,
                'DATABASE_ERROR'
            )
            
    except Exception as e:
        logger.error(f"Error in get_step5: {e}")
        return error_response(
            "Internal server error",
            500,
            'INTERNAL_ERROR'
        )
    

@onboarding_bp.route('/step6', methods=['POST'])
@verify_firebase_token
def save_step6():
    """Save Step 6 onboarding data (document metadata only)."""
    try:
        firebase_uid = request.firebase_user['uid']
        step6_data = request.get_json()
        
        if not step6_data:
            return error_response("No data provided", 400, 'NO_DATA')
        
        # Validate that all required document fields are provided
        required_fields = [
            'identityDocumentName', 'identityDocumentSize', 'identityDocumentType',
            'addressProofName', 'addressProofSize', 'addressProofType',
            'incomeProofName', 'incomeProofSize', 'incomeProofType'
        ]
        missing_fields = [field for field in required_fields if not step6_data.get(field)]
        
        if missing_fields:
            return error_response(f"Missing required fields: {', '.join(missing_fields)}", 400, 'MISSING_REQUIRED_FIELDS')
        
        # Save to database
        success, result = OnboardingService.save_step6_data(firebase_uid, step6_data)
        
        if success:
            frontend_data = {
                'identityDocumentName': result.get('identity_document_name'),
                'identityDocumentSize': result.get('identity_document_size'),
                'identityDocumentType': result.get('identity_document_type'),
                'identityDocumentUploadedAt': result.get('identity_document_uploaded_at').isoformat() if result.get('identity_document_uploaded_at') else None,
                'addressProofName': result.get('address_proof_name'),
                'addressProofSize': result.get('address_proof_size'),
                'addressProofType': result.get('address_proof_type'),
                'addressProofUploadedAt': result.get('address_proof_uploaded_at').isoformat() if result.get('address_proof_uploaded_at') else None,
                'incomeProofName': result.get('income_proof_name'),
                'incomeProofSize': result.get('income_proof_size'),
                'incomeProofType': result.get('income_proof_type'),
                'incomeProofUploadedAt': result.get('income_proof_uploaded_at').isoformat() if result.get('income_proof_uploaded_at') else None,
                'stepCompleted': result.get('step_completed', 0),
                'isCompleted': result.get('is_completed', False)
            }
            
            return success_response(frontend_data, "Step 6 data saved successfully")
        else:
            return error_response(f"Failed to save Step 6 data: {result}", 500, 'DATABASE_ERROR')
            
    except Exception as e:
        logger.error(f"Error in save_step6: {e}")
        return error_response("Internal server error", 500, 'INTERNAL_ERROR')

@onboarding_bp.route('/step6', methods=['GET'])
@verify_firebase_token
def get_step6():
    """Get Step 6 onboarding data."""
    try:
        firebase_uid = request.firebase_user['uid']
        success, result = OnboardingService.get_step6_data(firebase_uid)
        
        if success:
            if result:
                frontend_data = {
                    'identityDocumentName': result.get('identity_document_name'),
                    'identityDocumentSize': result.get('identity_document_size'),
                    'identityDocumentType': result.get('identity_document_type'),
                    'identityDocumentUploadedAt': result.get('identity_document_uploaded_at').isoformat() if result.get('identity_document_uploaded_at') else None,
                    'addressProofName': result.get('address_proof_name'),
                    'addressProofSize': result.get('address_proof_size'),
                    'addressProofType': result.get('address_proof_type'),
                    'addressProofUploadedAt': result.get('address_proof_uploaded_at').isoformat() if result.get('address_proof_uploaded_at') else None,
                    'incomeProofName': result.get('income_proof_name'),
                    'incomeProofSize': result.get('income_proof_size'),
                    'incomeProofType': result.get('income_proof_type'),
                    'incomeProofUploadedAt': result.get('income_proof_uploaded_at').isoformat() if result.get('income_proof_uploaded_at') else None,
                    'stepCompleted': result.get('step_completed', 0),
                    'isCompleted': result.get('is_completed', False)
                }
                
                return success_response(frontend_data, "Step 6 data retrieved successfully")
            else:
                return success_response({}, "No Step 6 data found for user")
        else:
            return error_response(f"Failed to retrieve Step 6 data: {result}", 500, 'DATABASE_ERROR')
            
    except Exception as e:
        logger.error(f"Error in get_step6: {e}")
        return error_response("Internal server error", 500, 'INTERNAL_ERROR')