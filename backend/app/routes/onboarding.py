# Create new file: backend/app/routes/onboarding.py

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