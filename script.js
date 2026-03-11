const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const COLS = 10;
const ROWS = 15;
const CELL = canvas.width / COLS;

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#b892ff", "#ff9f1c", "#00d1b2"];

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
];

let board;
let piece;
let score;
let last = 0;
let dropCounter = 0;
let gameOver = false;

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const index = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[index].map((row) => [...row]),
    color: COLORS[index],
    x: Math.floor(COLS / 2) - 1,
    y: 0,
  };
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
}

function drawBoard() {
  ctx.fillStyle = "#0b0f17";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => row.forEach((cell, x) => cell && drawCell(x, y, cell)));

  piece.shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) drawCell(piece.x + x, piece.y + y, piece.color);
    });
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 6);
    ctx.font = "14px Arial";
    ctx.fillText("Press Restart", canvas.width / 2, canvas.height / 2 + 20);
  }
}

function collide(testPiece = piece) {
  return testPiece.shape.some((row, y) => row.some((value, x) => {
    if (!value) return false;
    const newY = testPiece.y + y;
    const newX = testPiece.x + x;
    return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
  }));
}

function merge() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) board[piece.y + y][piece.x + x] = piece.color;
    });
  });
}

function clearLines() {
  let lines = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every(Boolean)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      lines += 1;
      y += 1;
    }
  }
  if (lines > 0) {
    score += lines * 100;
    scoreEl.textContent = String(score);
  }
}

function rotate() {
  const rotated = piece.shape[0].map((_, i) => piece.shape.map((row) => row[i]).reverse());
  const prev = piece.shape;
  piece.shape = rotated;
  if (collide()) piece.shape = prev;
}

function spawn() {
  piece = randomPiece();
  if (collide()) gameOver = true;
}

function drop() {
  piece.y += 1;
  if (collide()) {
    piece.y -= 1;
    merge();
    clearLines();
    spawn();
  }
  dropCounter = 0;
}

function update(time = 0) {
  const delta = time - last;
  last = time;
  if (!gameOver) {
    dropCounter += delta;
    if (dropCounter > 550) drop();
    drawBoard();
    requestAnimationFrame(update);
  } else {
    drawBoard();
  }
}

function resetGame() {
  board = emptyBoard();
  score = 0;
  scoreEl.textContent = "0";
  gameOver = false;
  dropCounter = 0;
  spawn();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "ArrowLeft") {
    piece.x -= 1;
    if (collide()) piece.x += 1;
  } else if (e.key === "ArrowRight") {
    piece.x += 1;
    if (collide()) piece.x -= 1;
  } else if (e.key === "ArrowDown") {
    drop();
  } else if (e.key === "ArrowUp" || e.key === " ") {
    rotate();
  }
});

restartBtn.addEventListener("click", resetGame);
resetGame();
