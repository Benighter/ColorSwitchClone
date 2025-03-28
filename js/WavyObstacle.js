export default class WavyObstacle {
    constructor(canvas, ctx, colors, y) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.colors = colors;
        this.y = y;
        this.rotation = 0;
        this.amplitude = 30; // Wave height
        this.frequency = 0.02; // Wave frequency
        this.segments = 4;
        this.segmentAngle = (Math.PI * 2) / this.segments;
        this.speed = 0.02;
        this.radius = 20;
        this.baseY = y;
        this.time = 0;
        this.passed = false;
    }

    update() {
        this.rotation += this.speed;
        this.time += 0.02;
        this.y = this.baseY + Math.sin(this.time) * this.amplitude;
        this.draw();
    }

    draw() {
        for (let i = 0; i < this.segments; i++) {
            const startAngle = i * this.segmentAngle + this.rotation;
            const endAngle = startAngle + this.segmentAngle;
            
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width / 2, this.y, this.radius, startAngle, endAngle);
            this.ctx.strokeStyle = this.colors[i % this.colors.length];
            this.ctx.lineWidth = 15;
            this.ctx.stroke();
        }
    }

    checkCollision(ball) {
        const dx = ball.x - this.canvas.width / 2;
        const dy = ball.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + ball.radius) {
            const currentSegment = Math.floor(((Math.atan2(dy, dx) + Math.PI - this.rotation) % (Math.PI * 2)) / this.segmentAngle);
            const segmentColor = this.colors[currentSegment % this.colors.length];
            
            return {
                collided: true,
                sameColor: ball.color === segmentColor
            };
        }
        return {
            collided: false,
            sameColor: false
        };
    }
}