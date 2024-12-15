import Ball from './Ball.js';
import Obstacle from './Obstacle.js';
import ColorSwitcher from './ColorSwitcher.js';
import Star from './Star.js';

// Game constants and variables
const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40'];
let currentColorIndex = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let cameraY = 0;
let maxCameraY = 0; 
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

// Display high score on page load
highScoreElement.textContent = highScore;

// Game objects
let ball = new Ball(canvas, ctx, colors, currentColorIndex);
let obstacles = [new Obstacle(canvas, ctx, colors, canvas.height / 2)];
let colorSwitchers = [new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 200)];
let stars = [new Star(canvas, ctx, canvas.height / 2)];
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
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            ball.switchColor(colors, currentColorIndex);
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
            obstacles.push(new Obstacle(canvas, ctx, colors, newY));
            colorSwitchers.push(new ColorSwitcher(canvas, ctx, colors, newY - 200));
            stars.push(new Star(canvas, ctx, newY));
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
        localStorage.setItem('highScore', highScore);
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
    ball = new Ball(canvas, ctx, colors, currentColorIndex);
    obstacles = [new Obstacle(canvas, ctx, colors, canvas.height / 2)];
    colorSwitchers = [new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 200)];
    stars = [new Star(canvas, ctx, canvas.height / 2)];

    // Add a second set of objects with proper spacing
    obstacles.push(new Obstacle(canvas, ctx, colors, canvas.height / 2 - 500));
    colorSwitchers.push(new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 700));
    stars.push(new Star(canvas, ctx, canvas.height / 2 - 500));

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
