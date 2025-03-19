class Powerup {
    constructor(canvas, ctx, type, x, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.collected = false;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
        this.scale = 1;
        this.scaleDirection = 0.004;
        this.hoverEffect = 0;
        this.time = Math.random() * Math.PI * 2;
        this.timeSpeed = 0.05;
        this.glowSize = 8;
        this.glowColor = this.getTypeColor();
        this.symbol = this.getTypeSymbol();
        
        // Specific powerup properties
        this.duration = this.getTypeDuration();
        this.description = this.getTypeDescription();
    }
    
    getTypeColor() {
        switch(this.type) {
            case 'shield': return '#3498db';
            case 'slowmo': return '#9b59b6';
            case 'magnet': return '#e74c3c';
            case 'multicolor': return '#f1c40f';
            case 'shrink': return '#1abc9c';
            default: return '#ffffff';
        }
    }
    
    getTypeSymbol() {
        switch(this.type) {
            case 'shield': return '🛡️';
            case 'slowmo': return '⏱️';
            case 'magnet': return '🧲';
            case 'multicolor': return '🌈';
            case 'shrink': return '📏';
            default: return '✨';
        }
    }
    
    getTypeDuration() {
        switch(this.type) {
            case 'shield': return 1; // One-time use
            case 'slowmo': return 5; // 5 seconds
            case 'magnet': return 8; // 8 seconds
            case 'multicolor': return 6; // 6 seconds
            case 'shrink': return 7; // 7 seconds
            default: return 5;
        }
    }
    
    getTypeDescription() {
        switch(this.type) {
            case 'shield': return 'Protects from one collision';
            case 'slowmo': return 'Slows down obstacles';
            case 'magnet': return 'Attracts stars & powerups';
            case 'multicolor': return 'Pass through any color';
            case 'shrink': return 'Shrinks for tight spaces';
            default: return 'Powerup';
        }
    }

    draw() {
        if (this.collected) return;
        
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);
        
        // Draw glow effect
        const gradient = this.ctx.createRadialGradient(0, 0, this.radius * 0.8, 0, 0, this.radius + this.glowSize);
        gradient.addColorStop(0, `${this.glowColor}90`);
        gradient.addColorStop(1, `${this.glowColor}00`);
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius + this.glowSize, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw powerup background
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.glowColor;
        this.ctx.fill();
        
        // Draw inner highlight
        this.ctx.beginPath();
        this.ctx.arc(-this.radius * 0.2, -this.radius * 0.2, this.radius * 0.5, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + this.hoverEffect * 0.2})`;
        this.ctx.fill();
        
        // Draw icon/symbol
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${this.radius * 1.2}px Arial`;
        this.ctx.fillText(this.symbol, 0, 0);
        
        this.ctx.restore();
    }

    update() {
        if (this.collected) return;
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Update pulsing effect
        this.time += this.timeSpeed;
        this.hoverEffect = (Math.sin(this.time) + 1) / 2;
        
        // Update scale for subtle breathing effect
        this.scale += this.scaleDirection;
        if (this.scale > 1.1 || this.scale < 0.9) {
            this.scaleDirection *= -1;
        }
        
        this.draw();
    }

    checkCollision(ball) {
        if (this.collected) return false;
        
        let dx = ball.x - this.x;
        let dy = ball.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + ball.radius) {
            this.collected = true;
            return true;
        }
        return false;
    }
    
    activate(ball, gameState) {
        // Apply powerup effect based on type
        switch(this.type) {
            case 'shield':
                gameState.activePowerups.shield = true;
                // One-time use powerup
                break;
                
            case 'slowmo':
                gameState.activePowerups.slowmo = this.duration;
                gameState.timeDilation = 0.5; // Slow everything to half speed
                break;
                
            case 'magnet':
                gameState.activePowerups.magnet = this.duration;
                ball.magnetRadius = 150; // Set magnet attraction radius
                break;
                
            case 'multicolor':
                gameState.activePowerups.multicolor = this.duration;
                ball.multicolorMode = true;
                break;
                
            case 'shrink':
                gameState.activePowerups.shrink = this.duration;
                ball.originalRadius = ball.radius;
                ball.radius *= 0.6; // Shrink to 60% of original size
                break;
        }
    }
    
    updateCanvasDimensions(canvas) {
        // Save the relative position before updating canvas
        const relativeX = this.x / this.canvas.width;
        const relativeY = this.y / this.canvas.height;
        
        // Update canvas reference
        this.canvas = canvas;
        
        // Update position based on relative coordinates
        this.x = relativeX * canvas.width;
        this.y = relativeY * canvas.height;
        
        // Scale radius based on canvas size
        const scaleFactor = Math.min(canvas.width, canvas.height) / 600;
        this.radius = 15 * scaleFactor;
        this.glowSize = 8 * scaleFactor;
    }
}

export default Powerup; 