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
}

export default Effects; 