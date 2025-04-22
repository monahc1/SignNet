document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const toggleModeBtn = document.getElementById('toggle-mode-btn');
    const staticResult = document.getElementById('static-result');
    const dynamicResult = document.getElementById('dynamic-result');
    const staticConfidence = document.getElementById('static-confidence');
    const dynamicConfidence = document.getElementById('dynamic-confidence');
    const recognitionHistory = document.getElementById('recognition-history');
    const modal = document.getElementById('info-modal');
    const closeModal = document.querySelector('.close');
    const chatInput = document.getElementById("chat-input");
    const chatLog = document.getElementById("chat-log");

    // App state
    let isRunning = true;
    let currentMode = 'auto'; // 'auto', 'static', 'dynamic'
    let predictionInterval;
    let history = [];

    // Show info modal on first visit
    if (!localStorage.getItem('signNetVisited')) {
        modal.style.display = 'block';
        localStorage.setItem('signNetVisited', 'true');
    }

    // Close modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // Start webcam stream
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            const videoFeed = document.getElementById('video-feed');
            videoFeed.src = videoFeed.src;
            startPredictionFetching();
            isRunning = true;
            updateUI();
        }
    });

    // Stop webcam stream
    stopBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(predictionInterval);
            isRunning = false;
            updateUI();
        }
    });

    // Toggle recognition mode
    toggleModeBtn.addEventListener('click', () => {
        currentMode = currentMode === 'auto' ? 'static' : currentMode === 'static' ? 'dynamic' : 'auto';
        toggleModeBtn.innerHTML =
            currentMode === 'static' ? '<i class="fas fa-font"></i> Static Mode' :
            currentMode === 'dynamic' ? '<i class="fas fa-comment-dots"></i> Dynamic Mode' :
            '<i class="fas fa-exchange-alt"></i> Auto Mode';

        fetch(`/set_mode?mode=${currentMode}`)
            .then(res => res.json())
            .then(data => console.log('Mode set:', data))
            .catch(err => console.error('Error setting mode:', err));
    });

    // ⏱ Real-time prediction updates (updated function)
    function fetchPrediction() {
        fetch("/get_prediction")
            .then(res => res.json())
            .then(data => {
                const { type, text, confidence } = data;

                staticResult.classList.remove('active');
                dynamicResult.classList.remove('active');

                if (type === "static") {
                    staticResult.innerText = text;
                    staticConfidence.style.width = (confidence * 100).toFixed(0) + "%";
                    staticResult.classList.add('active');
                    dynamicResult.innerText = "Waiting...";
                    dynamicConfidence.style.width = "0%";
                    if (confidence > 0.7) addToHistory('Letter', text, confidence);
                } else if (type === "dynamic") {
                    dynamicResult.innerText = text;
                    dynamicConfidence.style.width = (confidence * 100).toFixed(0) + "%";
                    dynamicResult.classList.add('active');
                    staticResult.innerText = "Waiting...";
                    staticConfidence.style.width = "0%";
                    if (confidence > 0.6) addToHistory('Word', text, confidence);
                }
            })
            .catch(error => {
                console.error("Prediction fetch failed:", error);
            });
    }

    function startPredictionFetching() {
        predictionInterval = setInterval(fetchPrediction, 1000);
    }

    function addToHistory(type, text, confidence) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const last = history[0];

        if (last && last.type === type && last.text === text) return;

        history.unshift({ type, text, confidence, time: timeString });
        if (history.length > 10) history.pop();
        updateHistoryUI();
    }

    function updateHistoryUI() {
        recognitionHistory.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            const content = document.createElement('div');
            content.textContent = `${item.type}: ${item.text} (${(item.confidence * 100).toFixed(0)}%)`;

            const time = document.createElement('span');
            time.className = 'time';
            time.textContent = item.time;

            li.appendChild(content);
            li.appendChild(time);
            recognitionHistory.appendChild(li);
        });
    }

    function updateUI() {
        startBtn.disabled = isRunning;
        stopBtn.disabled = !isRunning;
        startBtn.classList.toggle('disabled', isRunning);
        stopBtn.classList.toggle('disabled', !isRunning);
    }

    function init() {
        updateUI();
        startPredictionFetching();
    }

    init();

    // 🔥 Hotkeys
    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            event.preventDefault();
            isRunning ? stopBtn.click() : startBtn.click();
        }
        if (event.code === 'KeyM') toggleModeBtn.click();
        if (event.code === 'KeyC') {
            history = [];
            updateHistoryUI();
        }
    });

    // 💬 ChatGPT Integration
    chatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message !== "") {
                chatLog.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
                chatInput.value = "";

                // Debugging log to verify the message being sent
                console.log("Sending message: ", message);

                // Send the message to the backend with the correct prompt
                fetch("/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ message: message })  // Ensure the message is correctly formatted
                })
                    .then(response => response.json())
                    .then(data => {
                        const reply = data.reply.replace(/\n/g, "<br>");
                        chatLog.innerHTML += `<p><strong>Bot:</strong> ${reply}</p>`;
                        chatLog.scrollTop = chatLog.scrollHeight;
                    })
                    .catch(error => {
                        chatLog.innerHTML += `<p><strong>Bot:</strong> ⚠️ Error: ${error.message}</p>`;
                    });
            }
        }
    });

});
