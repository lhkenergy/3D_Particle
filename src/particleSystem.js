import * as THREE from 'three';
import { Shapes } from './shapes.js';

export class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.count = 20000; // Particle count
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometry = null;
        this.material = null;
        
        // Data arrays
        this.currentPositions = new Float32Array(this.count * 3);
        this.targetPositions = new Float32Array(this.count * 3);
        
        // State
        this.baseColor = new THREE.Color('#ff0055');
        this.isHandDetected = false;
        this.handFactor = 0; // 0 = closed, 1 = open (spread)
        this.autoRotateSpeed = 0.002;
        
        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        // Add some fog for depth
        this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 8;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Particles
        this.geometry = new THREE.BufferGeometry();
        
        // Initialize positions (start with random)
        for (let i = 0; i < this.count * 3; i++) {
            this.currentPositions[i] = (Math.random() - 0.5) * 10;
            this.targetPositions[i] = this.currentPositions[i];
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));

        // Material
        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');
        
        this.material = new THREE.PointsMaterial({
            color: this.baseColor,
            size: 0.1,
            map: sprite,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particles);

        // Initial shape
        this.setShape('heart');
    }

    setShape(type) {
        if (Shapes[type]) {
            const newData = Shapes[type](this.count);
            // Update target positions
            for (let i = 0; i < this.count * 3; i++) {
                this.targetPositions[i] = newData[i] || 0;
            }
        }
    }

    setColor(hex) {
        this.baseColor.set(hex);
        this.material.color.set(hex);
    }

    update(handData) {
        // handData: { detected: boolean, factor: number (0-1) }
        this.isHandDetected = handData.detected;
        
        // Smoothly interpolate hand factor
        const targetFactor = handData.detected ? handData.factor : 0; // Default to 0 if no hand
        this.handFactor += (targetFactor - this.handFactor) * 0.1;

        const positions = this.geometry.attributes.position.array;
        const speed = 0.05; // Interpolation speed

        // Animation loop
        for (let i = 0; i < this.count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // 1. Move towards target shape
            const tx = this.targetPositions[ix];
            const ty = this.targetPositions[iy];
            const tz = this.targetPositions[iz];

            // Basic interpolation
            positions[ix] += (tx - positions[ix]) * speed;
            positions[iy] += (ty - positions[iy]) * speed;
            positions[iz] += (tz - positions[iz]) * speed;

            // 2. Apply Hand Interaction (Scale & Diffusion)
            // Factor 0: Normal shape
            // Factor 1: Exploded / Scaled up
            
            if (this.handFactor > 0.01) {
                // Calculate direction from center
                // Assuming center is (0,0,0) for simplicity
                // Add extra expansion based on hand factor
                
                const expansion = 1 + this.handFactor * 2.0; // Scale up to 3x
                const noise = this.handFactor * 0.5; // Add noise
                
                // We apply this dynamically to the *current* position for the frame
                // But we don't want to permanently alter the position, just the visual
                // However, since we are modifying the buffer directly, we need to be careful.
                // Actually, the interpolation above pulls it back to target.
                // So we can add a force that pushes it away.
                
                // Let's modify the target "effective" position logic or just add a temporary offset
                // But modifying buffer directly is persistent.
                
                // Better approach:
                // The interpolation above sets the "base" position.
                // We can apply the transform here directly to the buffer, 
                // BUT next frame the interpolation will try to fix it.
                // So we should modify the interpolation target? No, target is the shape.
                
                // Let's change the logic:
                // Lerp towards (Target * Expansion + Noise)
                
                const rX = (Math.random() - 0.5) * noise;
                const rY = (Math.random() - 0.5) * noise;
                const rZ = (Math.random() - 0.5) * noise;

                const targetX = tx * expansion + rX;
                const targetY = ty * expansion + rY;
                const targetZ = tz * expansion + rZ;

                // Override the simple lerp above with this new target
                positions[ix] += (targetX - positions[ix]) * speed;
                positions[iy] += (targetY - positions[iy]) * speed;
                positions[iz] += (targetZ - positions[iz]) * speed;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Rotation
        if (!this.isHandDetected) {
            // Random rotation when idle
            this.particles.rotation.y += this.autoRotateSpeed;
            this.particles.rotation.x += this.autoRotateSpeed * 0.5;
        } else {
            // Slow down rotation or stop it to focus on hand control
            this.particles.rotation.y *= 0.95;
            this.particles.rotation.x *= 0.95;
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
