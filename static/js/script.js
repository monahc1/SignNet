/* static/css/style.css - Vibrant Beautiful Theme */
:root {
    /* Vibrant colorful palette */
    --primary: #8e44ad;
    --primary-light: #9b59b6;
    --primary-dark: #6c3483;
    --accent: #3498db;
    --accent-secondary: #1abc9c;
    --text-on-primary: #ffffff;
    --text-primary: #2c3e50;
    --text-secondary: #7f8c8d;
    --background: #f9f9f9;
    --card-bg: #ffffff;
    --card-hover: #f5f7fa;
    --success: #2ecc71;
    --warning: #f39c12;
    --error: #e74c3c;
    
    /* Enhanced styling variables */
    --border-radius: 16px;
    --border-radius-sm: 10px;
    --box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -8px rgba(0, 0, 0, 0.05);
    --box-shadow-sm: 0 6px 12px rgba(0, 0, 0, 0.05);
    --box-shadow-hover: 0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 15px -5px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', 'Inter', 'Segoe UI', system-ui, sans-serif;
}

body {
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
    font-size: 16px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
    background-attachment: fixed;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
    width: 100%;
    flex: 1;
}

/* Header Styles */
header {
    text-align: center;
    padding: 40px 30px;
    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
    color: var(--text-on-primary);
    border-radius: var(--border-radius);
    margin-bottom: 40px;
    box-shadow: var(--box-shadow);
    position: relative;
    overflow: hidden;
}

header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%);
    pointer-events: none;
}

header h1 {
    font-size: 3.5rem;
    margin-bottom: 14px;
    font-weight: 800;
    letter-spacing: -0.5px;
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}

header h2 {
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.95;
    max-width: 750px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    color: #4a4a4a;
}

/* Main Content */
main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
}

@media (min-width: 768px) {
    main {
        grid-template-columns: 1fr 1fr;
    }
    
    .video-container {
        grid-column: 1;
        grid-row: 1 / span 2;
    }
    
    .recognition-results, .controls, .history-panel {
        grid-column: 2;
    }
}

/* Video Feed */
.video-container {
    position: relative;
    background-color: var(--card-bg);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--box-shadow);
    aspect-ratio: 4/3;
    transition: var(--transition);
    border: 1px solid rgba(0,0,0,0.03);
}

.video-container:hover {
    box-shadow: var(--box-shadow-hover);
    transform: translateY(-5px);
}

#video-feed {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.camera-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.camera-frame {
    position: relative;
    width: 65%;
    height: 65%;
    border: 3px dashed rgba(255, 255, 255, 0.8);
    border-radius: var(--border-radius);
    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.15);
    transition: var(--transition);
}

.camera-frame::before,
.camera-frame::after {
    content: "";
    position: absolute;
    width: 25px;
    height: 25px;
    border-color: var(--accent);
    border-style: solid;
    opacity: 0.9;
}

.camera-frame::before {
    top: -5px;
    left: -5px;
    border-width: 3px 0 0 3px;
    border-top-left-radius: 5px;
}

.camera-frame::after {
    bottom: -5px;
    right: -5px;
    border-width: 0 3px 3px 0;
    border-bottom-right-radius: 5px;
}

/* Recognition Results */
.recognition-results {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.result-box {
    background-color: var(--card-bg);
    padding: 30px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-sm);
    border-top: 5px solid transparent;
    border-image: linear-gradient(to right, #a18cd1, #fbc2eb);
    border-image-slice: 1;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.result-box::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(161, 140, 209, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
}

.result-box:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow);
}

.result-box h3 {
    color: #8e44ad;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    position: relative;
    font-size: 1.3rem;
}

.result-box h3::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, #a18cd1, #fbc2eb);
    border-radius: 3px;
}

.result {
    font-size: 2.5rem;
    font-weight: 700;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    background: linear-gradient(135deg, #c2e9fb, #a1c4fd);
    color: #4a69bd;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
    position: relative;
    overflow: hidden;
}

.result::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.4) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    animation: shimmer 4s infinite;
    pointer-events: none;
}

@keyframes shimmer {
    0% { transform: translateX(-100%) rotate(30deg); }
    100% { transform: translateX(100%) rotate(30deg); }
}

.confidence-bar-container {
    width: 100%;
    height: 14px;
    background-color: #f1f2f6;
    border-radius: 7px;
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.08);
}

.confidence-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #a18cd1, #fbc2eb);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.confidence-bar::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        90deg,
        rgba(255,255,255,0.1) 0%,
        rgba(255,255,255,0.2) 50%,
        rgba(255,255,255,0.1) 100%
    );
}

/* Controls */
.controls {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin: 30px 0;
    flex-wrap: wrap;
}

.btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #a18cd1, #fbc2eb);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: var(--transition-bounce);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(161, 140, 209, 0.4);
    letter-spacing: 0.3px;
}

.btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0));
    opacity: 0;
    transition: var(--transition);
}

.btn:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 20px rgba(161, 140, 209, 0.5);
}

.btn:hover::before {
    opacity: 1;
}

.btn:active {
    transform: translateY(-1px);
    box-shadow: 0 5px 10px rgba(161, 140, 209, 0.4);
}

/* History Panel */
.history-panel {
    background-color: var(--card-bg);
    padding: 30px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-sm);
    transition: var(--transition);
    border: 1px solid rgba(0,0,0,0.02);
}

.history-panel:hover {
    box-shadow: var(--box-shadow);
    transform: translateY(-3px);
}

.history-panel h3 {
    color: #8e44ad;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    position: relative;
    font-size: 1.3rem;
}

.history-panel h3::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(to right, #a18cd1, #fbc2eb);
    border-radius: 3px;
}

#recognition-history {
    list-style-type: none;
    max-height: 250px;
    overflow-y: auto;
    border-radius: var(--border-radius-sm);
    border: 1px solid rgba(0,0,0,0.03);
    scrollbar-width: thin;
    scrollbar-color: #a18cd1 var(--background);
}

#recognition-history::-webkit-scrollbar {
    width: 8px;
}

#recognition-history::-webkit-scrollbar-track {
    background: #f5f7fa;
    border-radius: 4px;
}

#recognition-history::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #a18cd1, #fbc2eb);
    border-radius: 4px;
}

#recognition-history li {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: var(--transition);
}

#recognition-history li:hover {
    background-color: var(--card-hover);
}

#recognition-history li span.time {
    color: var(--text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    background-color: #f5f7fa;
    padding: 4px 10px;
    border-radius: 20px;
}

#recognition-history li:nth-child(odd) {
    background-color: rgba(161, 140, 209, 0.05);
}

#recognition-history li:nth-child(odd):hover {
    background-color: rgba(161, 140, 209, 0.1);
}

/* Footer */
footer {
    margin-top: 60px;
    text-align: center;
    padding: 35px 30px;
    background: linear-gradient(135deg, #a18cd1, #fbc2eb);
    color: white;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    box-shadow: var(--box-shadow);
    position: relative;
    overflow: hidden;
}

footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at bottom left, rgba(255,255,255,0.2) 0%, transparent 70%);
    pointer-events: none;
}

footer a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
}

footer a::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: white;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease-out;
}

footer a:hover::after {
    transform: scaleX(1);
    transform-origin: left;
}

.team-info {
    margin-top: 15px;
    font-size: 1rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    transition: var(--transition);
}

.modal-content {
    background-color: var(--card-bg);
    margin: 10% auto;
    padding: 40px;
    width: 90%;
    max-width: 650px;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-hover);
    position: relative;
    transform: translateY(30px);
    opacity: 0;
    transition: var(--transition);
    border-image: linear-gradient(to right, #a18cd1, #fbc2eb);
    border-image-slice: 1;
    border-top: 5px solid;
}

.modal.active .modal-content {
    transform: translateY(0);
    opacity: 1;
}

.close {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    color: var(--text-secondary);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: var(--transition);
    background-color: rgba(0,0,0,0.03);
}

.close:hover {
    background: linear-gradient(135deg, rgba(161, 140, 209, 0.2), rgba(251, 194, 235, 0.2));
    color: #8e44ad;
    transform: rotate(90deg);
}

.modal h2 {
    color: #8e44ad;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(0,0,0,0.05);
    font-weight: 600;
    font-size: 1.8rem;
}

.modal ol {
    margin-left: 24px;
    margin-bottom: 30px;
}

.modal li {
    margin-bottom: 15px;
    line-height: 1.8;
    position: relative;
    padding-left: 8px;
}

.modal li::marker {
    color: #8e44ad;
    font-weight: 600;
}

/* Animations */
@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(161, 140, 209, 0.7);
    }
    70% {
        box-shadow: 0 0 0 16px rgba(161, 140, 209, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(161, 140, 209, 0);
    }
}

.result.active {
    animation: pulse 2s infinite;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.6s ease-in-out;
}

/* Loading Animation */
.loading-spinner {
    width: 50px;
    height: 50px;
    position: relative;
    margin: 25px auto;
}

.loading-spinner:before,
.loading-spinner:after {
    content: "";
    display: block;
    position: absolute;
    border-radius: 50%;
    border: 5px solid transparent;
    border-top-color: #a18cd1;
    border-bottom-color: #fbc2eb;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: spin 1.5s ease-in-out infinite;
}

.loading-spinner:before {
    animation-delay: -0.5s;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Toast Notifications */
.toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    padding: 18px 25px;
    background: var(--card-bg);
    color: var(--text-primary);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--box-shadow-hover);
    transform: translateY(100px);
    opacity: 0;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 1000;
    max-width: 350px;
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

.toast.success {
    border-image: linear-gradient(to right, #2ecc71, #1abc9c);
    border-image-slice: 1;
    border-left: 4px solid;
}

.toast.warning {
    border-image: linear-gradient(to right, #f39c12, #f1c40f);
    border-image-slice: 1;
    border-left: 4px solid;
}

.toast.error {
    border-image: linear-gradient(to right, #e74c3c, #e84393);
    border-image-slice: 1;
    border-left: 4px solid;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
