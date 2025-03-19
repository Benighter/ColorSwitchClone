class LevelManager {
    constructor() {
        // Level definitions with increasing difficulty
        this.levels = [
            {
                id: 1,
                name: "Getting Started",
                obstacleSpeed: 0.015,
                starFrequency: 0.7,
                powerupFrequency: 0.2,
                pattern: "standard",
                background: "cosmic",
                requiredScore: 0
            },
            {
                id: 2,
                name: "Picking Up Speed",
                obstacleSpeed: 0.025,
                starFrequency: 0.65,
                powerupFrequency: 0.25,
                pattern: "alternating",
                background: "nebula",
                requiredScore: 10
            },
            {
                id: 3,
                name: "Double Trouble",
                obstacleSpeed: 0.03,
                starFrequency: 0.6,
                powerupFrequency: 0.3,
                pattern: "double",
                background: "vortex",
                requiredScore: 25
            },
            {
                id: 4,
                name: "Rapid Rotation",
                obstacleSpeed: 0.04,
                starFrequency: 0.55,
                powerupFrequency: 0.35,
                pattern: "pulsating",
                background: "aurora",
                requiredScore: 45
            },
            {
                id: 5,
                name: "Mayhem",
                obstacleSpeed: 0.05,
                starFrequency: 0.5,
                powerupFrequency: 0.4,
                pattern: "chaotic",
                background: "black_hole",
                requiredScore: 70
            }
        ];
        
        // Current level
        this.currentLevelIndex = 0;
        this.unlockedLevels = this.loadUnlockedLevels();
    }
    
    loadUnlockedLevels() {
        const saved = localStorage.getItem('unlockedLevels');
        return saved ? JSON.parse(saved) : 1; // Default to first level
    }
    
    saveUnlockedLevels() {
        localStorage.setItem('unlockedLevels', JSON.stringify(this.unlockedLevels));
    }
    
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }
    
    checkLevelProgression(score) {
        // Check if we should advance to the next level
        if (this.currentLevelIndex < this.levels.length - 1) {
            const nextLevel = this.levels[this.currentLevelIndex + 1];
            if (score >= nextLevel.requiredScore) {
                this.currentLevelIndex++;
                // Unlock the level if it's newly reached
                if (this.unlockedLevels < this.currentLevelIndex + 1) {
                    this.unlockedLevels = this.currentLevelIndex + 1;
                    this.saveUnlockedLevels();
                }
                return true; // Level changed
            }
        }
        return false; // No level change
    }
    
    setLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length && levelIndex < this.unlockedLevels) {
            this.currentLevelIndex = levelIndex;
            return true;
        }
        return false;
    }
    
    getAllLevels() {
        return this.levels.map((level, index) => {
            return {
                ...level,
                unlocked: index < this.unlockedLevels
            };
        });
    }
    
    generateObstacle(canvas, ctx, colors, y, Obstacle) {
        const level = this.getCurrentLevel();
        
        // Create obstacle with level-specific properties
        const obstacle = new Obstacle(canvas, ctx, colors, y);
        
        // Apply level-specific modifications
        obstacle.speed = level.obstacleSpeed;
        
        // Apply pattern modifications
        switch(level.pattern) {
            case "alternating":
                // Alternating rotation direction
                if (Math.random() > 0.5) obstacle.speed *= -1;
                break;
                
            case "double":
                // Create nested obstacles
                obstacle.innerRadius = obstacle.radius * 0.6;
                obstacle.innerThickness = obstacle.thickness * 0.8;
                obstacle.drawInnerRing = true;
                break;
                
            case "pulsating":
                // Pulsating obstacles
                obstacle.pulsateSize = true;
                obstacle.pulsateSpeed *= 2;
                break;
                
            case "chaotic":
                // Random speeds and segment movements
                obstacle.chaotic = true;
                obstacle.speed *= (Math.random() * 0.5 + 0.75); // 75% to 125% of base speed
                // Enhanced segment movement
                obstacle.segments.forEach(segment => {
                    segment.amplitude *= 2;
                });
                break;
        }
        
        return obstacle;
    }
    
    // Determine if a powerup should spawn based on level settings
    shouldSpawnPowerup() {
        const level = this.getCurrentLevel();
        return Math.random() < level.powerupFrequency;
    }
    
    // Choose a random powerup type with weighted probabilities
    getRandomPowerupType() {
        const powerups = [
            { type: 'shield', weight: 20 },
            { type: 'slowmo', weight: 20 },
            { type: 'magnet', weight: 15 },
            { type: 'multicolor', weight: 10 },
            { type: 'shrink', weight: 15 }
        ];
        
        // Calculate total weight
        const totalWeight = powerups.reduce((sum, p) => sum + p.weight, 0);
        
        // Random value between 0 and total weight
        let random = Math.random() * totalWeight;
        
        // Find the powerup based on weights
        for (const powerup of powerups) {
            if (random < powerup.weight) {
                return powerup.type;
            }
            random -= powerup.weight;
        }
        
        // Fallback
        return 'shield';
    }
    
    // Determine if a star should spawn based on level settings
    shouldSpawnStar() {
        const level = this.getCurrentLevel();
        return Math.random() < level.starFrequency;
    }
    
    // Get background settings for current level
    getBackgroundSettings() {
        const level = this.getCurrentLevel();
        
        switch(level.background) {
            case "nebula":
                return {
                    colorStops: [
                        { offset: 0, color: '#1a0033' },
                        { offset: 0.3, color: '#330033' },
                        { offset: 0.6, color: '#330033' },
                        { offset: 1, color: '#1a0033' }
                    ],
                    starDensity: 150
                };
            case "vortex":
                return {
                    colorStops: [
                        { offset: 0, color: '#000033' },
                        { offset: 0.3, color: '#003333' },
                        { offset: 0.6, color: '#003333' },
                        { offset: 1, color: '#000033' }
                    ],
                    starDensity: 180
                };
            case "aurora":
                return {
                    colorStops: [
                        { offset: 0, color: '#001a1a' },
                        { offset: 0.3, color: '#001a33' },
                        { offset: 0.6, color: '#001a33' },
                        { offset: 1, color: '#001a1a' }
                    ],
                    starDensity: 200
                };
            case "black_hole":
                return {
                    colorStops: [
                        { offset: 0, color: '#000000' },
                        { offset: 0.3, color: '#0a0a0a' },
                        { offset: 0.6, color: '#0a0a0a' },
                        { offset: 1, color: '#000000' }
                    ],
                    starDensity: 250
                };
            default: // cosmic
                return {
                    colorStops: [
                        { offset: 0, color: '#1a001a' },
                        { offset: 0.3, color: '#000033' },
                        { offset: 0.6, color: '#000033' },
                        { offset: 1, color: '#1a001a' }
                    ],
                    starDensity: 100
                };
        }
    }
}

export default LevelManager; 