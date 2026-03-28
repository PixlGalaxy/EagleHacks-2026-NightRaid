from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import psutil
import os

app = Flask(__name__)

################################################################################################################
##CORS
cors_config = {
    "origins": os.environ.get('CORS_ORIGINS', '*').split(','),
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True,
    "max_age": 3600
}
CORS(app, resources={r"/api/*": cors_config, r"/uptime": cors_config, r"/health": cors_config})

################################################################################################################
##VARIABLES
server_start_time = datetime.now()


################################################################################################################
##ROUTES

@app.route('/uptime', methods=['GET'])
def uptime():
    """
    Returns the server uptime status and system information.
    """
    try:
        current_time = datetime.now()
        uptime_delta = current_time - server_start_time
        
        total_seconds = int(uptime_delta.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        
        response = {
            'status': 'online',
            'timestamp': current_time.isoformat(),
            'server_start_time': server_start_time.isoformat(),
            'uptime': {
                'total_seconds': total_seconds,
                'formatted': f'{hours}h {minutes}m {seconds}s'
            },
            'system': {
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory_info.percent,
                'memory_available_mb': memory_info.available / (1024 * 1024)
            },
            'service': 'NightRaid Backend API'
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """
    Simple health check endpoint.
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint with basic information.
    """
    return jsonify({
        'message': 'Welcome to NightRaid Backend API',
        'version': '0.1.0',
        'endpoints': {
            'uptime': '/uptime',
            'health': '/health'
        }
    }), 200

################################################################################################################
##APP

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
