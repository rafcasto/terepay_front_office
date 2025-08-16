from app import create_app
import os
import ssl

app = create_app()

if __name__ == '__main__':
    port = app.config['PORT']
    debug = app.config['DEBUG']
    
    ssl_context = None
    if app.config.get('USE_SSL'):
        cert_path = app.config.get('SSL_CERT_PATH')
        key_path = app.config.get('SSL_KEY_PATH')
        
        if cert_path and key_path:
            ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            ssl_context.load_cert_chain(cert_path, key_path)
            print(f"SSL enabled with certificate: {cert_path}")
        else:
            # Development self-signed certificate
            ssl_context = 'adhoc'
            print("Using self-signed certificate for development")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        ssl_context=ssl_context
    )