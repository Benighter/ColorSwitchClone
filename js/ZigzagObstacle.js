class ZigzagObstacle {
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
        
        // Zigzag pattern properties
        this.zigzagCount = 8; // Number of zigzag segments per section
        this.zigzagAmplitude = 10; // Height of zigzag waves
        this.movementPhase = Math.random() * Math.PI * 2;
        this.movementSpeed = 0.03;
        this.movementAmount = 30; // How far it moves side to side
        
        // Visual effects
        this.glowIntensity = 0.5;
        this.glowSize = 5;
        this.pulseTime = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.04;
    }

    draw() {
        // Calculate position with zigzag movement
        this.movementPhase += this.movementSpeed;
        const offsetX = Math.sin(this.movementPhase) * this.movementAmount;
        
        this.ctx.save();
        this.ctx.translate(this.x + offsetX, this.y);
        this.ctx.rotate(this.rotation);

        // Calculate pulse effect
        this.pulseTime += this.pulseSpeed;
        const pulseValue = (Math.sin(this.pulseTime) + 1) * 0.5; // 0 to 1
        const glowSize = this.glowSize + pulseValue * 3;
        
        // Draw each colored section
        for (let i = 0; i < this.colors.length; i++) {
            const startAngle = (i * Math.PI / 2);
            const endAngle = ((i + 1) * Math.PI / 2);
            
            // Draw glow effect
            this.ctx.beginPath();
            this.drawZigzagArc(startAngle, endAngle, this.radius, this.zigzagCount, this.zigzagAmplitude, true);
            this.ctx.lineWidth = this.thickness + glowSize * 2;
            this.ctx.strokeStyle = `${this.colors[i]}${Math.floor(this.glowIntensity * pulseValue * 80).toString(16).padStart(2, '0')}`;
            this.ctx.stroke();
            
            // Draw main zigzag
            this.ctx.beginPath();
            this.drawZigzagArc(startAngle, endAngle, this.radius, this.zigzagCount, this.zigzagAmplitude, false);
            this.ctx.lineWidth = this.thickness;
            this.ctx.strokeStyle = this.colors[i];
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            // Draw highlight
            this.ctx.beginPath();
            this.drawZigzagArc(startAngle, endAngle, this.radius, this.zigzagCount, this.zigzagAmplitude * 0.8, false);
            this.ctx.lineWidth = this.thickness * 0.4;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + pulseValue * 0.3})`;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawZigzagArc(startAngle, endAngle, radius, segments, amplitude, isGlow) {
        const angleStep = (endAngle - startAngle) / segments;
        const points = [];
        
        // Generate zigzag points along the arc
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + i * angleStep;
            const direction = i % 2 === 0 ? 1 : -1;
            
            // Add zigzag effect perpendicular to the arc
            const radialOffset = direction * amplitude;
            const actualRadius = radius + (isGlow ? 0 : radialOffset);
            
            // Add wave effect to the zigzag over time
            const waveOffset = isGlow ? 0 : Math.sin(angle * 8 + this.pulseTime) * 3;
            const totalRadius = actualRadius + waveOffset;
            
            const x = totalRadius * Math.cos(angle);
            const y = totalRadius * Math.sin(angle);
            
            points.push({ x, y });
        }
        
        // Draw the path
        this.ctx.beginPath();
        if (points.length > 0) {
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
        }
    }

    update() {
        this.rotation += this.speed;
        this.draw();
    }

    checkCollision(ball) {
        // Calculate the actual x position with movement
        const offsetX = Math.sin(this.movementPhase) * this.movementAmount;
        const actualX = this.x + offsetX;
        
        // Calculate distance from ball to obstacle center
        let dx = ball.x - actualX;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // If ball has multicolor mode, it can pass through any color
        if (ball.multicolorMode) {
            return { collided: false, sameColor: true };
        }
        
        // Approximate collision with zigzag pattern
        // The collision radius varies between radius - amplitude and radius + amplitude
        const innerRadius = this.radius - this.zigzagAmplitude - this.thickness / 2;
        const outerRadius = this.radius + this.zigzagAmplitude + this.thickness / 2;
        
        if (distance > innerRadius - ball.radius && distance < outerRadius + ball.radius) {
            // Calculate the angle to determine which color section the ball hit
            let angle = Math.atan2(dy, dx) - this.rotation;
            let normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            let colorIndex = Math.floor(normalizedAngle / (Math.PI / 2)) % this.colors.length;
            
            // Check if ball color matches the section color
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

export default ZigzagObstacle; 