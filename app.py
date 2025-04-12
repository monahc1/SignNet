# app.py
from flask import Flask, render_template, Response, jsonify
import cv2
import numpy as np
import os
import time
import tensorflow as tf
from collections import deque
import threading
import queue

app = Flask(__name__)

# Global variables
static_model = None  # Will hold the CNN model for static signs
dynamic_model = None  # Will hold the CNN+LSTM model for dynamic signs
frame_buffer = deque(maxlen=30)  # Store last 30 frames for dynamic recognition
is_motion_detected = False
last_prediction = {"type": None, "text": "No sign detected", "confidence": 0.0}
frame_queue = queue.Queue(maxsize=10)  # Queue for thread-safe frame sharing
processing = False

# Class labels
alphabet_labels = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
# Example labels for dynamic signs (replace with your actual WLASL subset)
word_labels = ['hello', 'thank you', 'please', 'sorry', 'good', 'bad', 'yes', 'no', 'name', 'help']

def load_models():
    """Load the trained ML models"""
    global static_model, dynamic_model
    
    # This is a placeholder - you'll need to load your actual trained models
    try:
        # For demonstration purposes - replace with paths to your actual models
        model_path = os.path.join('models', 'static_sign_model.h5')
        if os.path.exists(model_path):
            static_model = tf.keras.models.load_model(model_path)
        else:
            # Create a dummy model for demonstration
            static_model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(64, 64, 3)),
                tf.keras.layers.Conv2D(32, 3, activation='relu'),
                tf.keras.layers.MaxPooling2D(),
                tf.keras.layers.Conv2D(64, 3, activation='relu'),
                tf.keras.layers.MaxPooling2D(),
                tf.keras.layers.Flatten(),
                tf.keras.layers.Dense(128, activation='relu'),
                tf.keras.layers.Dense(26, activation='softmax')
            ])
            print("Using a dummy static model for demonstration")
        
        # Load or create dynamic model
        model_path = os.path.join('models', 'dynamic_sign_model.h5')
        if os.path.exists(model_path):
            dynamic_model = tf.keras.models.load_model(model_path)
        else:
            # Create a dummy model for demonstration
            dynamic_model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(30, 64, 64, 3)),
                tf.keras.layers.TimeDistributed(tf.keras.layers.Conv2D(32, 3, activation='relu')),
                tf.keras.layers.TimeDistributed(tf.keras.layers.MaxPooling2D()),
                tf.keras.layers.TimeDistributed(tf.keras.layers.Flatten()),
                tf.keras.layers.LSTM(128, return_sequences=False),
                tf.keras.layers.Dense(len(word_labels), activation='softmax')
            ])
            print("Using a dummy dynamic model for demonstration")
        
        print("Models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")

def preprocess_frame(frame):
    """Preprocess a frame for model input"""
    # Resize to 64x64 as mentioned in the proposal
    processed = cv2.resize(frame, (64, 64))
    # Convert to RGB if needed
    if len(processed.shape) == 2:
        processed = cv2.cvtColor(processed, cv2.COLOR_GRAY2RGB)
    # Normalize pixel values
    processed = processed / 255.0
    return processed

def detect_hand_region(frame):
    """Detect and crop hand region (simplified version)"""
    # This is a simplified placeholder - ideally use MediaPipe
    # For demonstration, just return the frame
    return True, frame, None

def detect_motion(prev_frame, curr_frame):
    """Detect if there's significant motion between frames"""
    if prev_frame is None or curr_frame is None:
        return False
    
    # Convert to grayscale
    prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
    
    # Calculate absolute difference
    frame_diff = cv2.absdiff(prev_gray, curr_gray)
    
    # Apply threshold
    _, thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)
    
    # Calculate percentage of changed pixels
    changed_pixels = np.count_nonzero(thresh)
    total_pixels = thresh.shape[0] * thresh.shape[1]
    change_percent = changed_pixels / total_pixels
    
    # Return True if motion detected
    return change_percent > 0.02  # Adjust threshold as needed

def predict_static_sign(frame):
    """Predict static sign (letter) from a single frame"""
    if static_model is None:
        return "Model not loaded", 0.0
    
    processed = preprocess_frame(frame)
    # In a real app, this would use the actual model
    # For now, just return a random letter with confidence
    letter_idx = np.random.randint(0, len(alphabet_labels))
    confidence = np.random.uniform(0.7, 1.0)
    
    return alphabet_labels[letter_idx], confidence

def predict_dynamic_sign(frames):
    """Predict dynamic sign (word) from a sequence of frames"""
    if dynamic_model is None or len(frames) < 30:
        return "Not enough frames", 0.0
    
    # In a real app, this would use the actual model
    # For now, just return a random word with confidence
    word_idx = np.random.randint(0, len(word_labels))
    confidence = np.random.uniform(0.6, 0.95)
    
    return word_labels[word_idx], confidence

def process_frames():
    """Process frames in a separate thread"""
    global last_prediction, processing, frame_buffer
    
    prev_frame = None
    static_cooldown = 0
    
    while True:
        try:
            if not frame_queue.empty():
                frame = frame_queue.get()
                
                # Detect hand in the frame
                hand_detected, hand_region, bbox = detect_hand_region(frame)
                
                if hand_detected:
                    # Add frame to buffer for dynamic sign recognition
                    frame_buffer.append(frame.copy())
                    
                    # Detect motion
                    is_motion = False
                    if prev_frame is not None:
                        is_motion = detect_motion(prev_frame, frame)
                    
                    # Logic for switching between static and dynamic recognition
                    if is_motion:
                        static_cooldown = 10  # Wait for motion to stop before static recognition
                        
                        # If we have enough frames, try dynamic recognition
                        if len(frame_buffer) >= 30:
                            word, confidence = predict_dynamic_sign(list(frame_buffer))
                            if confidence > 0.6:  # Confidence threshold
                                last_prediction = {
                                    "type": "dynamic",
                                    "text": word,
                                    "confidence": confidence
                                }
                    elif static_cooldown > 0:
                        static_cooldown -= 1
                    else:
                        # For static signs
                        letter, confidence = predict_static_sign(hand_region)
                        if confidence > 0.7:  # Confidence threshold
                            last_prediction = {
                                "type": "static",
                                "text": letter,
                                "confidence": confidence
                            }
                
                prev_frame = frame.copy()
            else:
                time.sleep(0.01)  # Small sleep to prevent CPU hogging
        except Exception as e:
            print(f"Error in processing thread: {e}")
            time.sleep(0.1)

def generate_frames():
    """Generate frames from webcam with predictions"""
    camera = cv2.VideoCapture(0)
    
    if not camera.isOpened():
        print("Error: Could not open camera.")
        return
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Put frame in queue for processing
            if not frame_queue.full():
                frame_queue.put(frame.copy())
            
            # Add prediction text to frame
            if last_prediction["text"] != "No sign detected":
                text = f"{last_prediction['text']} ({last_prediction['confidence']:.2f})"
                sign_type = "Letter" if last_prediction["type"] == "static" else "Word"
                cv2.putText(frame, f"{sign_type}: {text}", (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
            
            # Encode the frame for streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_prediction')
def get_prediction():
    """Return the current prediction as JSON"""
    return jsonify(last_prediction)

@app.route('/set_mode')
def set_mode():
    """Set the recognition mode"""
    mode = request.args.get('mode', default='auto')
    # In a real app, you would set the mode in your backend
    return jsonify({"status": "success", "mode": mode})

if __name__ == '__main__':
    # Load models before starting the app
    load_models()
    
    # Start processing thread
    processing_thread = threading.Thread(target=process_frames, daemon=True)
    processing_thread.start()
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
