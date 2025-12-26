import * as THREE from 'three';

export const Shapes = {
    heart: (count) => {
        const positions = [];
        for (let i = 0; i < count; i++) {
            // Heart surface equation
            // x = 16sin^3(t)
            // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
            // z = varies to give depth
            
            // Using a 3D heart formula approximation
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            // Rejection sampling or just mapping to a volume
            // Let's use a simpler parametric approach for a 3D heart
            // (x^2 + 9/4y^2 + z^2 - 1)^3 - x^2z^3 - 9/80y^2z^3 = 0 is the implicit equation
            // But for particles, let's use a parametric curve with random spread
            
            const t = Math.random() * Math.PI * 2;
            const r = Math.random(); // Volume filling
            
            // 2D Heart curve extended to 3D
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            let z = (Math.random() - 0.5) * 10; // Thickness
            
            // Scale down
            const scale = 0.1;
            x *= scale;
            y *= scale;
            z *= scale;

            // Add some randomness to fill the volume
            const spread = 0.2;
            x += (Math.random() - 0.5) * spread;
            y += (Math.random() - 0.5) * spread;
            z += (Math.random() - 0.5) * spread;

            positions.push(x, y, z);
        }
        return new Float32Array(positions);
    },

    flower: (count) => {
        const positions = [];
        for (let i = 0; i < count; i++) {
            // Rose curve / Flower shape
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            // k = petals
            const k = 5; 
            const r = Math.cos(k * theta) + 2; // +2 to keep it from being too thin at center
            
            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta);
            let z = r * Math.cos(phi) * 0.5; // Flatten it a bit

            const scale = 1.5;
            positions.push(x * scale, y * scale, z * scale);
        }
        return new Float32Array(positions);
    },

    saturn: (count) => {
        const positions = [];
        const planetRatio = 0.4; // 40% particles for planet
        const planetCount = Math.floor(count * planetRatio);
        const ringCount = count - planetCount;

        // Planet (Sphere)
        for (let i = 0; i < planetCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 1.5;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);
        }

        // Rings
        for (let i = 0; i < ringCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 2.2 + Math.random() * 1.5; // Ring radius range
            
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            const y = (Math.random() - 0.5) * 0.1; // Thin ring

            // Tilt the ring
            const tilt = Math.PI / 6; // 30 degrees
            const x_tilted = x;
            const y_tilted = y * Math.cos(tilt) - z * Math.sin(tilt);
            const z_tilted = y * Math.sin(tilt) + z * Math.cos(tilt);

            positions.push(x_tilted, y_tilted, z_tilted);
        }
        return new Float32Array(positions);
    },

    buddha: (count) => {
        // Approximating a sitting figure with spheres
        const positions = [];
        
        const addSphere = (cx, cy, cz, radius, numPoints) => {
            for (let i = 0; i < numPoints; i++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                const x = cx + radius * Math.sin(phi) * Math.cos(theta);
                const y = cy + radius * Math.sin(phi) * Math.sin(theta);
                const z = cz + radius * Math.cos(phi);
                
                positions.push(x, y, z);
            }
        };

        // Head
        addSphere(0, 1.5, 0, 0.6, count * 0.15);
        // Body
        addSphere(0, 0, 0, 1.0, count * 0.35);
        // Base/Legs (Ellipsoid-ish)
        for (let i = 0; i < count * 0.5; i++) {
             const theta = Math.random() * Math.PI * 2;
             const phi = Math.acos(2 * Math.random() - 1);
             // Flattened sphere for crossed legs base
             const x = 1.8 * Math.sin(phi) * Math.cos(theta);
             const y = -1.0 + 0.8 * Math.sin(phi) * Math.sin(theta);
             const z = 1.2 * Math.cos(phi);
             
             // Only keep bottom half mostly
             if (y < 0.5) positions.push(x, y, z);
             else i--; // Retry
        }

        return new Float32Array(positions);
    },

    fireworks: (count) => {
        const positions = [];
        // A burst shape - sphere with trails? 
        // Or just a large sphere with high density at center fading out
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            // Power law distribution for burst effect
            const r = Math.pow(Math.random(), 1/3) * 4; 

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions.push(x, y, z);
        }
        return new Float32Array(positions);
    }
};
