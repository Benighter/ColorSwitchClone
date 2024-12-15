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
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);

        for (let i = 0; i < this.colors.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.strokeStyle = this.colors[i];
            this.ctx.lineWidth = this.thickness;
            this.ctx.stroke();
        }

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
