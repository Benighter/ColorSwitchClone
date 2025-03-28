class SpiralObstacle {
    constructor(canvas, ctx, colors, y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.baseRadius = 100;
        this.radius = this.baseRadius;
        this.thickness = 15;
        this.rotation = 0;
        this.speed = 0.03;
        this.passed = false;
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors;
        this.arms = 4; // Number of spiral arms
        this.spiralTightness = 0.2;
        this.maxRotationRadius = 15; // How far the arms extend beyond the base circle
        this.pulseTime = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.03;
        this.glowIntensity = 0.6;
        this.glowSize = 8;
        
        // Animation properties
        this.pulsingSize = true;
        this.pulseAmount = 0.12; // 12% size variation
        
        // Create a unique random seed for this obstacle
        this.animationSeed = Math.random() * 1000;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        // Update pulse time
        this.pulseTime += this.pulseSpeed;
        const pulseValue = (Math.sin(this.pulseTime) + 1) * 0.5; // 0 to 1
        
        // Apply size pulsation if enabled
        if (this.pulsingSize) {
            this.radius = this.baseRadius * (1 - this.pulseAmount + pulseValue * (this.pulseAmount * 2));
        } else {
            this.radius = this.baseRadius;
        }
        
        // Calculate glow size with pulse effect
        const glowSize = this.glowSize + pulseValue * 3;
        
        // Draw spiral arms
        for (let i = 0; i < this.arms; i++) {
            const colorIndex = i % this.colors.length;
            const angleOffset = (Math.PI * 2 / this.arms) * i;
            
            this.ctx.save();
            this.ctx.rotate(this.rotation + angleOffset);
            
            // Draw the spiral arm with glow
            this.ctx.beginPath();
            this.drawSpiralArm(this.radius, glowSize * 2, this.colors[colorIndex], pulseValue, true);
            this.ctx.lineWidth = this.thickness + glowSize;
            this.ctx.strokeStyle = `${this.colors[colorIndex]}${Math.floor(this.glowIntensity * pulseValue * 90).toString(16).padStart(2, '0')}`;
            this.ctx.stroke();
            
            // Draw the main spiral arm
            this.ctx.beginPath();
            this.drawSpiralArm(this.radius, glowSize, this.colors[colorIndex], pulseValue, false);
            this.ctx.lineWidth = this.thickness;
            this.ctx.strokeStyle = this.colors[colorIndex];
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            // Add highlight effect to the spiral arm
            this.ctx.beginPath();
            this.drawSpiralArm(this.radius, glowSize, this.colors[colorIndex], pulseValue, false);
            this.ctx.lineWidth = this.thickness * 0.4;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + pulseValue * 0.3})`;
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawSpiralArm(radius, glowSize, color, pulseValue, isGlow) {
        const steps = 80;
        const rotations = 0.85; // Less than one full rotation to leave a gap
        
        // Draw spiral path
        this.ctx.beginPath();
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = rotations * Math.PI * 2 * t;
            const r = radius * t;
            
            // Add some wave effect to the spiral
            const waveOffset = isGlow ? 0 : Math.sin(t * 12 + this.pulseTime) * 3;
            
            const x = r * Math.cos(angle) + waveOffset;
            const y = r * Math.sin(angle) + waveOffset;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
    }

    update() {
        this.rotation += this.speed;
        this.draw();
    }

    checkCollision(ball) {
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // If ball has multicolor powerup, it can pass through any color
        if (ball.multicolorMode) {
            return { collided: false, sameColor: true };
        }
        
        // Complex collision detection for spirals
        // We simplify by checking if the ball is within the radius + margin
        const collisionRadius = this.radius * 0.9; // Slightly smaller to match visual appearance
        
        if (distance < collisionRadius + ball.radius) {
            // Calculate the angle of the ball relative to the obstacle center
            let angle = Math.atan2(dy, dx) - this.rotation;
            let normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            
            // Determine which arm the ball is hitting based on the angle
            let armIndex = Math.floor((normalizedAngle / (Math.PI * 2)) * this.arms) % this.arms;
            let colorIndex = armIndex % this.colors.length;
            
            // Check if ball color matches the arm color
            if (this.colors[colorIndex] === ball.color) {
                return { collided: true, sameColor: true };
            } else {
                return { collided: true, sameColor: false };
            }
        }
        
        return { collided: false, sameColor: false };
    }

    updateCanvasDimensions(canvas) {
        // Save the relative position before updating canvas
        const relativeY = this.y / this.canvas.height;
        
        // Update canvas reference
        this.canvas = canvas;
        
        // Update position
        this.x = canvas.width / 2;
        this.y = relativeY * canvas.height;
    }
}

export default SpiralObstacle; 