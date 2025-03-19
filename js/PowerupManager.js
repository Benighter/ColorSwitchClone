class PowerupManager {
    constructor(effects) {
        this.effects = effects;
        
        // Initialize active powerups
        this.activePowerups = {
            shield: false,
            slowmo: 0,
            magnet: 0,
            multicolor: 0,
            shrink: 0
        };
        
        // Time dilation factor (for slow motion)
        this.timeDilation = 1.0;
        
        // Tooltip elements
        this.tooltipElement = document.getElementById('powerupTooltip');
        this.tooltipVisible = false;
        this.tooltipTimer = null;
    }
    
    activatePowerup(type, ball, duration) {
        switch(type) {
            case 'shield':
                this.activePowerups.shield = true;
                ball.activateShield();
                this.effects.createShieldActivationEffect(ball.x, ball.y);
                break;
                
            case 'slowmo':
                this.activePowerups.slowmo = duration;
                this.timeDilation = 0.5; // Half speed
                this.effects.createSlowmoActivationEffect(ball.x, ball.y);
                break;
                
            case 'magnet':
                this.activePowerups.magnet = duration;
                ball.activateMagnet(150);
                this.effects.createMagnetActivationEffect(ball.x, ball.y);
                break;
                
            case 'multicolor':
                this.activePowerups.multicolor = duration;
                ball.activateMulticolor(duration);
                this.effects.createMulticolorActivationEffect(ball.x, ball.y, ball.multicolorColors);
                break;
                
            case 'shrink':
                this.activePowerups.shrink = duration;
                ball.activateShrink();
                this.effects.createShrinkActivationEffect(ball.x, ball.y);
                break;
        }
        
        this.updatePowerupDisplay();
    }
    
    useShield() {
        if (this.activePowerups.shield) {
            this.activePowerups.shield = false;
            this.updatePowerupDisplay();
            return true;
        }
        return false;
    }
    
    update(deltaTime, ball) {
        // Update slowmo timer
        if (this.activePowerups.slowmo > 0) {
            this.activePowerups.slowmo -= deltaTime;
            if (this.activePowerups.slowmo <= 0) {
                this.activePowerups.slowmo = 0;
                this.timeDilation = 1.0; // Reset time dilation
            }
        }
        
        // Update magnet timer
        if (this.activePowerups.magnet > 0) {
            this.activePowerups.magnet -= deltaTime;
            if (this.activePowerups.magnet <= 0) {
                this.activePowerups.magnet = 0;
                ball.deactivateMagnet();
            }
        }
        
        // Update multicolor timer
        if (this.activePowerups.multicolor > 0) {
            this.activePowerups.multicolor -= deltaTime;
            if (this.activePowerups.multicolor <= 0) {
                this.activePowerups.multicolor = 0;
                ball.multicolorMode = false;
            }
        }
        
        // Update shrink timer
        if (this.activePowerups.shrink > 0) {
            this.activePowerups.shrink -= deltaTime;
            if (this.activePowerups.shrink <= 0) {
                this.activePowerups.shrink = 0;
                ball.deactivateShrink();
            }
        }
        
        this.updatePowerupDisplay();
    }
    
    // Apply magnet effect to pull stars and powerups toward the ball
    applyMagnetEffect(ball, stars, powerups) {
        if (this.activePowerups.magnet <= 0) return;
        
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
    
    // Create or update powerup indicator UI
    createPowerupIndicator() {
        let powerupIndicator = document.getElementById('powerupIndicator');
        
        if (!powerupIndicator) {
            powerupIndicator = document.createElement('div');
            powerupIndicator.id = 'powerupIndicator';
            powerupIndicator.className = 'powerup-indicator';
            
            const uiOverlay = document.querySelector('.ui-overlay');
            if (uiOverlay) {
                uiOverlay.appendChild(powerupIndicator);
            }
            
            // Add event listeners for powerup tooltips
            powerupIndicator.addEventListener('mouseenter', (e) => {
                if (e.target.classList.contains('powerup-item')) {
                    this.showTooltip(e.target);
                }
            });
            
            powerupIndicator.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        }
        
        return powerupIndicator;
    }
    
    // Update UI to show active powerups
    updatePowerupDisplay() {
        const powerupIndicator = this.createPowerupIndicator();
        let html = '';
        
        if (this.activePowerups.shield) {
            html += `<div class="powerup-item shield" data-type="shield">🛡️</div>`;
        }
        
        if (this.activePowerups.slowmo > 0) {
            html += `<div class="powerup-item slowmo" data-type="slowmo">⏱️ ${Math.ceil(this.activePowerups.slowmo)}s</div>`;
        }
        
        if (this.activePowerups.magnet > 0) {
            html += `<div class="powerup-item magnet" data-type="magnet">🧲 ${Math.ceil(this.activePowerups.magnet)}s</div>`;
        }
        
        if (this.activePowerups.multicolor > 0) {
            html += `<div class="powerup-item multicolor" data-type="multicolor">🌈 ${Math.ceil(this.activePowerups.multicolor)}s</div>`;
        }
        
        if (this.activePowerups.shrink > 0) {
            html += `<div class="powerup-item shrink" data-type="shrink">📏 ${Math.ceil(this.activePowerups.shrink)}s</div>`;
        }
        
        powerupIndicator.innerHTML = html;
        
        // Add event listeners for the newly created items
        const powerupItems = powerupIndicator.querySelectorAll('.powerup-item');
        powerupItems.forEach(item => {
            item.addEventListener('mouseenter', () => this.showTooltip(item));
            item.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }
    
    // Show tooltip for powerup
    showTooltip(element) {
        if (!this.tooltipElement) return;
        
        const type = element.getAttribute('data-type');
        if (!type) return;
        
        // Clear any existing timeout
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
        }
        
        // Set tooltip content
        const tooltipTitle = this.tooltipElement.querySelector('.tooltip-title');
        const tooltipDescription = this.tooltipElement.querySelector('.tooltip-description');
        const tooltipDuration = this.tooltipElement.querySelector('.tooltip-duration');
        
        let title, description, duration;
        
        switch(type) {
            case 'shield':
                title = 'Shield';
                description = 'Protects from one collision';
                duration = 'One-time use';
                break;
                
            case 'slowmo':
                title = 'Slow Motion';
                description = 'Slows down obstacles';
                duration = `${Math.ceil(this.activePowerups.slowmo)} seconds remaining`;
                break;
                
            case 'magnet':
                title = 'Magnet';
                description = 'Attracts stars & powerups';
                duration = `${Math.ceil(this.activePowerups.magnet)} seconds remaining`;
                break;
                
            case 'multicolor':
                title = 'Rainbow Mode';
                description = 'Pass through any color';
                duration = `${Math.ceil(this.activePowerups.multicolor)} seconds remaining`;
                break;
                
            case 'shrink':
                title = 'Shrink';
                description = 'Smaller size for tight spaces';
                duration = `${Math.ceil(this.activePowerups.shrink)} seconds remaining`;
                break;
        }
        
        tooltipTitle.textContent = title;
        tooltipDescription.textContent = description;
        tooltipDuration.textContent = duration;
        
        // Position tooltip near the powerup icon
        const rect = element.getBoundingClientRect();
        this.tooltipElement.style.left = `${rect.right + 10}px`;
        this.tooltipElement.style.top = `${rect.top}px`;
        
        // Show tooltip
        this.tooltipElement.style.display = 'block';
        this.tooltipTimer = setTimeout(() => {
            this.tooltipElement.classList.add('visible');
        }, 10);
        
        this.tooltipVisible = true;
    }
    
    // Hide tooltip
    hideTooltip() {
        if (!this.tooltipElement || !this.tooltipVisible) return;
        
        this.tooltipElement.classList.remove('visible');
        
        // Clear any existing timeout
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
        }
        
        // Hide with slight delay for smooth transition
        this.tooltipTimer = setTimeout(() => {
            this.tooltipElement.style.display = 'none';
        }, 200);
        
        this.tooltipVisible = false;
    }
    
    // Reset all powerups
    reset() {
        this.activePowerups = {
            shield: false,
            slowmo: 0,
            magnet: 0,
            multicolor: 0,
            shrink: 0
        };
        
        this.timeDilation = 1.0;
        this.updatePowerupDisplay();
    }
}

export default PowerupManager; 