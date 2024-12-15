class Ball {
    constructor(canvas, ctx, colors, currentColorIndex) {
        this.canvas = canvas; 
        this.radius = 15;
        this.x = canvas.width / 2;
        this.y = canvas.height - this.radius - 10;
        this.color = colors[currentColorIndex];
        this.velocity = 0;
        this.gravity = 0.5;
        this.lift = -10;
        this.ctx = ctx;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.radius > this.canvas.height) {
            this.y = this.canvas.height - this.radius;
            this.velocity = 0;
        }

        this.draw();
    }

    jump() {
        this.velocity = this.lift;
    }

    switchColor(colors, currentColorIndex) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        this.color = colors[currentColorIndex];
    }
}

export default Ball;
