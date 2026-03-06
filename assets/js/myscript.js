class websketch {
    constructor() {
        // Set up canvas and drawing settings
        this.initializeCanvas();
        this.initializeDrawingSettings();
        this.initializeCursor();
        this.initializeElements();
        this.initializeMovementSettings();
        this.initializeContinuousMovement();
        this.init();
    }
    
    // Set up canvas and initial position
    initializeCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
    }
    
    // Set drawing styles for lines
    initializeDrawingSettings() {
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#4a5568';
        this.ctx.shadowBlur = 1;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    // Set up cursor appearance (invisible dot)
    initializeCursor() {
        this.cursorRadius = 1;
        this.cursorColor = '#d1d1d1'; // match canvas background
    }
    
    // Get references to knobs and shake button
    initializeElements() {
        this.leftKnob = document.getElementById('left-knob');
        this.rightKnob = document.getElementById('right-knob');
        this.shakeButton = document.getElementById('shake-button');
    }
    
    // Set up movement step and key states
    initializeMovementSettings() {
        this.step = 3;
        this.pressedKeys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }
    
    // Set up timers and flags for continuous movement
    initializeContinuousMovement() {
        this.keyTimers = {
            left: null,
            right: null,
            up: null,
            down: null
        };
        this.continuousMovement = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.isMovingContinuously = false;
        this.animationFrame = null;
        this.holdDelay = 1000;
    }
    
    // Initialize controls and start animation loop
    init() {
        this.setupControls();
        this.startContinuousMovementLoop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCursor();
    }
    
    // Draw the cursor (invisible dot)
    drawCursor() {
        this.ctx.save();
        this.ctx.fillStyle = this.cursorColor;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.cursorRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // Animation loop for continuous movement
    startContinuousMovementLoop() {
        const loop = () => {
            if (this.isMovingContinuously) {
                this.handleContinuousMovement();
            }
            this.animationFrame = requestAnimationFrame(loop);
        };
        loop();
    }
    
    // Start timer for continuous movement in a direction
    startKeyTimer(direction) {
        if (this.keyTimers[direction]) {
            clearTimeout(this.keyTimers[direction]);
        }
        this.keyTimers[direction] = setTimeout(() => {
            this.continuousMovement[direction] = true;
            this.updateContinuousMovementState();
        }, this.holdDelay);
    }
    
    // Stop timer and continuous movement for a direction
    stopKeyTimer(direction) {
        if (this.keyTimers[direction]) {
            clearTimeout(this.keyTimers[direction]);
            this.keyTimers[direction] = null;
        }
        this.continuousMovement[direction] = false;
        this.updateContinuousMovementState();
    }
    
    // Update flag for whether any continuous movement is active
    updateContinuousMovementState() {
        this.isMovingContinuously = Object.values(this.continuousMovement).some(moving => moving);
    }
    
    // Move cursor continuously if needed
    handleContinuousMovement() {
        const continuousStep = this.step / 4;
        let deltaX = 0;
        let deltaY = 0;
        if (this.continuousMovement.left) deltaX -= continuousStep;
        if (this.continuousMovement.right) deltaX += continuousStep;
        if (this.continuousMovement.up) deltaY -= continuousStep;
        if (this.continuousMovement.down) deltaY += continuousStep;
        // Normalize diagonal speed
        if (deltaX !== 0 && deltaY !== 0) {
            deltaX *= 0.707;
            deltaY *= 0.707;
        }
        if (deltaX !== 0 || deltaY !== 0) {
            this.drawLine(this.x + deltaX, this.y + deltaY);
        }
    }
    
    // Set up knob, keyboard, and shake controls
    setupControls() {
        this.setupKnobControls();
        this.setupKeyboardControls();
        this.setupShakeButton();
    }
    
    // Mouse controls for knobs
    setupKnobControls() {
        // Left knob controls horizontal movement
        this.leftKnob.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.leftKnob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            if (e.clientX < centerX) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        });
        // Right knob controls vertical movement
        this.rightKnob.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const rect = this.rightKnob.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            if (e.clientY < centerY) {
                this.moveUp();
            } else {
                this.moveDown();
            }
        });
        // Touch controls for knobs
        this.setupTouchControls();
    }
    
    // Touch controls for knobs
    setupTouchControls() {
        this.leftKnob.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.leftKnob.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const touchX = e.touches[0].clientX;
            if (touchX < centerX) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        });
        this.rightKnob.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.rightKnob.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const touchY = e.touches[0].clientY;
            if (touchY < centerY) {
                this.moveUp();
            } else {
                this.moveDown();
            }
        });
    }
    
    // Keyboard controls for movement and shake
    setupKeyboardControls() {
        const keyMap = {
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right',
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down'
        };
        document.addEventListener('keydown', (e) => {
            const direction = keyMap[e.key];
            // Move if direction key pressed
            if (direction && !this.pressedKeys[direction]) {
                this.pressedKeys[direction] = true;
                this.handleMovement();
                this.startKeyTimer(direction);
                e.preventDefault();
                return;
            }
            // Shake if space or enter pressed
            if (e.key === ' ' || e.key === 'Enter') {
                this.shake();
                e.preventDefault();
            }
        });
        document.addEventListener('keyup', (e) => {
            const direction = keyMap[e.key];
            if (direction) {
                this.pressedKeys[direction] = false;
                this.stopKeyTimer(direction);
            }
        });
    }
    
    // Set up shake button click/touch
    setupShakeButton() {
        const shakeHandler = (e) => {
            e.preventDefault();
            this.shake();
        };
        this.shakeButton.addEventListener('click', shakeHandler);
        this.shakeButton.addEventListener('touchstart', shakeHandler);
    }
    
    // Handle movement for pressed keys
    handleMovement() {
        let deltaX = 0;
        let deltaY = 0;
        if (this.pressedKeys.left) deltaX -= this.step;
        if (this.pressedKeys.right) deltaX += this.step;
        if (this.pressedKeys.up) deltaY -= this.step;
        if (this.pressedKeys.down) deltaY += this.step;
        // Normalize diagonal speed
        if (deltaX !== 0 && deltaY !== 0) {
            deltaX *= 0.707;
            deltaY *= 0.707;
        }
        if (deltaX !== 0 || deltaY !== 0) {
            this.drawLine(this.x + deltaX, this.y + deltaY);
        }
    }
    
    // Draw a line from current position to new position
    drawLine(newX, newY) {
        // Clamp to canvas bounds
        newX = Math.max(0, Math.min(this.canvas.width, newX));
        newY = Math.max(0, Math.min(this.canvas.height, newY));
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(newX, newY);
        this.ctx.stroke();
        this.x = newX;
        this.y = newY;
        this.drawCursor(); // Draw cursor at new position
    }
    
    // Move left by step
    moveLeft() {
        const newX = Math.max(0, this.x - this.step);
        this.drawLine(newX, this.y);
    }
    
    // Move right by step
    moveRight() {
        const newX = Math.min(this.canvas.width, this.x + this.step);
        this.drawLine(newX, this.y);
    }
    
    // Move up by step
    moveUp() {
        const newY = Math.max(0, this.y - this.step);
        this.drawLine(this.x, newY);
    }
    
    // Move down by step
    moveDown() {
        const newY = Math.min(this.canvas.height, this.y + this.step);
        this.drawLine(this.x, newY);
    }
    
    // Clear the canvas and redraw cursor
    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCursor();
    }
    
    // Shake animation and clear screen
    shake() {
        const websketch = document.querySelector('.websketch');
        websketch.classList.add('shaking');
        // Fade out canvas with overlay
        let fadeOpacity = 0;
        const fadeInterval = setInterval(() => {
            fadeOpacity += 0.05;
            this.ctx.save();
            this.ctx.globalAlpha = Math.min(1, fadeOpacity);
            this.ctx.fillStyle = '#d1d1d1';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }, 25);
        setTimeout(() => {
            clearInterval(fadeInterval);
            websketch.classList.remove('shaking');
            this.clearScreen();
        }, 500);
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new websketch();
});