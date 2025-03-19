class Obstacle {
    constructor(canvas, ctx, colors, y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 100;
        this.thickness = 20;
        this.rotation = 0;
        this.speed = 0.02;
        this.passed = false;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors;
        this.segments = [];
        this.glowIntensity = 0.5;
        this.pulseSpeed = 0.02;
        this.pulseTime = Math.random() * Math.PI * 2;
        this.glowSize = 5;
        // Create random motion patterns for each segment
        for (let i = 0; i < this.colors.length; i++) {
            this.segments.push({
                angleOffset: 0,
                amplitude: Math.random() * 0.01,
                frequency: Math.random() * 0.05 + 0.02,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);

        // Update pulse effect
        this.pulseTime += this.pulseSpeed;
        const pulseValue = (Math.sin(this.pulseTime) + 1) * 0.5; // 0 to 1
        const glowSize = this.glowSize + pulseValue * 2;
        
        for (let i = 0; i < this.colors.length; i++) {
            // Apply segment-specific motion
            const segment = this.segments[i];
            const segmentRotation = segment.angleOffset + 
                Math.sin(this.rotation * segment.frequency + segment.phase) * segment.amplitude;
                
            this.ctx.save();
            this.ctx.rotate(segmentRotation);
            
            // Draw glow effect
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.lineWidth = this.thickness + glowSize * 2;
            this.ctx.strokeStyle = `${this.colors[i]}${Math.floor(this.glowIntensity * pulseValue * 80).toString(16).padStart(2, '0')}`;
            this.ctx.stroke();
            
            // Draw main arc with gradient
            const gradient = this.ctx.createLinearGradient(
                Math.cos(i * Math.PI / 2) * this.radius, 
                Math.sin(i * Math.PI / 2) * this.radius,
                Math.cos((i + 1) * Math.PI / 2) * this.radius, 
                Math.sin((i + 1) * Math.PI / 2) * this.radius
            );
            
            // Create subtle gradient effect along the arc
            gradient.addColorStop(0, this.colors[i]);
            gradient.addColorStop(0.5, this.lightenColor(this.colors[i], 20));
            gradient.addColorStop(1, this.colors[i]);
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.lineWidth = this.thickness;
            this.ctx.strokeStyle = gradient;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            // Add highlight effect
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.lineWidth = this.thickness * 0.4;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + pulseValue * 0.3})`;
            this.ctx.stroke();
            
            this.ctx.restore();
        }

        this.ctx.restore();
    }

    // Helper function to lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }

    update() {
        this.rotation += this.speed;
        this.draw();
    }

    checkCollision(ball) {
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let innerRadius = this.radius - this.thickness / 2;
        let outerRadius = this.radius + this.thickness / 2;

        if (distance > innerRadius - ball.radius && distance < outerRadius + ball.radius) {
            let angle = Math.atan2(dy, dx) - this.rotation;
            let normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            let colorIndex = Math.floor(normalizedAngle / (Math.PI / 2)) % this.colors.length;

            if (distance >= innerRadius - ball.radius && distance <= outerRadius + ball.radius) {
                return {
                    collided: true,
                    sameColor: this.colors[colorIndex] === ball.color
                };
            }
        }

        return { collided: false, sameColor: false };
    }
}

export default Obstacle;
