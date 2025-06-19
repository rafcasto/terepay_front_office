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