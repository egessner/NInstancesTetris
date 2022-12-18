/* eslint linebreak-style: ['error', 'windows'] */
/* GLOBALS */
const STARTING_X = 7;
const STARTING_Y = 2;
const FPS = 30;
const INTERVAL = 1000 / FPS;
const OFFSET = 40;
const SIDEOFFSET = 40;
const BUFFERSPACE = 4;
const DFALLSPEED = .5;

let mainCanvas;
let context;
let sideCanvas;
let sideContext;
let button;
let now;
let then;
let delta;
let framecount;
let grid;
let sideGrid;
let curShape;
let nextShape;
let shapeBag;
let requestID;
let gameOver;
let compFallSpeed;
let score;
let scoreLabel;

/**
 * @description init canvases/contexts, init globals, create starting shapes,
 *  draw grids, define and init event listeners
 */
function initSetup() {
  mainCanvas = document.getElementById('mainCanvas');
  sideCanvas = document.getElementById('sideCanvas');
  scoreLabel = document.getElementById('scoreLabel');
  button = document.getElementById('restartButton');
  context = mainCanvas.getContext('2d');
  sideContext = sideCanvas.getContext('2d');

  then = Date.now();
  framecount = 0;
  gameOver = 0;
  compFallSpeed = 0;
  score = 0;
  updateScore();

  createGrids(15, 20 + BUFFERSPACE);
  // printGrid();
  // drawGrid();

  shapeBag = [0, 1, 2, 3, 4, 5, 6];
  curShape = new Shape(STARTING_X, STARTING_Y, shapeBag);
  shapeBag.splice(shapeBag.indexOf(curShape.index), 1);
  nextShape = new Shape(STARTING_X, STARTING_Y, shapeBag);
  shapeBag.splice(shapeBag.indexOf(nextShape.index), 1);

  updateSideGrid();
  drawSideGrid();
  document.addEventListener('keypress', onKeyPress);
  document.addEventListener('keydown', onKeyDown);
  button.addEventListener('click', main);
}

/**
 * @description creates a height * width 2d array main grid and 4*4 sidegrid
 * @param {int} width
 * @param {int} height
 */
function createGrids(width, height) {
  grid = [];
  for (let h = 0; h < height; h++) {
    grid.push(new Array(width).fill(0));
  }

  sideGrid = [];
  for (let h = 0; h < 4; h++) {
    sideGrid.push(new Array(4).fill(0));
  }
}

// /**
//  * @description print the grid to console - debugging
//  */
// function printGrid() {
//   for (let i = 0; i < grid.length; i++) {
//     console.log(i + '\t' + grid[i].toString() + '\n');
//   }
// }

// /**
//  * @description draw grid on canvas - debugging
//  */
// function drawGrid() {
//   for (let y = 0; y < grid.length; y++) {
//     for (let x = 0; x < grid[y].length; x++) {
//       if (grid[y][x] == 0) {
//         context.strokeRect(x * OFFSET, y * OFFSET - (OFFSET * BUFFERSPACE),
//             OFFSET, OFFSET);
//       }
//     }
//   }
// }

/**
 * @description draw outline of main canvas
 */
function drawOutline() {
  context.strokeRect(0, 0, mainCanvas.width, mainCanvas.height);
}

/**
 * @description draws all shapes on canvas at grid positions
 */
function drawShapes() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] != 0) {
        context.fillStyle = grid[y][x].color;
        context.fillRect(x * OFFSET, y * OFFSET - (OFFSET * BUFFERSPACE),
            OFFSET, OFFSET);
        context.strokeRect(x * OFFSET, y * OFFSET - (OFFSET * BUFFERSPACE),
            OFFSET, OFFSET);
      } else {
        context.fillStyle = '#000000';
        context.fillRect(x * OFFSET, y * OFFSET - (OFFSET * BUFFERSPACE),
            OFFSET, OFFSET);
      }
    }
  }
}

/**
 * @description draws side grid displaying next shape
 */
function drawSideGrid() {
  for (let y = 0; y < sideGrid.length; y++) {
    for (let x = 0; x < sideGrid[y].length; x++) {
      if (sideGrid[y][x] != 0) {
        sideContext.fillStyle = sideGrid[y][x].color;
        sideContext.fillRect(x * SIDEOFFSET, y * SIDEOFFSET,
            SIDEOFFSET, SIDEOFFSET);
        sideContext.strokeRect(x * SIDEOFFSET, y * SIDEOFFSET,
            SIDEOFFSET, SIDEOFFSET);
      } else {
        sideContext.fillStyle = '#ffffff';
        sideContext.fillRect(x * SIDEOFFSET, y * SIDEOFFSET,
            SIDEOFFSET, SIDEOFFSET);
      }
    }
  }
}

/**
 * @description Try to drop curShape 1
 * @return {undefined}
 */
function fall() {
  let newpositions = [];
  newpositions = curShape.fall();

  if (borderDetection(newpositions) == 1) {
    pickNextShape();
    return;
  }

  if (collisionDetection(newpositions) == 1) {
    pickNextShape();
    return; // curShape can no longer drop - select next shape
  }

  // newpositions are valid, set to curShape
  curShape.position = newpositions;
  updateGrid();
}

/**
 * @description do later
 */
function drop() {
  let newpositions = curShape.fall();
  let blocksFallen = 1;
  while (borderDetection(newpositions) != 1 &&
   collisionDetection(newpositions) != 1) {
    curShape.position = newpositions;
    updateGrid();
    newpositions = curShape.fall();
    blocksFallen++;
  }
  curShape.position = newpositions;
  score+= blocksFallen++;
  pickNextShape();
}

/**
 * @description Try to move curShape left or right one
 * @param {*} keyCode
 * @return {undefined}
 */
function move(keyCode) {
  let newpositions = [];
  if (keyCode == 'KeyA') {
    newpositions = curShape.move(-1); // move left
  } else if (keyCode == 'KeyD') {
    newpositions = curShape.move(1); // move right
  }

  if (collisionDetection(newpositions) == 1) {
    return; // do nothing
  }

  const borderHit = borderDetection(newpositions);
  if (borderHit == 0) { // no hit
    curShape.position = newpositions;
    updateGrid();
  }
}

/**
 * @description Try to rotate curShape
 */
function rotate() {
  const newpositions = curShape.rotate();
  if (borderDetection(newpositions) == 0 &&
        collisionDetection(newpositions) == 0) { // no hit
    curShape.position = newpositions;
    updateGrid();
  }
}

/**
 * @description updateGrid with new positions, remove old ones
 */
function updateGrid() {
  const lastPosition = curShape.lastPosition;
  lastPosition.forEach((square) => { // clear old positions
    grid[square[1]][square[0]] = 0;
  });

  const position = curShape.position;
  position.forEach((square) => { // set new positions
    grid[square[1]][square[0]] = curShape;
  });
}

/**
 * @description UpdateSideGrid with nextShape
 */
function updateSideGrid() {
  sideGrid.forEach((row) => row.fill(0)); // clear grid

  nextShape.position.forEach((pos) => { // set grid with nextShape
    sideGrid[pos[1] - (STARTING_Y - 1)][pos[0] - (STARTING_X - 1)] = nextShape;
  });
}

/**
 * @description Check for border collisons
 * @param {*} position
 * @return {int} 1: bottom hit 2: side hit; 0: no hit
 */
function borderDetection(position) {
  // find lowest square
  let lowY = 0;
  let leftX = 0;
  let rightX = grid[0].length;

  position.forEach(([x, y]) => { // we only need to check the outer coords
    lowY = Math.max(lowY, y);
    leftX = Math.max(leftX, x);
    rightX = Math.min(rightX, x);
  });

  if (lowY == grid.length) { // bottom hit
    return 1;
  }
  if (leftX == grid[0].length) { // side hit
    return 2;
  }
  if (rightX == -1) { // side hit
    return 2;
  }

  return 0; // no hit
}

/**
 * @description Check for shape collisions
 * @param {*} position
 * @return {int} 1: collision with another shape 0: no collision
 */
function collisionDetection(position) {
  for (let i = 0; i < position.length; i++) {
    if (grid[position[i][1]][position[i][0]] != 0 &&
        grid[position[i][1]][position[i][0]] != curShape) {
      return 1;
    }
  }
  return 0;
}

/**
 * @description Check for gameOver - update global gameOver if true
 */
function checkGameOver() {
  curShape.position.forEach(([x, y]) => {
    if (y <= BUFFERSPACE) {
      gameOver = 1;
    }
  });
}

/**
 * @description Dsiplay Game over using the HTML elements
 */
function displayGameOver() {
  scoreLabel.innerHTML = 'GAME OVER   Final Score: ' + score;
}

/**
 * @descriptionv Check for a row full of shapes - clear if true
 * @source https://tetris.wiki/Scoring using Original BPS scoring system
 */
function checkClearRow() {
  // find all rows without a 0 (full rows)
  const fullRows = grid.filter((row) => !row.includes(0));

  fullRows.forEach((row) => { // remove full rows
    grid = grid.slice(0, grid.indexOf(row)).concat(
        grid.slice(grid.indexOf(row) + 1));
    grid.unshift(new Array(grid[0].length).fill(0)); // add in empty row
  });

  if (fullRows.length == 1) {
    score+=40;
  } else if (fullRows.length == 2) {
    score+=100;
  } else if (fullRows.length == 3) {
    score+=300;
  } else if (fullRows.length == 4) {
    score+=1200;
  }
}

/**
 * @description Cancel animation frame; remove event listeners
 */
function killTetris() {
  cancelAnimationFrame(requestID);
  document.removeEventListener('keypress', onKeyPress);
  document.removeEventListener('keydown', onKeyDown);
}

/**
 * @description CheckGameOver; select next shape; check cleared row;
 *  updated global compFallSpeed
 * @return {undefined}
 */
function pickNextShape() {
  checkGameOver();
  if (gameOver) {
    return;
  }

  curShape = nextShape;
  if (shapeBag.length == 0) {
    shapeBag = [0, 1, 2, 3, 4, 5, 6];
  }
  // make the 7 2 constant starting points
  nextShape = new Shape(STARTING_X, STARTING_Y, shapeBag);
  shapeBag.splice(shapeBag.indexOf(nextShape.index), 1);

  checkClearRow();

  updateScore();
  compFallSpeed = (FPS + compFallSpeed) <= 5 ?
    compFallSpeed : compFallSpeed - DFALLSPEED;

  updateSideGrid();
  drawSideGrid();
}

/**
 * @description Update HTML label score
 */
function updateScore() {
  scoreLabel.innerHTML = 'Score ' + score;
}

/**
 * @description On key press wrapper
 * @param {*} keypress
 */
function onKeyPress(keypress) {
  if (keypress.code == 'KeyW') {
    rotate();
  } else if (keypress.code == 'KeyA' || keypress.code == 'KeyD') {
    move(keypress.code);
  } else if (keypress.code == 'KeyQ') {
    drop();
  }
}

/**
 * @description On key down wrapper
 * @param {*} keypress
 */
function onKeyDown(keypress) {
  if (keypress.code == 'KeyS') {
    fall();
  }
}

/**
 * @description Main draw loop
 */
function draw() {
  now = Date.now();
  delta = now - then;

  if (delta > INTERVAL) {
    framecount++;
    then = now - (delta % INTERVAL);

    // every fall frame
    /* previously: if(framecount % FPS == 0) { */
    if (framecount >= (FPS + compFallSpeed)) {
      framecount = 0;
      fall();
    }

    drawShapes();
    drawOutline();
    // drawGrid();
    // printGrid();
  }

  if (!gameOver) {
    requestID = requestAnimationFrame(draw);
  } else {
    killTetris();
    displayGameOver();
  }
}

/**
 * @description Main
 */
function main() {
  initSetup();
  requestID = requestAnimationFrame(draw);
}

main();
