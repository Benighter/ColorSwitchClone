import Particle from './Particle.js';

class Effects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    update() {
        // Update screen shake
        this.updateScreenShake();
        
        // Update particles
        this.particles = this.particles.filter(particle => particle.update());
    }

    updateScreenShake() {
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    applyScreenShake(ctx) {
        ctx.translate(this.shakeX, this.shakeY);
    }

    triggerScreenShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    createExplosion(x, y, color, count = 30, speedMultiplier = 1) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 * speedMultiplier + 1;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const radius = Math.random() * 3 + 1;
            const lifetime = Math.floor(Math.random() * 30) + 30;
            
            this.particles.push(
                new Particle(
                    this.canvas,
                    this.ctx,
                    x,
                    y,
                    color,
                    velocityX,
                    velocityY,
                    radius,
                    lifetime
                )
            );
        }
    }

    createColorfulExplosion(x, y, colors, count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const radius = Math.random() * 4 + 1;
            const lifetime = Math.floor(Math.random() * 40) + 40;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(
                new Particle(
                    this.canvas,
                    this.ctx,
                    x,
                    y,
                    color,
                    velocityX,
                    velocityY,
                    radius,
                    lifetime
                )
            );
        }
    }

    createStarCollectedEffect(x, y) {
        // Create golden particles
        const starColor = '#FFD700';
        this.createExplosion(x, y, starColor, 20, 0.8);
        
        // Create white sparkles
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const radius = Math.random() * 2 + 1;
            const lifetime = Math.floor(Math.random() * 20) + 40;
            
            this.particles.push(
                new Particle(
                    this.canvas,
                    this.ctx,
                    x,
                    y,
                    'white',
                    velocityX,
                    velocityY,
                    radius,
                    lifetime
                )
            );
        }
    }

    createColorSwitchEffect(x, y, colors) {
        this.createColorfulExplosion(x, y, colors, 40);
        this.triggerScreenShake(5, 5);
    }
    
    createPowerupCollectedEffect(x, y, color) {
        // Create main explosion with powerup color
        this.createExplosion(x, y, color, 30, 1.2);
        
        // Create pulsating ring effect
        this.createPowerupRingEffect(x, y, color);
        
        // Add slight screen shake
        this.triggerScreenShake(3, 8);
    }
    
    createPowerupRingEffect(x, y, color) {
        // Create expanding ring particles
        const ringCount = 20;
        const angleStep = (Math.PI * 2) / ringCount;
        
        for (let i = 0; i < ringCount; i++) {
            const angle = i * angleStep;
            const speed = 3;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            // Create a ring particle with fading effect
            const particle = new Particle(
                this.canvas,
                this.ctx,
                x,
                y,
                color,
                velocityX,
                velocityY,
                2,
                40
            );
            
            // Custom draw method for ring particles
            particle.customDraw = function(ctx) {
                const alpha = this.lifetime / this.maxLifetime;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (2 - alpha), 0, Math.PI * 2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.globalAlpha = 1;
            };
            
            this.particles.push(particle);
        }
    }
    
    createShieldActivationEffect(x, y) {
        // Shield activation effect with bubble particles
        const shieldColor = '#3498db';
        
        // Create shield bubble effect
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 20;
            const startX = x + Math.cos(angle) * distance;
            const startY = y + Math.sin(angle) * distance;
            
            // Particles move toward the ball position
            const velocityX = (x - startX) * 0.05;
            const velocityY = (y - startY) * 0.05;
            
            const particle = new Particle(
                this.canvas,
                this.ctx,
                startX,
                startY,
                shieldColor,
                velocityX,
                velocityY,
                Math.random() * 3 + 1,
                30
            );
            
            this.particles.push(particle);
        }
    }
    
    createSlowmoActivationEffect(x, y) {
        // Slow motion effect with clock particles
        const slowmoColor = '#9b59b6';
        
        // Create time ripple effect
        for (let i = 0; i < 3; i++) {
            const rippleParticles = 20;
            const angleStep = (Math.PI * 2) / rippleParticles;
            const delayStep = 5;
            
            for (let j = 0; j < rippleParticles; j++) {
                const angle = j * angleStep;
                const delay = i * delayStep;
                
                setTimeout(() => {
                    const rippleDistance = 30 + i * 15;
                    const rippleX = x + Math.cos(angle) * rippleDistance;
                    const rippleY = y + Math.sin(angle) * rippleDistance;
                    
                    const particle = new Particle(
                        this.canvas,
                        this.ctx,
                        rippleX,
                        rippleY,
                        slowmoColor,
                        0,
                        0,
                        2,
                        30
                    );
                    
                    // Custom draw for time ripple
                    particle.customDraw = function(ctx) {
                        const alpha = this.lifetime / this.maxLifetime;
                        ctx.globalAlpha = alpha * 0.7;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = this.color;
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    };
                    
                    this.particles.push(particle);
                }, delay);
            }
        }
    }
    
    createMagnetActivationEffect(x, y) {
        // Magnet activation with particle attraction
        const magnetColor = '#e74c3c';
        
        // Create magnetic field lines
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const lineLength = 100;
            const segments = 10;
            
            for (let j = 0; j < segments; j++) {
                const distance = (j / segments) * lineLength;
                const pulseOffset = Math.sin((j / segments) * Math.PI) * 10;
                
                const particleX = x + Math.cos(angle) * (distance + pulseOffset);
                const particleY = y + Math.sin(angle) * (distance + pulseOffset);
                
                // Particles move toward the ball position
                const velocityX = (x - particleX) * 0.08;
                const velocityY = (y - particleY) * 0.08;
                
                const particle = new Particle(
                    this.canvas,
                    this.ctx,
                    particleX,
                    particleY,
                    magnetColor,
                    velocityX,
                    velocityY,
                    2,
                    20 + j * 2
                );
                
                this.particles.push(particle);
            }
        }
    }
    
    createMulticolorActivationEffect(x, y, colors) {
        // Rainbow wave effect
        const waveCount = 3;
        const particlesPerWave = 40;
        const angleStep = (Math.PI * 2) / particlesPerWave;
        
        for (let wave = 0; wave < waveCount; wave++) {
            const waveDelay = wave * 10;
            const waveDistance = 20 + wave * 15;
            
            setTimeout(() => {
                for (let i = 0; i < particlesPerWave; i++) {
                    const angle = i * angleStep;
                    const colorIndex = i % colors.length;
                    
                    const particleX = x + Math.cos(angle) * waveDistance;
                    const particleY = y + Math.sin(angle) * waveDistance;
                    
                    // Rainbow particles move outward
                    const velocityX = Math.cos(angle) * 2;
                    const velocityY = Math.sin(angle) * 2;
                    
                    const particle = new Particle(
                        this.canvas,
                        this.ctx,
                        particleX,
                        particleY,
                        colors[colorIndex],
                        velocityX,
                        velocityY,
                        3,
                        40
                    );
                    
                    this.particles.push(particle);
                }
            }, waveDelay);
        }
    }
    
    createShrinkActivationEffect(x, y) {
        // Shrink effect with particles moving inward
        const shrinkColor = '#1abc9c';
        
        // Create imploding particles
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 20;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            // Particles move toward the ball position
            const velocityX = (x - particleX) * 0.1;
            const velocityY = (y - particleY) * 0.1;
            
            const particle = new Particle(
                this.canvas,
                this.ctx,
                particleX,
                particleY,
                shrinkColor,
                velocityX,
                velocityY,
                Math.random() * 4 + 1,
                30
            );
            
            this.particles.push(particle);
        }
    }

    updateCanvasDimensions(canvas) {
        // Update canvas reference
        this.canvas = canvas;
        
        // Scale effects based on canvas size
        const scaleFactor = Math.min(canvas.width, canvas.height) / 600;
        
        // Update existing particles if any
        this.particles.forEach(particle => {
            if (particle.updateCanvasDimensions) {
                particle.updateCanvasDimensions(canvas);
            }
        });
        
        // Adjust shake intensity based on canvas size
        this.shakeIntensity = this.shakeIntensity * scaleFactor;
    }
}

export default Effects; 