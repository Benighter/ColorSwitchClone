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
        this.defaultStarCount = 100;
        this.createStars(this.defaultStarCount);
        
        // Special effects
        this.showVortex = false;
        this.vortexX = canvas.width / 2;
        this.vortexY = canvas.height / 2;
        this.vortexRadius = 200;
        this.vortexRotation = 0;
        
        // Aurora effect
        this.showAurora = false;
        this.auroraPoints = [];
        this.createAurora();
        
        // Black hole effect
        this.showBlackHole = false;
        this.blackHoleX = canvas.width / 2;
        this.blackHoleY = canvas.height / 2;
        this.blackHoleRadius = 100;
        this.blackHoleRotation = 0;
    }

    createStars(count) {
        this.stars = [];
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
    
    createAurora() {
        this.auroraPoints = [];
        const segmentCount = 5;
        const heightVariance = 0.3;
        
        for (let i = 0; i < segmentCount; i++) {
            const points = [];
            const baseY = this.canvas.height * (0.3 + Math.random() * 0.4);
            const amplitude = this.canvas.height * 0.1;
            const wavelength = this.canvas.width / (2 + Math.random() * 3);
            
            for (let x = 0; x < this.canvas.width; x += 5) {
                points.push({
                    x: x,
                    y: baseY + Math.sin(x / wavelength) * amplitude
                });
            }
            
            this.auroraPoints.push({
                points: points,
                color: `hsl(${120 + Math.random() * 60}, 100%, 60%)`,
                speed: 0.3 + Math.random() * 0.5,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    setTheme(theme, starDensity = 100) {
        // Update color stops based on theme
        switch(theme) {
            case "nebula":
                this.colorStops = [
                    { offset: 0, color: '#1a0033' },
                    { offset: 0.3, color: '#330033' },
                    { offset: 0.6, color: '#330033' },
                    { offset: 1, color: '#1a0033' }
                ];
                this.showVortex = false;
                this.showAurora = false;
                this.showBlackHole = false;
                break;
                
            case "vortex":
                this.colorStops = [
                    { offset: 0, color: '#000033' },
                    { offset: 0.3, color: '#003333' },
                    { offset: 0.6, color: '#003333' },
                    { offset: 1, color: '#000033' }
                ];
                this.showVortex = true;
                this.showAurora = false;
                this.showBlackHole = false;
                break;
                
            case "aurora":
                this.colorStops = [
                    { offset: 0, color: '#001a1a' },
                    { offset: 0.3, color: '#001a33' },
                    { offset: 0.6, color: '#001a33' },
                    { offset: 1, color: '#001a1a' }
                ];
                this.showVortex = false;
                this.showAurora = true;
                this.showBlackHole = false;
                break;
                
            case "black_hole":
                this.colorStops = [
                    { offset: 0, color: '#000000' },
                    { offset: 0.3, color: '#0a0a0a' },
                    { offset: 0.6, color: '#0a0a0a' },
                    { offset: 1, color: '#000000' }
                ];
                this.showVortex = false;
                this.showAurora = false;
                this.showBlackHole = true;
                break;
                
            default: // cosmic
                this.colorStops = [
                    { offset: 0, color: '#1a001a' },
                    { offset: 0.3, color: '#000033' },
                    { offset: 0.6, color: '#000033' },
                    { offset: 1, color: '#1a001a' }
                ];
                this.showVortex = false;
                this.showAurora = false;
                this.showBlackHole = false;
                break;
        }
        
        // Update star count
        if (starDensity !== this.defaultStarCount) {
            this.createStars(starDensity);
            this.defaultStarCount = starDensity;
        }
        
        // Reset special effects
        if (this.showAurora) {
            this.createAurora();
        }
    }

    update(cameraY) {
        this.time += this.speed;
        this.drawGradient(cameraY);
        
        // Draw special effects
        if (this.showVortex) {
            this.drawVortex(cameraY);
        }
        
        if (this.showAurora) {
            this.drawAurora(cameraY);
        }
        
        if (this.showBlackHole) {
            this.drawBlackHole(cameraY);
        }
        
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
    
    drawVortex(cameraY) {
        // Update vortex position to follow camera
        this.vortexY = this.canvas.height / 2 - cameraY;
        this.vortexRotation += 0.01;
        
        this.ctx.save();
        this.ctx.translate(this.vortexX, this.vortexY);
        this.ctx.rotate(this.vortexRotation);
        
        // Draw spiral effect
        const gradient = this.ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.vortexRadius
        );
        gradient.addColorStop(0, 'rgba(0, 156, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(0, 156, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(0, 156, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.vortexRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw spiral arms
        const spiralCount = 4;
        for (let i = 0; i < spiralCount; i++) {
            const startAngle = (i / spiralCount) * Math.PI * 2;
            
            this.ctx.beginPath();
            for (let r = 0; r < this.vortexRadius; r += 2) {
                const angle = startAngle + (r / this.vortexRadius) * Math.PI * 6;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                
                if (r === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.strokeStyle = 'rgba(0, 156, 255, 0.15)';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawAurora(cameraY) {
        this.ctx.save();
        
        // Update and draw each aurora wave
        this.auroraPoints.forEach(aurora => {
            aurora.offset += aurora.speed * 0.01;
            
            this.ctx.beginPath();
            const startY = aurora.points[0].y - cameraY;
            this.ctx.moveTo(0, startY);
            
            aurora.points.forEach((point, index) => {
                const x = point.x;
                const y = point.y - cameraY + Math.sin(this.time * aurora.speed + index * 0.1 + aurora.offset) * 20;
                this.ctx.lineTo(x, y);
            });
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();
            
            // Create gradient for aurora effect
            const gradient = this.ctx.createLinearGradient(0, startY, 0, startY + 100);
            gradient.addColorStop(0, aurora.color + '00');
            gradient.addColorStop(0.5, aurora.color + '40');
            gradient.addColorStop(1, aurora.color + '00');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }
    
    drawBlackHole(cameraY) {
        // Update black hole position to follow camera
        this.blackHoleY = this.canvas.height / 2 - cameraY;
        this.blackHoleRotation += 0.02;
        
        this.ctx.save();
        this.ctx.translate(this.blackHoleX, this.blackHoleY);
        
        // Draw event horizon
        const gradient = this.ctx.createRadialGradient(
            0, 0, 0,
            0, 0, this.blackHoleRadius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.7, 'rgba(50, 0, 50, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.blackHoleRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw accretion disk
        this.ctx.rotate(this.blackHoleRotation);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.blackHoleRadius * 1.5, this.blackHoleRadius * 0.5, 0, 0, Math.PI * 2);
        
        const diskGradient = this.ctx.createRadialGradient(
            0, 0, this.blackHoleRadius * 0.7,
            0, 0, this.blackHoleRadius * 1.5
        );
        diskGradient.addColorStop(0, 'rgba(255, 0, 255, 0)');
        diskGradient.addColorStop(0.7, 'rgba(255, 0, 100, 0.2)');
        diskGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        this.ctx.fillStyle = diskGradient;
        this.ctx.fill();
        
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
        
        // Update special effects positions
        this.vortexX = canvas.width / 2;
        this.vortexRadius = canvas.width * 0.3;
        
        this.blackHoleX = canvas.width / 2;
        this.blackHoleRadius = canvas.width * 0.15;
        
        // Recreate aurora if active
        if (this.showAurora) {
            this.createAurora();
        }
    }
}

export default Background; 