from flask import Flask, render_template, Response, jsonify, request
import cv2
import numpy as np
import os
import time
import tensorflow as tf
from collections import deque, Counter
import threading
import queue
import requests
from dotenv import load_dotenv
import mediapipe as mp
import openai

# 🌱 Load .env
load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")  # Uncomment if you're using OpenAI

app = Flask(__name__)

# 🤖 Globals
model = None
frame_queue = queue.Queue(maxsize=5)
prediction_buffer = deque(maxlen=5)
last_prediction = {"type": None, "text": "No sign detected", "confidence": 0.0}
alphabet_labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["del", "nothing", "space"]

# 🖐️ MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.6, min_tracking_confidence=0.6)
last_bbox = None

# 📦 Load model
def load_models():
    global model
    try:
        model = tf.keras.models.load_model("models/cnn_model.keras")
        print("✅ Model loaded.")
    except Exception as e:
        print(f"❌ Error loading model: {e}")

# 🎨 CLAHE Preprocessing with hand crop
def preprocess_frame(frame, img_size=64):
    global last_bbox
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)
    if results.multi_hand_landmarks:
        h, w, _ = frame.shape
        hand = results.multi_hand_landmarks[0]
        x_min = int(min(lm.x for lm in hand.landmark) * w)
        x_max = int(max(lm.x for lm in hand.landmark) * w)
        y_min = int(min(lm.y for lm in hand.landmark) * h)
        y_max = int(max(lm.y for lm in hand.landmark) * h)
        padding = 20
        x_min, y_min = max(0, x_min - padding), max(0, y_min - padding)
        x_max, y_max = min(w, x_max + padding), min(h, y_max + padding)
        last_bbox = (x_min, y_min, x_max, y_max)
        frame = frame[y_min:y_max, x_min:x_max]
    else:
        last_bbox = None

    frame = cv2.resize(frame, (img_size, img_size))
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0)
    cl = clahe.apply(l)
    rgb = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2RGB)
    rgb = rgb.astype("float32") / 255.0
    return np.expand_dims(rgb, axis=0)

# 🔮 Predict
def predict_static_sign(frame):
    try:
        processed = preprocess_frame(frame)
        preds = model.predict(processed, verbose=0)[0]
        pred_idx = np.argmax(preds)
        confidence = float(preds[pred_idx])

        if confidence < 0.5:
            return "unsure", confidence

        prediction_buffer.append(alphabet_labels[pred_idx])
        most_common = Counter(prediction_buffer).most_common(1)[0][0]
        return most_common, confidence
    except Exception as e:
        print(f"⚠️ Prediction error: {e}")
        return "error", 0.0

# 🧠 Background inference thread
def process_frames():
    global last_prediction
    while True:
        try:
            if not frame_queue.empty():
                frame = frame_queue.get()
                letter, conf = predict_static_sign(frame)
                if letter not in ["unsure", "error"]:
                    last_prediction = {"type": "static", "text": letter, "confidence": conf}
        except Exception as e:
            print(f"⚠️ Frame processing error: {e}")
            time.sleep(0.1)

# 🎥 Webcam streaming
def generate_frames():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Camera error")
        return
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.flip(frame, 1)

        if not frame_queue.full():
            frame_queue.put(frame.copy())

        if last_bbox:
            x1, y1, x2, y2 = last_bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 2)

        label = f"{last_prediction['text']} ({last_prediction['confidence']:.2f})"
        if last_prediction["text"] != "No sign detected":
            cv2.putText(frame, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

#  Routes
@app.route('/')
def index(): return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_prediction')
def get_prediction():
    return jsonify(last_prediction)

#  chatbot

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    try:
        # Get the message from the request
        user_message = data.get('message', '')

        # Debugging log to see if message is received correctly
        print(f"Received message: {user_message}")

        # Ensure the user message is not empty
        if not user_message:
            return jsonify({"reply": "Please enter a message."})

        # Send the message to OpenAI API for completion using gpt-3.5-turbo with the correct endpoint
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Chat model for the conversation
            messages=[
                {"role": "system", "content": "You are SignBot. Give smart, clean answers for sign language users."},
                {"role": "user", "content": user_message}
            ],
            max_tokens=150,  # Limit the length of the response
            temperature=0.7  # Control the creativity of the response
        )

        # Extract the reply content from the response
        reply = response['choices'][0]['message']['content'].strip()

        # Return the reply to the user
        return jsonify({"reply": reply if reply else "I'm not sure how to answer that."})

    except Exception as e:
        # Log the error for debugging
        print(f"Error occurred: {str(e)}")
        return jsonify({"reply": f"⚠️ Error: {str(e)}"})




if __name__ == '__main__':
    load_models()
    threading.Thread(target=process_frames, daemon=True).start()
    print("🚀 Running SignNet on http://127.0.0.1:5000")
    app.run(debug=True)
