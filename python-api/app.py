from flask import Flask, request, jsonify
import os
import base64

app = Flask(__name__)

_cv_models = None


def get_cv_models():
    global _cv_models
    if _cv_models is not None:
        return _cv_models

    import cv2
    import numpy as np

    if not hasattr(cv2, 'CascadeClassifier'):
        raise RuntimeError(
            'OpenCV is not installed correctly. CascadeClassifier is unavailable.'
        )

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    face_cascade_alt = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
    )
    hog = cv2.HOGDescriptor(
        _winSize=(64, 128),
        _blockSize=(16, 16),
        _blockStride=(8, 8),
        _cellSize=(8, 8),
        _nbins=9,
    )

    _cv_models = {
        'cv2': cv2,
        'np': np,
        'face_cascade': face_cascade,
        'face_cascade_alt': face_cascade_alt,
        'hog': hog,
    }
    return _cv_models


def extract_hog_encoding(image_b64):
    models = get_cv_models()
    cv2 = models['cv2']
    np = models['np']
    face_cascade = models['face_cascade']
    face_cascade_alt = models['face_cascade_alt']
    hog = models['hog']

    image_data = base64.b64decode(image_b64.split(',')[-1])
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Could not read image file.')

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_eq = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray_eq, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30)
    )

    if len(faces) == 0:
        faces = face_cascade_alt.detectMultiScale(
            gray_eq, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30)
        )

    if len(faces) == 0:
        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=3, minSize=(30, 30)
        )

    if len(faces) == 0:
        raise ValueError('No face detected in the image.')

    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_roi = gray[y:y + h, x:x + w]
    face_resized = cv2.resize(face_roi, (64, 128))
    descriptor = hog.compute(face_resized)
    vector = descriptor.flatten()
    vector = vector / (np.linalg.norm(vector) + 1e-6)

    return vector.tolist()


@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'Python API is running'})


@app.route('/health', methods=['GET'])
def health():
    try:
        get_cv_models()
        return jsonify({'status': 'ok', 'opencv': True})
    except Exception as error:
        return jsonify({'status': 'error', 'opencv': False, 'message': str(error)}), 503


@app.route('/encode', methods=['POST'])
def encode_face():
    data = request.json or {}
    image_b64 = data.get('image_b64')

    if not image_b64:
        return jsonify({'error': 'Image data not found'}), 400

    try:
        embedding = extract_hog_encoding(image_b64)
        return jsonify({'encoding': embedding})
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    except Exception as error:
        return jsonify({'error': str(error)}), 500


@app.route('/recognize', methods=['POST'])
def recognize_face():
    data = request.json or {}
    image_b64 = data.get('image_b64')

    if not image_b64:
        return jsonify({'error': 'Image data not found'}), 400

    try:
        embedding = extract_hog_encoding(image_b64)
        return jsonify({'encoding': embedding})
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    except Exception as error:
        return jsonify({'error': str(error)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
