class Star {
    constructor(canvas, ctx, y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 10;
        this.collected = false;
        this.canvas = canvas;
        this.ctx = ctx;
    }

    draw() {
        if (!this.collected) {
            this.ctx.beginPath();
            this.ctx.fillStyle = '#FFD700';
            
            // Draw a 5-pointed star
            for (let i = 0; i < 5; i++) {
                let angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                let x = this.x + Math.cos(angle) * this.radius;
                let y = this.y + Math.sin(angle) * this.radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    update() {
        if (!this.collected) {
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
