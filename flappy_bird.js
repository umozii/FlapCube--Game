// 定義 Canvas 和上下文
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = 400;
const HEIGHT = 600;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// 定義顏色
const WHITE = "#FFFFFF";
const GREEN = "#00FF00";
const BLACK = "#000000";

// 定義常數
const GRAVITY = 0.65;
const JUMP = -12;
const PIPE_WIDTH = 70;
const MIN_PIPE_GAP = 200;
const MAX_PIPE_GAP = 250;
const MAX_FALL_SPEED = 4.5;
const PIPE_SPAWN_INTERVAL_MIN = 200;
const PIPE_SPAWN_INTERVAL_MAX = 300;
const FPS = 60;

// 定義遊戲狀態
const START = "START";
const COUNTDOWN = "COUNTDOWN";
const PLAYING = "PLAYING";
const GAME_OVER_STATE = "GAME_OVER";

let bird, pipes, score, highScore, state;

class Bird {
  constructor() {
    this.x = 100;
    this.y = HEIGHT / 2;
    this.vel = 0;
    this.width = 30;
    this.height = 30;
  }

  update() {
    this.vel += GRAVITY;
    if (this.vel > MAX_FALL_SPEED) this.vel = MAX_FALL_SPEED;
    this.y += this.vel;
    if (this.y < 0) {
      this.y = 0;
      this.vel = 0;
    }
  }

  jumpAction() {
    this.vel = JUMP;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Pipe {
  constructor() {
    this.x = WIDTH;
    this.gap = Math.random() * (MAX_PIPE_GAP - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    this.height = Math.random() * (HEIGHT - this.gap - 200) + 100;
    this.top = { x: this.x, y: 0, width: PIPE_WIDTH, height: this.height };
    this.bottom = { x: this.x, y: this.height + this.gap, width: PIPE_WIDTH, height: HEIGHT - this.height - this.gap };
    this.speed = 5;
  }

  update() {
    this.x -= this.speed;
    this.top.x = this.x;
    this.bottom.x = this.x;
  }

  draw() {
    ctx.fillStyle = GREEN;
    ctx.fillRect(this.top.x, this.top.y, this.top.width, this.top.height);
    ctx.fillRect(this.bottom.x, this.bottom.y, this.bottom.width, this.bottom.height);
  }
}

function startScreen() {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = BLACK;
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Flappy Bird", WIDTH / 2, HEIGHT / 3);
  ctx.fillText("Press Enter to Start", WIDTH / 2, HEIGHT / 2);
}

function countdownScreen() {
  let count = 3;
  const interval = setInterval(() => {
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = BLACK;
    ctx.font = "72px Arial";
    ctx.textAlign = "center";
    ctx.fillText(count, WIDTH / 2, HEIGHT / 2);

    count--;
    if (count < 0) {
      clearInterval(interval);
      state = PLAYING;
    }
  }, 1000);
}

function gameOverScreen() {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = BLACK;
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 3);
  ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2);
  ctx.fillText(`High Score: ${highScore}`, WIDTH / 2, HEIGHT / 2 + 40);
  ctx.fillText("Press Enter to Restart", WIDTH / 2, HEIGHT / 2 + 100);
}

function resetGame() {
  bird = new Bird();
  pipes = [new Pipe()];
  score = 0;
  state = START;
}

function main() {
  bird = new Bird();
  pipes = [new Pipe()];
  score = 0;
  highScore = 0;
  state = START;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && state === START) {
      state = COUNTDOWN;
      countdownScreen();
    } else if (e.key === "Enter" && state === GAME_OVER_STATE) {
      resetGame();
    } else if (e.key === "ArrowUp" && state === PLAYING) {
      bird.jumpAction();
    }
  });

  function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (state === START) {
      startScreen();
    } else if (state === PLAYING) {
      bird.update();

      if (pipes[pipes.length - 1].x < WIDTH - Math.random() * (PIPE_SPAWN_INTERVAL_MAX - PIPE_SPAWN_INTERVAL_MIN) + PIPE_SPAWN_INTERVAL_MIN) {
        pipes.push(new Pipe());
      }

      for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].update();
        pipes[i].draw();
        if (pipes[i].x + PIPE_WIDTH < 0) {
          pipes.splice(i, 1);
          score++;
          if (score > highScore) highScore = score;
        }
      }

      bird.draw();

      ctx.fillStyle = BLACK;
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`High Score: ${highScore}`, WIDTH - 150, 30);

      for (const pipe of pipes) {
        if (
          (bird.x < pipe.top.x + pipe.top.width &&
            bird.x + bird.width > pipe.top.x &&
            (bird.y < pipe.top.height || bird.y + bird.height > pipe.bottom.y)) ||
          bird.y > HEIGHT
        ) {
          state = GAME_OVER_STATE;
        }
      }
    } else if (state === GAME_OVER_STATE) {
      gameOverScreen();
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

main();
