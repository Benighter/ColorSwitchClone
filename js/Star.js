class Star {
    constructor(canvas, ctx, y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.canvas = canvas;
        this.ctx = ctx;
        this.rotation = 0;
        this.rotationSpeed = 0.01 + Math.random() * 0.02;
        this.scale = 1;
        this.scaleDirection = 0.005;
        this.hoverEffect = 0;
        this.time = Math.random() * 100;
        this.timeSpeed = 0.05;
        this.innerPoints = [];
        this.outerPoints = [];
        this.calculateStarPoints();
    }

    calculateStarPoints() {
        const innerRadius = this.radius * 0.4;
        this.innerPoints = [];
        this.outerPoints = [];
        
        for (let i = 0; i < 5; i++) {
            const outerAngle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const innerAngle = outerAngle + Math.PI / 5;
            
            // Outer point
            this.outerPoints.push({
                x: Math.cos(outerAngle) * this.radius,
                y: Math.sin(outerAngle) * this.radius
            });
            
            // Inner point
            this.innerPoints.push({
                x: Math.cos(innerAngle) * innerRadius,
                y: Math.sin(innerAngle) * innerRadius
            });
        }
    }

    draw() {
        if (!this.collected) {
            this.ctx.save();
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(this.rotation);
            this.ctx.scale(this.scale, this.scale);
            
            // Create glow effect
            const gradient = this.ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.5);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Draw star shape with gradient
            this.ctx.beginPath();
            
            // Start at the first outer point
            this.ctx.moveTo(this.outerPoints[0].x, this.outerPoints[0].y);
            
            // Connect all points
            for (let i = 0; i < 5; i++) {
                this.ctx.lineTo(this.innerPoints[i].x, this.innerPoints[i].y);
                this.ctx.lineTo(this.outerPoints[(i + 1) % 5].x, this.outerPoints[(i + 1) % 5].y);
            }
            
            this.ctx.closePath();
            
            // Create gold gradient
            const starGradient = this.ctx.createRadialGradient(0, 0, this.radius * 0.1, 0, 0, this.radius);
            starGradient.addColorStop(0, '#FFFAA0');
            starGradient.addColorStop(0.6, '#FFD700');
            starGradient.addColorStop(1, '#FFA500');
            
            this.ctx.fillStyle = starGradient;
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            
            // Add inner shine with pulse effect
            this.ctx.beginPath();
            this.ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + this.hoverEffect * 0.2})`;
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }

    update() {
        if (!this.collected) {
            // Update rotation
            this.rotation += this.rotationSpeed;
            
            // Update pulsing effect
            this.time += this.timeSpeed;
            this.hoverEffect = (Math.sin(this.time) + 1) / 2;
            
            // Update scale for subtle breathing effect
            this.scale += this.scaleDirection;
            if (this.scale > 1.05 || this.scale < 0.95) {
                this.scaleDirection *= -1;
            }
            
            this.draw();
        }
    }

    checkCollision(ball) {
        if (!this.collected) {
            let dx = ball.x - this.x;
            let dy = ball.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            return distance < this.radius + ball.radius;
        }
        return false;
    }
}

export default Star;
