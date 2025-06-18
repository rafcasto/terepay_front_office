from functools import wraps
from flask import request, jsonify, current_app
from firebase_admin import auth
from ..services.firebase_service import FirebaseService
from ..utils.responses import error_response

def require_auth(f):
    """Middleware decorator to verify Firebase token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return error_response('No authorization header provided', 401)
        
        try:
            # Extract token (format: "Bearer <token>")
            token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
            
            # Verify the token with Firebase
            decoded_token, error = FirebaseService.verify_token(token)
            
            if error:
                return error_response(f'Invalid token: {error}', 401)
            
            # Add user info to request context
            request.user = decoded_token
            
        except IndexError:
            return error_response('Invalid authorization header format', 401)
        except Exception as e:
            return error_response(f'Authentication failed: {str(e)}', 401)
        
        return f(*args, **kwargs)
    
    return decorated_function

def verify_firebase_token(f):
    """Decorator to verify Firebase ID token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'success': False,
                'message': 'Authorization header is required',
                'error_code': 'MISSING_AUTH_HEADER'
            }), 401
        
        # Extract the token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({
                'success': False,
                'message': 'Invalid authorization header format',
                'error_code': 'INVALID_AUTH_FORMAT'
            }), 401
        
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(token)
            
            # Add user info to request context
            request.firebase_user = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False)
            }
            
            return f(*args, **kwargs)
            
        except auth.InvalidIdTokenError:
            return jsonify({
                'success': False,
                'message': 'Invalid ID token',
                'error_code': 'INVALID_TOKEN'
            }), 401
        except auth.ExpiredIdTokenError:
            return jsonify({
                'success': False,
                'message': 'ID token has expired',
                'error_code': 'EXPIRED_TOKEN'
            }), 401
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return jsonify({
                'success': False,
                'message': 'Token verification failed',
                'error_code': 'TOKEN_VERIFICATION_ERROR'
            }), 401
    
    return decorated_function