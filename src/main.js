import { ParticleSystem } from './particleSystem.js';
import { HandTracker } from './handTracking.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const videoElement = document.getElementById('input-video');
    const statusText = document.getElementById('status-text');
    
    // Initialize Particle System
    const particleSystem = new ParticleSystem(container);

    // State for hand tracking
    let handData = { detected: false, factor: 0 };

    // Initialize Hand Tracker
    const handTracker = new HandTracker(videoElement, (data) => {
        handData = data;
        
        if (data.error) {
            statusText.textContent = "摄像头错误";
            statusText.style.color = "red";
        } else if (data.detected) {
            statusText.textContent = "已检测到手势";
            statusText.style.color = "#00ff00";
        } else {
            statusText.textContent = "未检测到手势 (随机展示中)";
            statusText.style.color = "#ffcc00";
        }
    });

    // UI Controls
    // Model Selection
    const modelButtons = document.querySelectorAll('.model-btn');
    modelButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            modelButtons.forEach(b => b.classList.remove('active'));
            // Add to current
            e.target.classList.add('active');
            
            const model = e.target.dataset.model;
            particleSystem.setShape(model);
        });
    });

    // Color Picker
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', (e) => {
        particleSystem.setColor(e.target.value);
    });

    // Fullscreen
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            fullscreenBtn.textContent = "退出全屏";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.textContent = "全屏显示";
            }
        }
    });

    // Window Resize
    window.addEventListener('resize', () => {
        particleSystem.resize();
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        particleSystem.update(handData);
    }

    animate();
});
