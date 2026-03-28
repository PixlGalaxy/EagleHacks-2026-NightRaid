from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import psutil
import os
import requests
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

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

# Ollama Configuration
OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', '')
OLLAMA_API_KEY = os.environ.get('OLLAMA_API_KEY', '')
OLLAMA_TIMEOUT = 120 ##seconds


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
            'health': '/health',
            'ollama_generate': '/ollama/generate',
            'ollama_models': '/ollama/models'
        }
    }), 200


@app.route('/ollama/generate', methods=['POST'])
def ollama_generate():
    """
    Generate text using Ollama model.
    Expects JSON: {'prompt': 'your prompt here', 'model': 'optional_model_name'}
    """
    if not OLLAMA_AVAILABLE:
        return jsonify({
            'status': 'error',
            'message': 'Ollama library not installed'
        }), 503
    
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: prompt'
            }), 400
        
        prompt = data.get('prompt')
        model = data.get('model', OLLAMA_MODEL)
        
        # Call Ollama API
        response = requests.post(
            f'{OLLAMA_BASE_URL}/api/generate',
            json={
                'model': model,
                'prompt': prompt,
                'stream': False
            },
            timeout=OLLAMA_TIMEOUT
        )
        
        if response.status_code != 200:
            return jsonify({
                'status': 'error',
                'message': f'Ollama API error: {response.text}'
            }), response.status_code
        
        result = response.json()
        
        return jsonify({
            'status': 'success',
            'model': model,
            'prompt': prompt,
            'response': result.get('response', ''),
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except requests.exceptions.ConnectionError:
        return jsonify({
            'status': 'error',
            'message': f'Could not connect to Ollama at {OLLAMA_BASE_URL}. Make sure Ollama is running.'
        }), 503
    except requests.exceptions.Timeout:
        return jsonify({
            'status': 'error',
            'message': 'Ollama request timeout. The model may be processing too long.'
        }), 504
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/ollama/models', methods=['GET'])
def ollama_models():
    """
    Get list of available Ollama models.
    """
    try:
        response = requests.get(
            f'{OLLAMA_BASE_URL}/api/tags',
            timeout=10
        )
        
        if response.status_code != 200:
            return jsonify({
                'status': 'error',
                'message': 'Could not fetch models from Ollama'
            }), response.status_code
        
        result = response.json()
        models = result.get('models', [])
        
        return jsonify({
            'status': 'success',
            'models': [m.get('name') for m in models],
            'count': len(models),
            'default_model': OLLAMA_MODEL,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    except requests.exceptions.ConnectionError:
        return jsonify({
            'status': 'error',
            'message': f'Could not connect to Ollama at {OLLAMA_BASE_URL}. Make sure Ollama is running.'
        }), 503
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

################################################################################################################
##APP

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)
