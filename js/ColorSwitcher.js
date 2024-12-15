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
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);

        for (let i = 0; i < this.colors.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
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

        return distance < this.radius + ball.radius;
    }
}

export default ColorSwitcher;
