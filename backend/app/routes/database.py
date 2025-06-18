from flask import Blueprint, request
from ..services.database_service import DatabaseService
from ..utils.responses import success_response, error_response

db_bp = Blueprint('database', __name__, url_prefix='/db')

@db_bp.route('/test', methods=['GET'])
def test_database_connection():
    """Test database connection endpoint."""
    try:
        success, result = DatabaseService.test_connection()
        
        if success:
            return success_response(
                {
                    'connection_status': 'connected',
                    'database_version': result.get('version', 'Unknown')
                },
                "Database connection successful"
            )
        else:
            return error_response(
                f"Database connection failed: {result}",
                500,
                'DATABASE_CONNECTION_ERROR'
            )
    except Exception as e:
        return error_response(
            f"Database test failed: {str(e)}",
            500,
            'DATABASE_TEST_ERROR'
        )

@db_bp.route('/info', methods=['GET'])
def get_database_info():
    """Get database information."""
    try:
        success, result = DatabaseService.get_database_info()
        
        if success:
            return success_response(result, "Database information retrieved successfully")
        else:
            return error_response(
                f"Failed to get database info: {result}",
                500,
                'DATABASE_INFO_ERROR'
            )
    except Exception as e:
        return error_response(
            f"Database info retrieval failed: {str(e)}",
            500,
            'DATABASE_INFO_ERROR'
        )

@db_bp.route('/create-test-table', methods=['POST'])
def create_test_table():
    """Create test table."""
    try:
        success, result = DatabaseService.create_test_table()
        
        if success:
            return success_response(
                {'table_status': 'created'},
                result
            )
        else:
            return error_response(
                f"Failed to create test table: {result}",
                500,
                'TABLE_CREATION_ERROR'
            )
    except Exception as e:
        return error_response(
            f"Table creation failed: {str(e)}",
            500,
            'TABLE_CREATION_ERROR'
        )

@db_bp.route('/test-data', methods=['POST'])
def insert_test_data():
    """Insert test data."""
    try:
        data = request.get_json() or {}
        message = data.get('message', 'Test message from Flask API')
        
        success, result = DatabaseService.insert_test_data(message)
        
        if success:
            return success_response(result, "Test data inserted successfully")
        else:
            return error_response(
                f"Failed to insert test data: {result}",
                500,
                'DATA_INSERT_ERROR'
            )
    except Exception as e:
        return error_response(
            f"Data insertion failed: {str(e)}",
            500,
            'DATA_INSERT_ERROR'
        )

@db_bp.route('/test-data', methods=['GET'])
def get_test_data():
    """Get test data."""
    try:
        success, result = DatabaseService.get_test_data()
        
        if success:
            return success_response(
                {'records': result, 'count': len(result)},
                "Test data retrieved successfully"
            )
        else:
            return error_response(
                f"Failed to get test data: {result}",
                500,
                'DATA_RETRIEVAL_ERROR'
            )
    except Exception as e:
        return error_response(
            f"Data retrieval failed: {str(e)}",
            500,
            'DATA_RETRIEVAL_ERROR'
        )

@db_bp.route('/full-test', methods=['POST'])
def full_database_test():
    """Comprehensive database test."""
    try:
        test_results = {}
        
        # Test 1: Connection test
        success, result = DatabaseService.test_connection()
        test_results['connection_test'] = {
            'success': success,
            'result': result.get('version', 'Unknown') if success else result
        }
        
        if not success:
            return error_response(
                "Database connection failed",
                500,
                'DATABASE_CONNECTION_ERROR'
            )
        
        # Test 2: Create test table
        success, result = DatabaseService.create_test_table()
        test_results['table_creation'] = {
            'success': success,
            'result': result
        }
        
        # Test 3: Insert test data
        if success:
            success, result = DatabaseService.insert_test_data('Full test message')
            test_results['data_insertion'] = {
                'success': success,
                'result': result
            }
        
        # Test 4: Retrieve test data
        if success:
            success, result = DatabaseService.get_test_data()
            test_results['data_retrieval'] = {
                'success': success,
                'result': f"Retrieved {len(result)} records" if success else result
            }
        
        # Test 5: Database info
        success, result = DatabaseService.get_database_info()
        test_results['database_info'] = {
            'success': success,
            'result': result
        }
        
        overall_success = all(test['success'] for test in test_results.values())
        
        return success_response(
            test_results,
            "Full database test completed" + (" successfully" if overall_success else " with some failures")
        )
        
    except Exception as e:
        return error_response(
            f"Full database test failed: {str(e)}",
            500,
            'FULL_DATABASE_TEST_ERROR'
        )