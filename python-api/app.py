from flask import Flask, request, jsonify
import os
import cv2
import numpy as np

app = Flask(__name__)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
face_cascade_alt = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml')

hog = cv2.HOGDescriptor(
    _winSize=(64, 128),
    _blockSize=(16, 16),
    _blockStride=(8, 8),
    _cellSize=(8, 8),
    _nbins=9
)

import base64

def extract_hog_encoding(image_b64):
    image_data = base64.b64decode(image_b64.split(',')[-1])
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not read image file.")
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_eq = cv2.equalizeHist(gray)
    
    # Detect faces with equalized image
    faces = face_cascade.detectMultiScale(gray_eq, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30))
    
    if len(faces) == 0:
        # Fallback to alt2
        faces = face_cascade_alt.detectMultiScale(gray_eq, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30))
        
    if len(faces) == 0:
        # Fallback without equalization
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30))
        
    if len(faces) == 0:
        raise ValueError("No face detected in the image.")
        
    # Take the largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi = gray[y:y+h, x:x+w]
    
    # Format for HOG
    face_resized = cv2.resize(face_roi, (64, 128))
    
    # Compute HOG descriptor
    descriptor = hog.compute(face_resized)
    
    # Flatten and normalize
    vector = descriptor.flatten()
    vector = vector / (np.linalg.norm(vector) + 1e-6)
    
    return vector.tolist()

@app.route('/', methods=['GET'])
def index():
    return jsonify({"status": "Python API is running! 🐍"})

@app.route('/encode', methods=['POST'])
def encode_face():
    data = request.json
    image_b64 = data.get('image_b64')

    if not image_b64:
        return jsonify({'error': 'Image data not found'}), 400

    try:
        embedding = extract_hog_encoding(image_b64)
        return jsonify({'encoding': embedding})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recognize', methods=['POST'])
def recognize_face():
    data = request.json
    image_b64 = data.get('image_b64')

    if not image_b64:
        return jsonify({'error': 'Image data not found'}), 400

    try:
        embedding = extract_hog_encoding(image_b64)
        return jsonify({'encoding': embedding})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
