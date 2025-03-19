class Background {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.time = 0;
        this.speed = 0.002;
        this.colorStops = [
            { offset: 0, color: '#1a001a' },
            { offset: 0.3, color: '#000033' },
            { offset: 0.6, color: '#000033' },
            { offset: 1, color: '#1a001a' }
        ];
        this.stars = [];
        this.createStars(100);
    }

    createStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 3,
                radius: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.2 + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.01 + 0.005,
                twinkleTime: Math.random() * 100
            });
        }
    }

    update(cameraY) {
        this.time += this.speed;
        this.drawGradient(cameraY);
        this.drawStars(cameraY);
    }

    drawGradient(cameraY) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Animated gradient with time-based color shifting
        this.colorStops.forEach(stop => {
            const hue = (Math.sin(this.time + stop.offset * 5) * 20 + 250) % 360;
            const color = `hsl(${hue}, 100%, ${15 + 5 * stop.offset}%)`;
            gradient.addColorStop(stop.offset, color);
        });
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, -cameraY, this.canvas.width, this.canvas.height);
    }

    drawStars(cameraY) {
        this.ctx.save();
        
        this.stars.forEach(star => {
            // Update star twinkle effect
            star.twinkleTime += star.twinkleSpeed;
            const twinkle = (Math.sin(star.twinkleTime) + 1) / 2;
            
            // Draw star with varying opacity for twinkling effect
            this.ctx.globalAlpha = star.opacity * twinkle;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
            
            // Move star down slowly
            star.y += star.speed;
            
            // Reset star position if it goes off screen
            if (star.y - cameraY > this.canvas.height) {
                star.y = -cameraY - star.radius;
                star.x = Math.random() * this.canvas.width;
            }
        });
        
        this.ctx.restore();
    }

    updateCanvasDimensions(canvas) {
        // Update canvas reference
        this.canvas = canvas;
        
        // Adjust stars to fit new canvas dimensions
        this.stars.forEach(star => {
            // Keep relative horizontal position
            star.x = (star.x / this.canvas.width) * canvas.width;
            
            // Ensure stars are distributed throughout the visible area
            if (star.y > canvas.height * 3) {
                star.y = Math.random() * canvas.height * 3;
            }
        });
        
        // Add more stars if the canvas is significantly larger
        const scaleFactor = (canvas.width * canvas.height) / (400 * 600);
        if (scaleFactor > 1.5 && this.stars.length < 150) {
            const additionalStars = Math.floor((scaleFactor - 1) * 50);
            this.createStars(additionalStars);
        }
    }
}

export default Background; 