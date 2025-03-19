class Ball {
    constructor(canvas, ctx, colors, currentColorIndex) {
        this.canvas = canvas; 
        this.radius = 15;
        this.originalRadius = 15; // For shrink powerup
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
        // Powerup effects
        this.multicolorMode = false;
        this.multicolorTimer = 0;
        this.multicolorColors = colors;
        this.shieldActive = false;
        this.magnetRadius = 0; // Magnet powerup range (0 = inactive)
    }

    draw() {
        // Draw trail
        if (this.trailPoints.length > 0) {
            for (let i = 0; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const opacity = (i / this.trailPoints.length) * this.trailOpacity;
                const radius = this.radius * (0.5 + (i / this.trailPoints.length) * 0.5);
                
                // For multicolor mode, use rainbow trail
                let trailColor = this.color;
                if (this.multicolorMode) {
                    const colorIndex = (this.colorIndex + i) % this.multicolorColors.length;
                    trailColor = this.multicolorColors[colorIndex];
                }
                
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `${trailColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
                this.ctx.fill();
                this.ctx.closePath();
            }
        }

        // Draw magnet field if active
        if (this.magnetRadius > 0) {
            const gradient = this.ctx.createRadialGradient(
                this.x, this.y, this.radius,
                this.x, this.y, this.magnetRadius
            );
            gradient.addColorStop(0, `#e74c3c50`);
            gradient.addColorStop(1, `#e74c3c00`);
            
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.magnetRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.closePath();
            
            // Draw magnetic field lines
            this.ctx.save();
            this.ctx.translate(this.x, this.y);
            
            const time = Date.now() / 1000;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time % (Math.PI * 2);
                this.ctx.beginPath();
                this.ctx.moveTo(this.radius * Math.cos(angle), this.radius * Math.sin(angle));
                this.ctx.lineTo(this.magnetRadius * 0.7 * Math.cos(angle), this.magnetRadius * 0.7 * Math.sin(angle));
                this.ctx.strokeStyle = `#e74c3c80`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.ctx.restore();
        }

        // Outer glow effect
        if (this.glowEffect) {
            // Use rainbow glow for multicolor mode
            let glowColor = this.color;
            if (this.multicolorMode) {
                const time = Date.now() / 1000;
                const hue = (time * 100) % 360;
                glowColor = `hsl(${hue}, 100%, 50%)`;
            }
            
            const gradient = this.ctx.createRadialGradient(
                this.x, this.y, this.radius,
                this.x, this.y, this.radius + this.glowSize
            );
            gradient.addColorStop(0, `${glowColor}${Math.floor(this.glowOpacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${glowColor}00`);
            
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius + this.glowSize, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Main ball with pulsing effect
        const pulseRadius = this.radius + this.pulseEffect;
        
        // Draw shield effect if active
        if (this.shieldActive) {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, pulseRadius + 5, 0, Math.PI * 2);
            
            // Shield bubble effect
            const shieldGradient = this.ctx.createRadialGradient(
                this.x, this.y, pulseRadius,
                this.x, this.y, pulseRadius + 8
            );
            shieldGradient.addColorStop(0, 'rgba(52, 152, 219, 0.6)');
            shieldGradient.addColorStop(0.7, 'rgba(52, 152, 219, 0.2)');
            shieldGradient.addColorStop(1, 'rgba(52, 152, 219, 0)');
            
            this.ctx.fillStyle = shieldGradient;
            this.ctx.fill();
            
            // Shield border
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, pulseRadius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        // Draw the ball itself
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        
        // Use rainbow color for multicolor mode
        if (this.multicolorMode) {
            const time = Date.now() / 1000;
            const hue = (time * 100) % 360;
            this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        } else {
            this.ctx.fillStyle = this.color;
        }
        
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

        // Update multicolor effect
        if (this.multicolorMode && this.multicolorTimer > 0) {
            this.multicolorTimer -= 1/60; // Assuming 60fps
            if (this.multicolorTimer <= 0) {
                this.multicolorMode = false;
            }
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
    
    activateShield() {
        this.shieldActive = true;
    }
    
    deactivateShield() {
        this.shieldActive = false;
    }
    
    activateMulticolor(duration) {
        this.multicolorMode = true;
        this.multicolorTimer = duration;
    }
    
    activateMagnet(radius, duration) {
        this.magnetRadius = radius;
        // Magnet effect will be handled in the game loop
        // to attract collectibles toward the ball
    }
    
    deactivateMagnet() {
        this.magnetRadius = 0;
    }
    
    activateShrink(duration) {
        this.originalRadius = this.radius;
        this.radius *= 0.6; // Shrink to 60% size
    }
    
    deactivateShrink() {
        this.radius = this.originalRadius;
    }

    updateCanvasDimensions(canvas) {
        // Save the relative position before updating canvas
        const relativeY = this.y / this.canvas.height;
        
        // Update canvas reference
        this.canvas = canvas;
        
        // Recalculate position based on new dimensions
        this.x = canvas.width / 2;
        
        // Make sure the ball stays visible
        if (relativeY < 0 || relativeY > 1) {
            // Reset to default position if outside valid range
            this.y = canvas.height - this.radius - 10;
        } else {
            this.y = relativeY * canvas.height;
        }
        
        // Adjust radius based on canvas size (optional)
        const scaleFactor = Math.min(canvas.width, canvas.height) / 600;
        this.radius = 15 * scaleFactor;
        
        // Update magnet radius if active
        if (this.magnetRadius > 0) {
            this.magnetRadius = 150 * scaleFactor;
        }
    }
}

export default Ball;
