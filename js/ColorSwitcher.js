class ColorSwitcher {
    constructor(canvas, ctx, colors, y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 15;
        this.rotation = 0;
        this.speed = 0.05;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors;
        this.scale = 1;
        this.scaleDirection = 0.003;
        this.hoverEffect = 0;
        this.time = Math.random() * Math.PI * 2;
        this.timeSpeed = 0.03;
        this.glowSize = 5;
        this.trailParticles = [];
        this.maxTrailParticles = 5;
    }

    draw() {
        // Update breathing effect
        this.time += this.timeSpeed;
        this.hoverEffect = (Math.sin(this.time) + 1) / 2;
        
        // Update scale for subtle "breathing" effect
        this.scale += this.scaleDirection;
        if (this.scale > 1.1 || this.scale < 0.9) {
            this.scaleDirection *= -1;
        }
        
        // Draw trail particles
        this.trailParticles.forEach((particle, index) => {
            particle.life -= 0.02;
            if (particle.life <= 0) {
                this.trailParticles.splice(index, 1);
            } else {
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.globalAlpha = particle.life;
                
                for (let i = 0; i < this.colors.length; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, particle.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
                    this.ctx.fillStyle = this.colors[i];
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            }
        });
        
        // Add new trail particle occasionally
        if (Math.random() < 0.1 && this.trailParticles.length < this.maxTrailParticles) {
            this.trailParticles.push({
                x: this.x,
                y: this.y,
                radius: this.radius * (0.4 + Math.random() * 0.3),
                rotation: Math.random() * Math.PI * 2,
                life: 1
            });
        }
        
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);
        
        // Outer glow
        const glowSize = this.glowSize + this.hoverEffect * 3;
        
        for (let i = 0; i < this.colors.length; i++) {
            // Draw glow for each segment
            const gradient = this.ctx.createRadialGradient(0, 0, this.radius, 0, 0, this.radius + glowSize);
            gradient.addColorStop(0, `${this.colors[i]}90`);
            gradient.addColorStop(1, `${this.colors[i]}00`);
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius + glowSize, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Main color segments
        for (let i = 0; i < this.colors.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
        }
        
        // Center highlight
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + this.hoverEffect * 0.2})`;
        this.ctx.fill();

        this.ctx.restore();
    }

    update() {
        this.rotation += this.speed;
        this.draw();
    }

    checkCollision(ball) {
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + ball.radius;
    }
}

export default ColorSwitcher;
