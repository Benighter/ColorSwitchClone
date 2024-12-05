// Game constants and variables
const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40'];
let currentColorIndex = 0;
let score = 0;
let highScore = 0;
let cameraY = 0;
let maxCameraY = 0; // Add this with other global variables at the top
let gameSpeed = 2;

// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const finalHighScoreElement = document.getElementById('finalHighScore');
const restartButton = document.getElementById('restartButton');

// Set canvas dimensions
canvas.width = 400;
canvas.height = 600;

class Ball {
    constructor() {
        this.radius = 15;
        this.x = canvas.width / 2;
        this.y = canvas.height - this.radius - 10;
        this.color = colors[currentColorIndex];
        this.velocity = 0;
        this.gravity = 0.5;
        this.lift = -10;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocity = 0;
        }

        this.draw();
    }

    jump() {
        this.velocity = this.lift;
    }

    switchColor() {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        this.color = colors[currentColorIndex];
    }
}

class Obstacle {
    constructor(y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 100;
        this.thickness = 20;
        this.rotation = 0;
        this.speed = 0.02;
        this.passed = false;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let i = 0; i < colors.length; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = this.thickness;
            ctx.stroke();
        }

        ctx.restore();
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
            let colorIndex = Math.floor(normalizedAngle / (Math.PI / 2)) % colors.length;

            if (distance >= innerRadius - ball.radius && distance <= outerRadius + ball.radius) {
                return {
                    collided: true,
                    sameColor: colors[colorIndex] === ball.color
                };
            }
        }

        return { collided: false, sameColor: false };
    }
}

class ColorSwitcher {
    constructor(y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 15;
        this.rotation = 0;
        this.speed = 0.05;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let i = 0; i < colors.length; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, (i * Math.PI / 2), ((i + 1) * Math.PI / 2));
            ctx.fillStyle = colors[i];
            ctx.fill();
        }

        ctx.restore();
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

class Star {
    constructor(y) {
        this.x = canvas.width / 2;
        this.y = y;
        this.radius = 10;
        this.collected = false;
    }

    draw() {
        if (!this.collected) {
            ctx.beginPath();
            ctx.fillStyle = '#FFD700';
            
            // Draw a 5-pointed star
            for (let i = 0; i < 5; i++) {
                let angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                let x = this.x + Math.cos(angle) * this.radius;
                let y = this.y + Math.sin(angle) * this.radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.fill();
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

// Game objects
let ball = new Ball();
let obstacles = [new Obstacle(canvas.height / 2)];
let colorSwitchers = [new ColorSwitcher(canvas.height / 2 - 200)];
let stars = [new Star(canvas.height / 2)];
let gameActive = true;

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update camera position to only move upward
    if (ball.y < canvas.height / 2) {
        let targetCameraY = -(ball.y - canvas.height / 2);
        // Only update if we're going higher than before
        if (targetCameraY > maxCameraY) {
            maxCameraY = targetCameraY;
        }
        // Smooth transition to max camera position
        cameraY += (maxCameraY - cameraY) * 0.1;
    }

    ctx.save();
    ctx.translate(0, cameraY);

    // Update and draw game objects
    ball.update();

    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        let collision = obstacle.checkCollision(ball);
        
        if (collision.collided) {
            if (!collision.sameColor) {
                gameActive = false;
                gameOver();
                return;
            }
        }

        // Add score when passing obstacle
        if (!obstacle.passed && ball.y < obstacle.y - obstacle.radius) {
            score++;
            scoreElement.textContent = score;
            obstacle.passed = true;
        }
    });

    colorSwitchers.forEach((switcher, index) => {
        switcher.update();
        if (switcher.checkCollision(ball)) {
            ball.switchColor();
            colorSwitchers.splice(index, 1);
        }
    });

    stars.forEach((star, index) => {
        star.update();
        if (star.checkCollision(ball)) {
            score += 5;
            scoreElement.textContent = score;
            stars.splice(index, 1);
        }
    });

    // Generate new obstacles and power-ups
    let lastObstacle = obstacles[obstacles.length - 1];
    if (lastObstacle && lastObstacle.y > ball.y + 100) {
        let newY = lastObstacle.y - 500;
        
        if (newY > ball.y - canvas.height) {
            obstacles.push(new Obstacle(newY));
            colorSwitchers.push(new ColorSwitcher(newY - 200));
            stars.push(new Star(newY));
        }
    }

    // Remove off-screen objects
    obstacles = obstacles.filter(o => o.y < ball.y + canvas.height * 1.5);
    colorSwitchers = colorSwitchers.filter(c => c.y < ball.y + canvas.height * 1.5);
    stars = stars.filter(s => s.y < ball.y + canvas.height * 1.5);

    ctx.restore();

    // Increase game speed based on score
    gameSpeed = 2 + Math.floor(score / 10) * 0.5;

    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameActive = false;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
    }
    finalScoreElement.textContent = score;
    finalHighScoreElement.textContent = highScore;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    gameActive = true;
    currentColorIndex = 0;
    score = 0;
    cameraY = 0;
    maxCameraY = 0;
    gameSpeed = 2;
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';

    // Reset game objects with new spacing
    ball = new Ball();
    obstacles = [new Obstacle(canvas.height / 2)];
    colorSwitchers = [new ColorSwitcher(canvas.height / 2 - 200)];
    stars = [new Star(canvas.height / 2)];

    // Add a second set of objects with proper spacing
    obstacles.push(new Obstacle(canvas.height / 2 - 500));
    colorSwitchers.push(new ColorSwitcher(canvas.height / 2 - 700));
    stars.push(new Star(canvas.height / 2 - 500));

    gameLoop();
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        ball.jump();
        event.preventDefault();
    }
});

document.addEventListener('touchstart', (event) => {
    ball.jump();
    event.preventDefault();
});

restartButton.addEventListener('click', restartGame);

// Start the game
gameLoop();
