from flask import Flask, jsonify, request
from transformers import pipeline
from PIL import Image
from io import BytesIO
import os

pipeImageToText = pipeline("image-text-to-text", model="Qwen/Qwen3.5-0.8B")

app = Flask("Dash")

@app.route("/main/upload", methods=["POST"])
def upload_image():
    try:
        # Check if image file is in request
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files["image"]
        
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        
        # Get optional prompt from request
        prompt = request.form.get("prompt", "What is in this image?")
        
        # Read image file
        image = Image.open(file.stream)
        
        # Prepare messages for the model
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]
            },
        ]
        
        # Process through pipeline
        result = pipeImageToText(text=messages)
        
        return jsonify({"response": result}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/1")
def example():
    pass

@app.route("/2")
def example():
    pass

@app.route("/3")
def example():
    pass

@app.route("/4")
def example():
    pass

@app.route("/5")
def example():
    pass

@app.route("/6")
def example():
    pass

if __name__ == "__main__":
    app.run(debug=True)