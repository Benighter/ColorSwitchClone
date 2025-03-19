class Particle {
    constructor(canvas, ctx, x, y, color, velocityX, velocityY, radius, lifetime) {
        this.x = x;
        this.y = y;
        this.originalRadius = radius;
        this.radius = radius;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.gravity = 0.1;
        this.friction = 0.98;
        this.canvas = canvas;
        this.ctx = ctx;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.age = 0;
        this.opacity = 1;
        this.customDraw = null; // Custom draw function
    }

    update() {
        // Update position
        this.velocityY += this.gravity;
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update age and opacity
        this.age++;
        this.opacity = 1 - (this.age / this.lifetime);
        this.radius = this.originalRadius * this.opacity;
        
        // Draw if still alive
        if (this.age < this.lifetime) {
            // Use custom draw function if provided, otherwise use default
            if (this.customDraw && typeof this.customDraw === 'function') {
                this.customDraw(this.ctx);
            } else {
                this.draw();
            }
            return true;
        }
        return false;
    }

    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.restore();
    }

    updateCanvasDimensions(canvas) {
        // Save relative position
        const relativeX = this.x / this.canvas.width;
        const relativeY = this.y / this.canvas.height;
        
        // Update canvas reference
        this.canvas = canvas;
        
        // Update position
        this.x = relativeX * canvas.width;
        this.y = relativeY * canvas.height;
        
        // Scale radius and velocities based on canvas size
        const scaleFactor = Math.min(canvas.width, canvas.height) / 600;
        this.originalRadius = this.originalRadius * scaleFactor;
        this.radius = this.radius * scaleFactor;
        this.velocityX = this.velocityX * scaleFactor;
        this.velocityY = this.velocityY * scaleFactor;
    }
}

export default Particle; 