import Ball from './Ball.js';
import Obstacle from './Obstacle.js';
import ColorSwitcher from './ColorSwitcher.js';
import Star from './Star.js';
import Background from './Background.js';
import Effects from './Effects.js';

// Game constants and variables
const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40'];
let currentColorIndex = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let cameraY = 0;
let maxCameraY = 0; 
let gameSpeed = 2;
let isCreativeMode = false;

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

// Add resize event listener
window.addEventListener('resize', resizeCanvas);

// Function to resize canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Make sure we have valid dimensions
    if (containerWidth > 0 && containerHeight > 0) {
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Update objects that depend on canvas dimensions
        if (ball) ball.updateCanvasDimensions(canvas);
        if (obstacles) obstacles.forEach(obstacle => obstacle.updateCanvasDimensions(canvas));
        if (colorSwitchers) colorSwitchers.forEach(switcher => switcher.updateCanvasDimensions(canvas));
        if (stars) stars.forEach(star => star.updateCanvasDimensions(canvas));
        if (background) background.updateCanvasDimensions(canvas);
        if (effects) effects.updateCanvasDimensions(canvas);
    }
}

// Call resize once to set initial dimensions
// Delay the initial resize slightly to ensure the DOM is fully loaded
setTimeout(resizeCanvas, 100);

// Display high score on page load
highScoreElement.textContent = highScore;

// Create UI elements for creative mode
createUI();

// Game objects
let ball = new Ball(canvas, ctx, colors, currentColorIndex);
let obstacles = [new Obstacle(canvas, ctx, colors, canvas.height / 2)];
let colorSwitchers = [new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 200)];
let stars = [new Star(canvas, ctx, canvas.height / 2)];
let background = new Background(canvas, ctx);
let effects = new Effects(canvas, ctx);
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

    // Draw background first
    background.update(cameraY);

    ctx.save();
    
    // Apply screen shake effect
    effects.applyScreenShake(ctx);
    
    // Apply camera transformation
    ctx.translate(0, cameraY);

    // Update and draw game objects
    ball.update();

    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        let collision = obstacle.checkCollision(ball);
        
        if (collision.collided) {
            if (isCreativeMode) {
                // In creative mode, create explosion effect but don't end game
                effects.createExplosion(ball.x, ball.y, ball.color, 20, 1.5);
                effects.triggerScreenShake(10, 10);
            } 
            else if (!collision.sameColor) {
                effects.createExplosion(ball.x, ball.y, ball.color, 40, 2);
                effects.triggerScreenShake(15, 15);
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
            
            // Add particle effect when earning points
            effects.createExplosion(ball.x, ball.y, '#FFFFFF', 10, 0.5);
        }
    });

    colorSwitchers.forEach((switcher, index) => {
        switcher.update();
        if (switcher.checkCollision(ball)) {
            currentColorIndex = (currentColorIndex + 1) % colors.length;
            ball.switchColor(colors, currentColorIndex);
            colorSwitchers.splice(index, 1);
            
            // Add color switch effect
            effects.createColorSwitchEffect(switcher.x, switcher.y, colors);
        }
    });

    stars.forEach((star, index) => {
        star.update();
        if (star.checkCollision(ball)) {
            score += 5;
            scoreElement.textContent = score;
            stars.splice(index, 1);
            
            // Add star collection effect
            effects.createStarCollectedEffect(star.x, star.y);
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
    
    // Update visual effects
    effects.update();

    // Increase game speed based on score
    gameSpeed = 2 + Math.floor(score / 10) * 0.5;

    if (gameActive) {
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameActive = false;
    if (score > highScore && !isCreativeMode) {
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
    ball.toggleCreativeMode(isCreativeMode);
    obstacles = [new Obstacle(canvas, ctx, colors, canvas.height / 2)];
    colorSwitchers = [new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 200)];
    stars = [new Star(canvas, ctx, canvas.height / 2)];

    // Add a second set of objects with proper spacing
    obstacles.push(new Obstacle(canvas, ctx, colors, canvas.height / 2 - 500));
    colorSwitchers.push(new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 700));
    stars.push(new Star(canvas, ctx, canvas.height / 2 - 500));

    gameLoop();
}

function toggleCreativeMode(e) {
    isCreativeMode = e.target.checked;
    ball.toggleCreativeMode(isCreativeMode);
    
    // Update UI to reflect creative mode
    document.body.classList.toggle('creative-mode', isCreativeMode);
    
    // Create particle effects when toggling creative mode
    if (isCreativeMode) {
        effects.createColorfulExplosion(ball.x, ball.y, colors, 100);
        effects.triggerScreenShake(10, 10);
        document.querySelector('.game-container').classList.add('creative-mode');
    } else {
        document.querySelector('.game-container').classList.remove('creative-mode');
    }
}

function createUI() {
    // Create Creative Mode toggle
    const uiControls = document.createElement('div');
    uiControls.className = 'ui-controls';
    
    const modeToggleContainer = document.createElement('div');
    modeToggleContainer.className = 'mode-toggle';
    
    const modeToggleCheckbox = document.createElement('input');
    modeToggleCheckbox.type = 'checkbox';
    modeToggleCheckbox.id = 'creativeMode';
    modeToggleCheckbox.addEventListener('change', toggleCreativeMode);
    
    const modeToggleLabel = document.createElement('label');
    modeToggleLabel.htmlFor = 'creativeMode';
    modeToggleLabel.textContent = 'Creative Mode';
    
    modeToggleContainer.appendChild(modeToggleCheckbox);
    modeToggleContainer.appendChild(modeToggleLabel);
    uiControls.appendChild(modeToggleContainer);
    
    // Add the controls to the UI overlay
    document.querySelector('.ui-overlay').appendChild(uiControls);
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
