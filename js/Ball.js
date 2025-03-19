class Ball {
    constructor(canvas, ctx, colors, currentColorIndex) {
        this.canvas = canvas; 
        this.radius = 15;
        this.x = canvas.width / 2;
        this.y = canvas.height - this.radius - 10;
        this.color = colors[currentColorIndex];
        this.colorIndex = currentColorIndex;
        this.velocity = 0;
        this.gravity = 0.5;
        this.lift = -10;
        this.ctx = ctx;
        this.trailPoints = [];
        this.maxTrailLength = 10;
        this.trailOpacity = 0.6;
        this.pulseEffect = 0;
        this.pulseDirection = 0.05;
        // For creative mode
        this.isCreativeMode = false;
        this.glowEffect = true;
        this.glowSize = 5;
        this.glowOpacity = 0.6;
    }

    draw() {
        // Draw trail
        if (this.trailPoints.length > 0) {
            for (let i = 0; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const opacity = (i / this.trailPoints.length) * this.trailOpacity;
                const radius = this.radius * (0.5 + (i / this.trailPoints.length) * 0.5);
                
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `${this.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                this.ctx.fill();
                this.ctx.closePath();
            }
        }

        // Outer glow effect
        if (this.glowEffect) {
            const gradient = this.ctx.createRadialGradient(
                this.x, this.y, this.radius,
                this.x, this.y, this.radius + this.glowSize
            );
            gradient.addColorStop(0, `${this.color}${Math.floor(this.glowOpacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${this.color}00`);
            
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius + this.glowSize, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Main ball with pulsing effect
        const pulseRadius = this.radius + this.pulseEffect;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
        
        // Add inner highlight
        const highlightRadius = pulseRadius * 0.6;
        const highlightX = this.x - highlightRadius * 0.3;
        const highlightY = this.y - highlightRadius * 0.3;
        
        this.ctx.beginPath();
        this.ctx.arc(highlightX, highlightY, highlightRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        this.ctx.fill();
        this.ctx.closePath();
    }

    update() {
        // Update pulse effect
        this.pulseEffect += this.pulseDirection;
        if (this.pulseEffect > 2 || this.pulseEffect < 0) {
            this.pulseDirection *= -1;
        }

        // In creative mode, no gravity or ground collision if user wants to fly
        if (this.isCreativeMode && this.velocity > 0) {
            this.velocity *= 0.98; // Smoother descent in creative mode
        } else {
            this.velocity += this.gravity;
        }
        
        this.y += this.velocity;

        // Ground collision
        if (this.y + this.radius > this.canvas.height) {
            this.y = this.canvas.height - this.radius;
            this.velocity = 0;
        }

        // Add current position to trail
        this.trailPoints.unshift({ x: this.x, y: this.y });
        
        // Limit trail length
        if (this.trailPoints.length > this.maxTrailLength) {
            this.trailPoints.pop();
        }

        this.draw();
    }

    jump() {
        this.velocity = this.lift;
        
        // In creative mode, allow multiple jumps
        if (this.isCreativeMode) {
            this.velocity = this.lift * 1.2; // Stronger jump in creative mode
        } 
        // In regular mode, only allow jumps when on ground
        else if (this.y + this.radius >= this.canvas.height - 1) {
            this.velocity = this.lift;
        }
    }

    switchColor(colors, newColorIndex) {
        this.colorIndex = newColorIndex;
        this.color = colors[newColorIndex];
    }

    toggleCreativeMode(isEnabled) {
        this.isCreativeMode = isEnabled;
        if (isEnabled) {
            this.glowSize = 8;
            this.glowOpacity = 0.8;
            this.maxTrailLength = 15;
            this.trailOpacity = 0.8;
        } else {
            this.glowSize = 5;
            this.glowOpacity = 0.6;
            this.maxTrailLength = 10;
            this.trailOpacity = 0.6;
        }
    }
}

export default Ball;
