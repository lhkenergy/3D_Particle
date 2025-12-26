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
        this.randomOffsets = new Float32Array(this.count * 3); // For stable noise
        
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
            this.randomOffsets[i] = (Math.random() - 0.5); // Store stable random direction
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

    setParticleSize(size) {
        if (this.material) {
            this.material.size = parseFloat(size);
        }
    }

    update(handData) {
        // handData: { detected: boolean, factor: number (0-1), centerX: number (0-1) }
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

            // 2. Apply Hand Interaction (Scale & Diffusion)
            if (this.handFactor > 0.01) {
                // Increased max scale from 2.0 to 5.0
                const expansion = 1 + this.handFactor * 5.0; 
                const noise = this.handFactor * 2.0; // Increased noise range but using stable offsets
                
                // Use stored random offsets to prevent jitter
                const rX = this.randomOffsets[ix] * noise;
                const rY = this.randomOffsets[iy] * noise;
                const rZ = this.randomOffsets[iz] * noise;

                const targetX = tx * expansion + rX;
                const targetY = ty * expansion + rY;
                const targetZ = tz * expansion + rZ;

                // Interpolate towards expanded target
                positions[ix] += (targetX - positions[ix]) * speed;
                positions[iy] += (targetY - positions[iy]) * speed;
                positions[iz] += (targetZ - positions[iz]) * speed;
            } else {
                // Normal interpolation to target
                positions[ix] += (tx - positions[ix]) * speed;
                positions[iy] += (ty - positions[iy]) * speed;
                positions[iz] += (tz - positions[iz]) * speed;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Vertical Movement Logic
        if (this.isHandDetected && handData.centerY !== undefined) {
            // centerY: 0 (top) -> 1 (bottom)
            // Map 0..1 to Y range, e.g., 3..-3
            // Invert because screen Y is down, 3D Y is up
            const targetY = (0.5 - handData.centerY) * 6; 
            
            // Smoothly interpolate position
            this.particles.position.y += (targetY - this.particles.position.y) * 0.1;
        } else {
            // Return to center
            this.particles.position.y += (0 - this.particles.position.y) * 0.05;
        }

        // Rotation Logic
        if (this.isHandDetected && handData.centerX !== undefined) {
            // centerX: 0 (left) -> 1 (right)
            // Center is 0.5
            // If < 0.5, rotate left (negative Y)
            // If > 0.5, rotate right (positive Y)
            
            // Calculate delta from center
            const delta = handData.centerX - 0.5;
            
            // Apply rotation based on delta
            // Speed increases as we go further from center
            // Max speed 0.1
            const rotationSpeed = delta * 0.2; 
            
            this.particles.rotation.y += rotationSpeed;
            
            // Also tilt slightly based on vertical position? (Optional, keeping it simple for now)
            this.particles.rotation.x *= 0.95; // Stabilize X
        } else {
            // Random rotation when idle
            this.particles.rotation.y += this.autoRotateSpeed;
            this.particles.rotation.x += this.autoRotateSpeed * 0.5;
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
