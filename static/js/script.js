// static/js/script.js
document.addEventListener('DOMContentLoaded', function() {
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
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Start/Stop functionality
    startBtn.addEventListener('click', function() {
        if (!isRunning) {
            const videoFeed = document.getElementById('video-feed');
            videoFeed.src = videoFeed.src;
            startPredictionFetching();
            isRunning = true;
            updateUI();
        }
    });

    stopBtn.addEventListener('click', function() {
        if (isRunning) {
            clearInterval(predictionInterval);
            isRunning = false;
            updateUI();
        }
    });

    // Toggle recognition mode
    toggleModeBtn.addEventListener('click', function() {
        switch (currentMode) {
            case 'auto':
                currentMode = 'static';
                toggleModeBtn.innerHTML = '<i class="fas fa-font"></i> Static Mode';
                break;
            case 'static':
                currentMode = 'dynamic';
                toggleModeBtn.innerHTML = '<i class="fas fa-comment-dots"></i> Dynamic Mode';
                break;
            case 'dynamic':
                currentMode = 'auto';
                toggleModeBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Auto Mode';
                break;
        }

        fetch(`/set_mode?mode=${currentMode}`)
            .then(response => response.json())
            .then(data => {
                console.log('Mode set:', data);
            })
            .catch(error => {
                console.error('Error setting mode:', error);
            });
    });

    function startPredictionFetching() {
        predictionInterval = setInterval(fetchPrediction, 500);
    }

    function fetchPrediction() {
        fetch('/get_prediction')
            .then(response => response.json())
            .then(data => {
                updatePredictionUI(data);
            })
            .catch(error => {
                console.error('Error fetching prediction:', error);
            });
    }

    function updatePredictionUI(prediction) {
        staticResult.classList.remove('active');
        dynamicResult.classList.remove('active');

        if (prediction.type === 'static') {
            staticResult.textContent = prediction.text;
            staticConfidence.style.width = `${prediction.confidence * 100}%`;
            staticResult.classList.add('active');
            if (prediction.confidence > 0.7) {
                addToHistory('Letter', prediction.text, prediction.confidence);
            }
        } else if (prediction.type === 'dynamic') {
            dynamicResult.textContent = prediction.text;
            dynamicConfidence.style.width = `${prediction.confidence * 100}%`;
            dynamicResult.classList.add('active');
            if (prediction.confidence > 0.6) {
                addToHistory('Word', prediction.text, prediction.confidence);
            }
        }
    }

    function addToHistory(type, text, confidence) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();

        const lastPrediction = history[0];
        if (lastPrediction &&
            lastPrediction.type === type &&
            lastPrediction.text === text) {
            return;
        }

        history.unshift({
            type,
            text,
            confidence,
            time: timeString
        });

        if (history.length > 10) {
            history.pop();
        }

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

        if (isRunning) {
            startBtn.classList.add('disabled');
            stopBtn.classList.remove('disabled');
        } else {
            startBtn.classList.remove('disabled');
            stopBtn.classList.add('disabled');
        }
    }

    // Initialize the app
    function init() {
        updateUI();
        startPredictionFetching();

        // Optional: sample history items for first load
        addToHistory('Letter', 'A', 0.95);
        addToHistory('Word', 'Hello', 0.87);
    }

    init();

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            if (isRunning) {
                stopBtn.click();
            } else {
                startBtn.click();
            }
        }

        if (event.code === 'KeyM') {
            toggleModeBtn.click();
        }

        if (event.code === 'KeyC') {
            history = [];
            updateHistoryUI();
        }
    });
});
