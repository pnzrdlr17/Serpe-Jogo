const canvas = document.querySelector('canvas');
const backdrop = document.getElementById('backdrop');
const modal = document.getElementById('modal');
const currScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const trophyElement = document.getElementById('trophy');
const btn = document.querySelector('button');
const pen = canvas.getContext('2d');
const cellHeight = 10;
const cellWidth = 20;
const RIGHT = 'right',
  LEFT = 'left',
  UP = 'up',
  DOWN = 'down';
let gameOver = false;
const boardWidth = 300;
const boardHeight = 150;
let currApples = 0;
let Apple;
const foodImage = new Image();
foodImage.src = 'apple.png';

class Snake {
  constructor(len, clr, dir) {
    this.initLen = len;
    this.color = clr;
    this.direction = dir;
    this.newDir = dir;
    this.create();
  }

  create() {
    this.cells = [];
    for (let i = this.initLen; i > 0; i--) {
      this.cells.push({ x: i, y: 7 });
    }
  }

  draw() {
    pen.clearRect(0, 0, boardWidth, boardHeight); //erasing old screen..
    //drawing food...
    pen.drawImage(
      foodImage,
      Apple.x * cellWidth,
      Apple.y * cellHeight,
      cellWidth - 1,
      cellHeight - 0.5
    );

    //drawing snake...
    pen.fillStyle = this.color;
    for (const cell of this.cells) {
      pen.fillRect(
        cell.x * cellWidth,
        cell.y * cellHeight,
        cellWidth - 0.5,
        cellHeight - 0.5
      );
    }

    //those eyes...
    const X0 = this.cells[0].x;
    const Y0 = this.cells[0].y;
    pen.strokeStyle = 'white';

    pen.beginPath();
    if (this.direction === RIGHT) {
      pen.arc(X0 * cellWidth + 15, Y0 * cellHeight + 2, 2, 0, 2 * Math.PI);
      pen.stroke();
      pen.beginPath();
      pen.arc(X0 * cellWidth + 15, Y0 * cellHeight + 6, 2, 0, 2 * Math.PI);
    } else if (this.direction === LEFT) {
      pen.arc(X0 * cellWidth + 5, Y0 * cellHeight + 2, 2, 0, 2 * Math.PI);
      pen.stroke();
      pen.beginPath();
      pen.arc(X0 * cellWidth + 5, Y0 * cellHeight + 6, 2, 0, 2 * Math.PI);
    } else if (this.direction === UP) {
      pen.arc(X0 * cellWidth + 7, Y0 * cellHeight + 4, 2.2, 0, 2 * Math.PI);
      pen.stroke();
      pen.beginPath();
      pen.arc(X0 * cellWidth + 13, Y0 * cellHeight + 4, 2.2, 0, 2 * Math.PI);
    } else {
      pen.arc(X0 * cellWidth + 7, Y0 * cellHeight + 6, 2.2, 0, 2 * Math.PI);
      pen.stroke();
      pen.beginPath();
      pen.arc(X0 * cellWidth + 13, Y0 * cellHeight + 6, 2.2, 0, 2 * Math.PI);
    }

    pen.stroke();
  }
}

function hitt(snake) {
  const dir = snake.direction;
  const X0 = snake.cells[0].x;
  const Y0 = snake.cells[0].y;
  return (
    (dir === RIGHT &&
      (X0 + 1 > 14 ||
        snake.cells.find((a) => {
          if (a.x === X0 + 1 && a.y === Y0) return true;
        }))) ||
    (dir === LEFT &&
      (X0 - 1 < 0 ||
        snake.cells.find((a) => {
          if (a.x === X0 - 1 && a.y === Y0) return true;
        }))) ||
    (dir === UP &&
      (Y0 - 1 < 0 ||
        snake.cells.find((a) => {
          if (a.x === X0 && a.y === Y0 - 1) return true;
        }))) ||
    (dir === DOWN &&
      (Y0 + 1 > 14 ||
        snake.cells.find((a) => {
          if (a.x === X0 && a.y === Y0 + 1) return true;
        })))
  );
}

function directionUpdater(snake) {
  const x = snake.direction,
    y = snake.newDir;
  if (
    (y === UP && x !== DOWN) ||
    (y === DOWN && x !== UP) ||
    (y === RIGHT && x !== LEFT) ||
    (y === LEFT && x !== RIGHT)
  ) {
    snake.direction = y;
  }
}

function update(snake) {
  if (snake.direction != snake.newDir) directionUpdater(snake);
  if (hitt(snake)) {
    snake.color = 'red';
    snake.draw();
    gameOver = true;
    return;
  }

  const X0 = snake.cells[0].x;
  const Y0 = snake.cells[0].y;
  const dir = snake.direction;
  if (dir === RIGHT) snake.cells.unshift({ x: X0 + 1, y: Y0 });
  else if (dir === LEFT) snake.cells.unshift({ x: X0 - 1, y: Y0 });
  else if (dir === UP) snake.cells.unshift({ x: X0, y: Y0 - 1 });
  else if (dir === DOWN) snake.cells.unshift({ x: X0, y: Y0 + 1 });

  //ate food...
  if (X0 === Apple.x && Y0 === Apple.y) {
    Apple = getRandomFood(snake);
    currApples++;
  } //removing tail cell...
  else snake.cells.pop();
  currScoreElement.innerHTML = `${currApples}`;
}

function getRandomFood(snake) {
  const p = Math.round((Math.random() * (boardWidth - cellWidth)) / cellWidth),
    q = Math.round((Math.random() * (boardHeight - cellHeight)) / cellHeight);

  if (
    //avoiding a food on the snake..
    snake.cells.length > 0 &&
    snake.cells.find((a) => {
      if (a.x === p && a.y === q) return true;
    })
  ) {
    return getRandomFood(snake);
  }

  return { x: p, y: q };
}

function gameLoop(snake) {
  if (gameOver) {
    setTimeout(() => {
      pen.clearRect(0, 0, boardWidth, boardHeight);
    }, 1700); //erasing screen..

    // document.removeEventListener('keydown', keyHandler);

    clearInterval(gameOnLoop);
    clearInterval(moveSnake);
    const hs = localStorage.getItem('snakeGame3917');
    if (!hs || currApples > +hs) {
      localStorage.setItem('snakeGame3917', `${currApples}`);
    }
    playAgainHandler();
    return;
  }
  console.log('running...');
  snake.draw();
}

function keyInput(snake, event) {
  keyPressed = event.key;
  if (gameOver) {
    if (keyPressed === ' ') restart();
    return;
  } else if (keyPressed === 'q' || keyPressed === 'Q') {
    gameOver = true;
  } else if (keyPressed === 'ArrowUp') {
    snake.newDir = UP;
  } else if (keyPressed === 'ArrowDown') {
    snake.newDir = DOWN;
  } else if (keyPressed === 'ArrowLeft') {
    snake.newDir = LEFT;
  } else if (keyPressed === 'ArrowRight') {
    snake.newDir = RIGHT;
  }
}

function init() {
  const sundaViper = new Snake(4, `#012a87`, RIGHT);
  Apple = getRandomFood(sundaViper);
  gameOver = false;
  currApples = 0;
  gameOnLoop = setInterval(gameLoop.bind(this, sundaViper), 20); //global
  moveSnake = setInterval(update.bind(this, sundaViper), 189); //global
  document.addEventListener('keydown', keyInput.bind(this, sundaViper));
  if (+localStorage.getItem('snakeGame3917') > 0) {
    trophyElement.style.visibility = 'visible';
    highScoreElement.style.visibility = 'visible';
    highScoreElement.innerHTML = `${+localStorage.getItem('snakeGame3917')}`;
  }
}

function modalHandler() {
  modal.classList.toggle('visible');
  backdrop.classList.toggle('visible');
}

function restart() {
  modalHandler();
  init();
}

function playAgainHandler() {
  const modalCurrScore = document.getElementById('modal-curr-score');
  const modalHighScore = document.getElementById('modal-high-score');
  modalCurrScore.innerHTML = `<img src="apple.png" alt="" />&emsp;&emsp;&emsp;${currApples}`;
  modalHighScore.innerHTML = `<img src="trophy.png" alt="" />&emsp;&emsp;&emsp;${+localStorage.getItem(
    'snakeGame3917'
  )}`;
  modalHandler();
  btn.addEventListener('click', restart);
}

init();
