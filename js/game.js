import Ball from './Ball.js';
import Obstacle from './Obstacle.js';
import ColorSwitcher from './ColorSwitcher.js';
import Star from './Star.js';
import Background from './Background.js';
import Effects from './Effects.js';
import LevelManager from './LevelManager.js';
import Powerup from './Powerup.js';

// Game states
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

// Game constants and variables
const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40'];
let currentColorIndex = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let cameraY = 0;
let maxCameraY = 0; 
let gameSpeed = 2;
let isCreativeMode = localStorage.getItem('creativeMode') === 'true' || false;
let currentGameState = GAME_STATE.MENU;

// Powerup state tracking
let activePowerups = {
    shield: false,
    slowmo: 0,
    magnet: 0,
    multicolor: 0,
    shrink: 0
};

// Time dilation for slow motion effect
let timeDilation = 1.0;

// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const menuHighScoreElement = document.getElementById('menuHighScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const mainMenu = document.getElementById('mainMenu');
const finalScoreElement = document.getElementById('finalScore');
const finalHighScoreElement = document.getElementById('finalHighScore');
const restartButton = document.getElementById('restartButton');
const playButton = document.getElementById('playButton');
const mainMenuButton = document.getElementById('mainMenuButton');
const creativeToggle = document.getElementById('creativeMode');

// Create level manager
const levelManager = new LevelManager();

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
        if (powerups) powerups.forEach(powerup => powerup.updateCanvasDimensions(canvas));
        if (background) background.updateCanvasDimensions(canvas);
        if (effects) effects.updateCanvasDimensions(canvas);
    }
}

// Call resize once to set initial dimensions
// Delay the initial resize slightly to ensure the DOM is fully loaded
setTimeout(resizeCanvas, 100);

// Display high score on page load
highScoreElement.textContent = highScore;
menuHighScoreElement.textContent = highScore;

// Set initial creative mode toggle state
if (creativeToggle) {
    creativeToggle.checked = isCreativeMode;
    // Update UI to reflect creative mode
    document.body.classList.toggle('creative-mode', isCreativeMode);
    document.querySelector('.game-container').classList.toggle('creative-mode', isCreativeMode);
}

// Game objects
let ball = null;
let obstacles = [];
let colorSwitchers = [];
let stars = [];
let powerups = [];
let background = null;
let effects = null;
let gameActive = false;

// Create or update level indicator UI
function createLevelIndicator() {
    let levelIndicator = document.getElementById('levelIndicator');
    
    if (!levelIndicator) {
        levelIndicator = document.createElement('div');
        levelIndicator.id = 'levelIndicator';
        levelIndicator.className = 'level-indicator';
        
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(levelIndicator);
        }
    }
    
    return levelIndicator;
}

// Create or update powerup indicator UI
function createPowerupIndicator() {
    let powerupIndicator = document.getElementById('powerupIndicator');
    
    if (!powerupIndicator) {
        powerupIndicator = document.createElement('div');
        powerupIndicator.id = 'powerupIndicator';
        powerupIndicator.className = 'powerup-indicator';
        
        const uiOverlay = document.querySelector('.ui-overlay');
        if (uiOverlay) {
            uiOverlay.appendChild(powerupIndicator);
        }
    }
    
    return powerupIndicator;
}

// Update UI to show current level
function updateLevelDisplay() {
    const levelIndicator = createLevelIndicator();
    const currentLevel = levelManager.getCurrentLevel();
    
    if (currentLevel) {
        levelIndicator.innerHTML = `<div class="level-name">Level ${currentLevel.id}: ${currentLevel.name}</div>`;
        
        // Add animation when level changes
        levelIndicator.classList.add('level-changed');
        setTimeout(() => {
            levelIndicator.classList.remove('level-changed');
        }, 1000);
    }
}

// Update UI to show active powerups
function updatePowerupDisplay() {
    const powerupIndicator = createPowerupIndicator();
    let html = '';
    
    if (activePowerups.shield) {
        html += `<div class="powerup-item shield">🛡️</div>`;
    }
    
    if (activePowerups.slowmo > 0) {
        html += `<div class="powerup-item slowmo">⏱️ ${Math.ceil(activePowerups.slowmo)}s</div>`;
    }
    
    if (activePowerups.magnet > 0) {
        html += `<div class="powerup-item magnet">🧲 ${Math.ceil(activePowerups.magnet)}s</div>`;
    }
    
    if (activePowerups.multicolor > 0) {
        html += `<div class="powerup-item multicolor">🌈 ${Math.ceil(activePowerups.multicolor)}s</div>`;
    }
    
    if (activePowerups.shrink > 0) {
        html += `<div class="powerup-item shrink">📏 ${Math.ceil(activePowerups.shrink)}s</div>`;
    }
    
    powerupIndicator.innerHTML = html;
}

// Initialize game objects
function initializeGame() {
    // Reset game variables
    score = 0;
    cameraY = 0;
    maxCameraY = 0;
    gameSpeed = 2;
    scoreElement.textContent = score;
    
    // Reset level manager
    levelManager.currentLevelIndex = 0;
    
    // Reset active powerups
    activePowerups = {
        shield: false,
        slowmo: 0,
        magnet: 0,
        multicolor: 0,
        shrink: 0
    };
    
    // Reset time dilation
    timeDilation = 1.0;
    
    // Create game objects
    ball = new Ball(canvas, ctx, colors, currentColorIndex);
    obstacles = [];
    colorSwitchers = [];
    stars = [];
    powerups = [];
    background = new Background(canvas, ctx);
    effects = new Effects(canvas, ctx);
    
    // Set background theme based on current level
    const currentLevel = levelManager.getCurrentLevel();
    const bgSettings = levelManager.getBackgroundSettings();
    background.setTheme(currentLevel.background, bgSettings.starDensity);
    
    // Create initial obstacles based on current level
    obstacles = [levelManager.generateObstacle(canvas, ctx, colors, canvas.height / 2, Obstacle)];
    colorSwitchers = [new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 200)];
    stars = [new Star(canvas, ctx, canvas.height / 2 - 100)];
    
    // Apply creative mode if enabled
    if (isCreativeMode) {
        ball.toggleCreativeMode(true);
        document.body.classList.add('creative-mode');
        document.querySelector('.game-container').classList.add('creative-mode');
    }
    
    // Add a second set of objects with proper spacing
    obstacles.push(levelManager.generateObstacle(canvas, ctx, colors, canvas.height / 2 - 500, Obstacle));
    colorSwitchers.push(new ColorSwitcher(canvas, ctx, colors, canvas.height / 2 - 700));
    stars.push(new Star(canvas, ctx, canvas.height / 2 - 400));
    
    // Add a powerup
    if (levelManager.shouldSpawnPowerup()) {
        const powerupType = levelManager.getRandomPowerupType();
        powerups.push(new Powerup(canvas, ctx, powerupType, canvas.width / 2, canvas.height / 2 - 300));
    }
    
    // Update level display
    updateLevelDisplay();
    updatePowerupDisplay();
    
    gameActive = true;
}

function gameLoop() {
    if (!gameActive || currentGameState !== GAME_STATE.PLAYING) return;

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

    // Update powerup timers and effects
    updatePowerups();

    // Apply magnet effect
    if (activePowerups.magnet > 0) {
        applyMagnetEffect();
    }

    obstacles.forEach((obstacle, index) => {
        // Apply slow motion to obstacle speed
        const originalSpeed = obstacle.speed;
        obstacle.speed *= timeDilation;
        
        obstacle.update();
        
        // Restore original speed after update
        obstacle.speed = originalSpeed;
        
        let collision = obstacle.checkCollision(ball);
        
        if (collision.collided) {
            if (isCreativeMode) {
                // In creative mode, create explosion effect but don't end game
                effects.createExplosion(ball.x, ball.y, ball.color, 20, 1.5);
                effects.triggerScreenShake(10, 10);
            } 
            else if (!collision.sameColor) {
                // Check for shield powerup
                if (activePowerups.shield) {
                    // Use up shield
                    activePowerups.shield = false;
                    ball.deactivateShield();
                    updatePowerupDisplay();
                    
                    // Create shield break effect
                    effects.createExplosion(ball.x, ball.y, '#3498db', 30, 1.5);
                    effects.triggerScreenShake(7, 7);
                } else {
                    effects.createExplosion(ball.x, ball.y, ball.color, 40, 2);
                    effects.triggerScreenShake(15, 15);
                    gameActive = false;
                    changeGameState(GAME_STATE.GAME_OVER);
                    return;
                }
            }
        }

        // Add score when passing obstacle
        if (!obstacle.passed && ball.y < obstacle.y - obstacle.radius) {
            score++;
            scoreElement.textContent = score;
            obstacle.passed = true;
            
            // Check for level progression
            if (levelManager.checkLevelProgression(score)) {
                // Level up! Update background theme and display
                const currentLevel = levelManager.getCurrentLevel();
                const bgSettings = levelManager.getBackgroundSettings();
                background.setTheme(currentLevel.background, bgSettings.starDensity);
                
                updateLevelDisplay();
                
                // Create level up effect
                effects.createColorfulExplosion(ball.x, ball.y, colors, 50);
                effects.triggerScreenShake(5, 10);
            }
            
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

    // Update and check powerups
    powerups.forEach((powerup, index) => {
        powerup.update();
        if (powerup.checkCollision(ball)) {
            // Apply powerup effect
            powerup.activate(ball, {activePowerups});
            
            // Add powerup collection effect
            effects.createPowerupCollectedEffect(powerup.x, powerup.y, powerup.glowColor);
            
            // Remove collected powerup
            powerups.splice(index, 1);
            
            // Update powerup display
            updatePowerupDisplay();
        }
    });

    // Generate new obstacles and power-ups
    let lastObstacle = obstacles[obstacles.length - 1];
    if (lastObstacle && lastObstacle.y > ball.y + 100) {
        let newY = lastObstacle.y - 500;
        
        if (newY > ball.y - canvas.height) {
            // Generate level-specific obstacle
            obstacles.push(levelManager.generateObstacle(canvas, ctx, colors, newY, Obstacle));
            
            // Add color switcher
            colorSwitchers.push(new ColorSwitcher(canvas, ctx, colors, newY - 200));
            
            // Add star with level-specific probability
            if (levelManager.shouldSpawnStar()) {
                stars.push(new Star(canvas, ctx, newY - 100));
            }
            
            // Add powerup with level-specific probability
            if (levelManager.shouldSpawnPowerup()) {
                const powerupType = levelManager.getRandomPowerupType();
                const offsetX = (Math.random() - 0.5) * 200; // Random horizontal position
                powerups.push(new Powerup(canvas, ctx, powerupType, canvas.width / 2 + offsetX, newY - 300));
            }
        }
    }

    // Remove off-screen objects
    obstacles = obstacles.filter(o => o.y < ball.y + canvas.height * 1.5);
    colorSwitchers = colorSwitchers.filter(c => c.y < ball.y + canvas.height * 1.5);
    stars = stars.filter(s => s.y < ball.y + canvas.height * 1.5);
    powerups = powerups.filter(p => p.y < ball.y + canvas.height * 1.5);

    ctx.restore();
    
    // Update visual effects
    effects.update();

    // Increase game speed based on score
    gameSpeed = 2 + Math.floor(score / 10) * 0.5;

    if (gameActive && currentGameState === GAME_STATE.PLAYING) {
        requestAnimationFrame(gameLoop);
    }
}

// Update powerup timers and effects
function updatePowerups() {
    const deltaTime = 1/60; // Assuming 60fps
    
    // Update slowmo timer
    if (activePowerups.slowmo > 0) {
        activePowerups.slowmo -= deltaTime;
        if (activePowerups.slowmo <= 0) {
            activePowerups.slowmo = 0;
            timeDilation = 1.0; // Reset time dilation
        }
        updatePowerupDisplay();
    }
    
    // Update magnet timer
    if (activePowerups.magnet > 0) {
        activePowerups.magnet -= deltaTime;
        if (activePowerups.magnet <= 0) {
            activePowerups.magnet = 0;
            ball.deactivateMagnet();
        }
        updatePowerupDisplay();
    }
    
    // Update multicolor timer
    if (activePowerups.multicolor > 0) {
        activePowerups.multicolor -= deltaTime;
        if (activePowerups.multicolor <= 0) {
            activePowerups.multicolor = 0;
            ball.multicolorMode = false;
        }
        updatePowerupDisplay();
    }
    
    // Update shrink timer
    if (activePowerups.shrink > 0) {
        activePowerups.shrink -= deltaTime;
        if (activePowerups.shrink <= 0) {
            activePowerups.shrink = 0;
            ball.deactivateShrink();
        }
        updatePowerupDisplay();
    }
}

// Apply magnet effect to pull stars and powerups toward the ball
function applyMagnetEffect() {
    const magnetRange = ball.magnetRadius;
    
    stars.forEach(star => {
        const dx = ball.x - star.x;
        const dy = ball.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < magnetRange) {
            // Calculate pull factor based on distance (stronger pull when closer)
            const pullFactor = 0.1 * (1 - distance / magnetRange);
            
            // Move star toward ball
            star.x += dx * pullFactor;
            star.y += dy * pullFactor;
        }
    });
    
    powerups.forEach(powerup => {
        const dx = ball.x - powerup.x;
        const dy = ball.y - powerup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < magnetRange) {
            // Calculate pull factor based on distance (stronger pull when closer)
            const pullFactor = 0.08 * (1 - distance / magnetRange);
            
            // Move powerup toward ball
            powerup.x += dx * pullFactor;
            powerup.y += dy * pullFactor;
        }
    });
}

function changeGameState(newState) {
    currentGameState = newState;
    
    // Hide all screens first
    mainMenu.classList.add('hidden');
    gameOverScreen.style.display = 'none';
    
    // Show appropriate screen based on state
    switch(newState) {
        case GAME_STATE.MENU:
            mainMenu.classList.remove('hidden');
            // Update menu high score
            menuHighScoreElement.textContent = highScore;
            break;
            
        case GAME_STATE.PLAYING:
            // Hide main menu
            mainMenu.classList.add('hidden');
            // Reset UI
            gameOverScreen.style.display = 'none';
            // Initialize game objects if needed
            if (!gameActive) {
                initializeGame();
            }
            // Start game loop
            gameActive = true;
            requestAnimationFrame(gameLoop);
            break;
            
        case GAME_STATE.GAME_OVER:
            if (score > highScore && !isCreativeMode) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                highScoreElement.textContent = highScore;
                menuHighScoreElement.textContent = highScore;
            }
            finalScoreElement.textContent = score;
            finalHighScoreElement.textContent = highScore;
            gameOverScreen.style.display = 'block';
            gameActive = false;
            break;
    }
}

function toggleCreativeMode(e) {
    isCreativeMode = typeof e === 'boolean' ? e : e.target.checked;
    
    // Update UI to reflect creative mode
    document.body.classList.toggle('creative-mode', isCreativeMode);
    document.querySelector('.game-container').classList.toggle('creative-mode', isCreativeMode);
    
    // Only modify ball and create effects if they exist
    if (ball) {
        ball.toggleCreativeMode(isCreativeMode);
        
        // Create particle effects when toggling creative mode if in gameplay
        if (effects && currentGameState === GAME_STATE.PLAYING) {
            if (isCreativeMode) {
                effects.createColorfulExplosion(ball.x, ball.y, colors, 100);
                effects.triggerScreenShake(10, 10);
            }
        }
    }
    
    // Sync the creative mode toggle in the menu
    if (creativeToggle) {
        creativeToggle.checked = isCreativeMode;
    }
    
    // Save preference to localStorage
    localStorage.setItem('creativeMode', isCreativeMode);
}

// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (currentGameState === GAME_STATE.MENU) {
            changeGameState(GAME_STATE.PLAYING);
        } else if (currentGameState === GAME_STATE.PLAYING) {
            ball.jump();
        } else if (currentGameState === GAME_STATE.GAME_OVER) {
            restartGame();
        }
        event.preventDefault();
    }
    
    // ESC key to return to menu
    if (event.code === 'Escape' && currentGameState === GAME_STATE.PLAYING) {
        changeGameState(GAME_STATE.MENU);
        event.preventDefault();
    }
});

document.addEventListener('touchstart', (event) => {
    if (currentGameState === GAME_STATE.PLAYING) {
        ball.jump();
        event.preventDefault();
    }
});

// Menu button event listeners
playButton.addEventListener('click', () => {
    changeGameState(GAME_STATE.PLAYING);
});

restartButton.addEventListener('click', restartGame);

mainMenuButton.addEventListener('click', () => {
    changeGameState(GAME_STATE.MENU);
});

// Creative mode toggle in settings
creativeToggle.addEventListener('change', function(e) {
    console.log('Change event triggered on checkbox');
    toggleCreativeMode(e);
});

// Improved click handler for the toggle switch
const toggleSwitch = document.querySelector('.toggle-switch');
if (toggleSwitch) {
    toggleSwitch.addEventListener('click', function(e) {
        console.log('Toggle switch clicked');
        e.preventDefault(); // Prevent default click
        e.stopPropagation(); // Stop event from bubbling
        
        // Toggle the checkbox
        if (creativeToggle) {
            creativeToggle.checked = !creativeToggle.checked;
            console.log('Checkbox state toggled to:', creativeToggle.checked);
            
            // Call the toggle function directly
            toggleCreativeMode({ target: { checked: creativeToggle.checked } });
        }
    });
    
    // Also add click handler to the entire setting item for better UX
    const settingItem = document.querySelector('.setting-item');
    if (settingItem) {
        settingItem.addEventListener('click', function(e) {
            console.log('Setting item clicked');
            // Only toggle if the click wasn't on the checkbox itself
            if (e.target !== creativeToggle) {
                // Toggle the checkbox
                if (creativeToggle) {
                    creativeToggle.checked = !creativeToggle.checked;
                    console.log('Checkbox state toggled to:', creativeToggle.checked);
                    
                    // Call the toggle function directly
                    toggleCreativeMode({ target: { checked: creativeToggle.checked } });
                }
            }
        });
    }
}

function restartGame() {
    // Reset game state
    gameActive = false;
    // Initialize new game
    initializeGame();
    // Change state to playing
    changeGameState(GAME_STATE.PLAYING);
}

// Initialize menu first
changeGameState(GAME_STATE.MENU);
