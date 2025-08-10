const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set up display
const WIDTH = 500; // Game canvas width
const HEIGHT = 600; // Game canvas height
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Define constants
const FPS = 60; // Frames per second
const GRAVITY = 0.60; // Gravity effect
const JUMP = -11.0; // Jump velocity
const PIPE_WIDTH = 70; // Pipe width
const MIN_PIPE_GAP = 230; // Minimum vertical gap between pipes
const MAX_PIPE_GAP = 300; // Maximum vertical gap between pipes
const MAX_FALL_SPEED = 4.5; // Maximum fall speed
const PIPE_SPAWN_INTERVAL = 100; // Frames between pipe spawns

// Game state
const STATES = {
    START: "START",
    COUNTDOWN: "COUNTDOWN",
    PLAYING: "PLAYING",
    GAME_OVER: "GAME_OVER",
};

let state = STATES.START;

// Bird class
class Bird {
    constructor() {
        this.x = WIDTH * 0.15; // Bird's horizontal position
        this.y = HEIGHT / 2;   // Bird's vertical position
        this.vel = 0;          // Initial vertical velocity
        this.width = 30;       // Bird's width
        this.height = 30;      // Bird's height

        // Load bird image
        this.image = new Image();
        this.image.src = "bird.png";
    }

    update() {
        this.vel += GRAVITY; // Gravity effect
        if (this.vel > MAX_FALL_SPEED) {
            this.vel = MAX_FALL_SPEED; // Limit max falling speed
        }
        this.y += this.vel; // Update vertical position
        if (this.y < 0) {   // Prevent bird from flying above the canvas
            this.y = 0;
            this.vel = 0;
        }
    }

    jump() {
        this.vel = JUMP; // Reset vertical speed when jumping
    }

    draw() {
        // Draw the bird image
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Pipe class
class Pipe {
    constructor() {
        this.x = WIDTH;
        this.gap = Math.floor(Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP + 1)) + MIN_PIPE_GAP;
        this.height = Math.floor(Math.random() * (HEIGHT - this.gap - 100)) + 100;
        this.speed = 2.0; // Pipe movement speed
        this.passed = false; // Track if bird has passed the pipe
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        ctx.fillStyle = "#00FF00"; // Pipe color
        ctx.fillRect(this.x, 0, PIPE_WIDTH, this.height);

        ctx.fillStyle = "#009900"; // Pipe rim color
        ctx.fillRect(this.x - 5, this.height - 15, PIPE_WIDTH + 10, 15);

        const bottomY = this.height + this.gap;
        const bottomHeight = HEIGHT - bottomY;

        ctx.fillStyle = "#00FF00"; // Pipe color
        ctx.fillRect(this.x, bottomY, PIPE_WIDTH, bottomHeight);

        ctx.fillStyle = "#009900"; // Pipe rim color
        ctx.fillRect(this.x - 5, bottomY - 15, PIPE_WIDTH + 10, 15);
    }
}

// Initialize game objects
const bird = new Bird();
const pipes = [];
let score = 0;
let highScore = 0;
let frameCount = 0;

// Utility functions
function resetGame() {
    bird.y = HEIGHT / 2;
    bird.vel = 0;
    pipes.length = 0;
    score = 0;
    frameCount = 0;
    state = STATES.START;
}

// === Start screen ===
function startScreen() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";

    ctx.font = "48px Arial";
    ctx.fillText("FlapCube!", WIDTH / 2, HEIGHT / 3);

    ctx.font = "24px Arial";
    ctx.fillText("Press Enter or Tap to Start", WIDTH / 2, HEIGHT / 2);

    ctx.font = "16px Arial";
    ctx.fillText("Press Up Arrow or Tap to Jump", WIDTH / 2, HEIGHT / 2 + 40);
}

// === Countdown screen ===
function countdownScreen(count) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.font = "48px Arial";
    ctx.fillText(count, WIDTH / 2, HEIGHT / 2);
}

// === Game Over screen ===
function gameOverScreen() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";

    ctx.font = "48px Arial";
    ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 3);

    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2 - 20);
    ctx.fillText(`High Score: ${highScore}`, WIDTH / 2, HEIGHT / 2 + 20);

    ctx.font = "16px Arial";
    ctx.fillText("Press Enter or Tap to Restart", WIDTH / 2, HEIGHT / 2 + 60);
}

// Main game loop
function gameLoop() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (state === STATES.START) {
        startScreen();
    } else if (state === STATES.COUNTDOWN) {
        const countdown = 3 - Math.floor(frameCount / FPS);
        if (countdown <= 0) {
            state = STATES.PLAYING;
        } else {
            countdownScreen(countdown);
        }
    } else if (state === STATES.PLAYING) {
        bird.update();

        if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
            pipes.push(new Pipe());
        }

        pipes.forEach((pipe) => {
            pipe.update();
            pipe.draw();
        });

        bird.draw();

        // Remove pipes that are off-screen
        pipes.forEach((pipe, i) => {
            if (pipe.x + PIPE_WIDTH < 0) pipes.splice(i, 1);
        });

        // Collision detection
        const collision = pipes.some(
            (pipe) =>
                bird.x < pipe.x + PIPE_WIDTH &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipe.gap)
        );

        if (collision || bird.y > HEIGHT || bird.y < 0) {
            state = STATES.GAME_OVER;
        }

        // Update score
        pipes.forEach((pipe) => {
            if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
                pipe.passed = true;
                score++;
                if (score > highScore) {
                    highScore = score;
                }
            }
        });

        // Draw score
        ctx.fillStyle = "#000000";
        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.textAlign = "right";
        ctx.fillText(`High Score: ${highScore}`, WIDTH - 10, 30);
    } else if (state === STATES.GAME_OVER) {
        gameOverScreen();
    }

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", (e) => {
    if (state === STATES.START && e.code === "Enter") {
        state = STATES.COUNTDOWN;
        frameCount = 0;
    } else if (state === STATES.PLAYING && e.code === "ArrowUp") {
        bird.jump();
    } else if (state === STATES.GAME_OVER && e.code === "Enter") {
        resetGame();
    }
});

canvas.addEventListener("pointerdown", () => {
    if (state === STATES.START) {
        state = STATES.COUNTDOWN;
        frameCount = 0;
    } else if (state === STATES.PLAYING) {
        bird.jump();
    } else if (state === STATES.GAME_OVER) {
        resetGame();
    }
});

// Start the game loop
gameLoop();





