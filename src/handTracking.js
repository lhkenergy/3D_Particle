export class HandTracker {
    constructor(videoElement, onUpdate) {
        this.videoElement = videoElement;
        this.onUpdate = onUpdate;
        this.hands = null;
        this.camera = null;
        this.isReady = false;
        
        this.init();
    }

    init() {
        this.hands = new window.Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        this.camera = new window.Camera(this.videoElement, {
            onFrame: async () => {
                await this.hands.send({image: this.videoElement});
            },
            width: 640,
            height: 480
        });

        this.camera.start()
            .then(() => {
                this.isReady = true;
                console.log("Camera started");
            })
            .catch(err => {
                console.error("Error starting camera:", err);
                this.onUpdate({ detected: false, factor: 0, error: true });
            });
    }

    onResults(results) {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks;
            
            let factor = 0;

            if (landmarks.length === 2) {
                // Two hands detected: Calculate distance between wrists (landmark 0)
                const hand1 = landmarks[0][0]; // Wrist of hand 1
                const hand2 = landmarks[1][0]; // Wrist of hand 2

                // Calculate Euclidean distance (normalized coordinates 0-1)
                const dx = hand1.x - hand2.x;
                const dy = hand1.y - hand2.y;
                const distance = Math.sqrt(dx*dx + dy*dy);

                // Map distance to factor
                // Typically distance is around 0.1 (close) to 0.8 (far)
                // We want factor 0 (close) to 1 (far)
                factor = (distance - 0.1) * 2.0; 
            } else if (landmarks.length === 1) {
                // One hand: Use pinch distance (Thumb Tip 4 vs Index Tip 8)
                // This is a fallback if user only uses one hand
                const hand = landmarks[0];
                const thumb = hand[4];
                const index = hand[8];

                const dx = thumb.x - index.x;
                const dy = thumb.y - index.y;
                const distance = Math.sqrt(dx*dx + dy*dy);

                // Pinch distance is usually 0.02 (touching) to 0.2 (open)
                factor = (distance - 0.02) * 5.0;
            }

            // Clamp factor
            factor = Math.max(0, Math.min(1, factor));

            this.onUpdate({
                detected: true,
                factor: factor
            });
        } else {
            this.onUpdate({
                detected: false,
                factor: 0
            });
        }
    }
}
