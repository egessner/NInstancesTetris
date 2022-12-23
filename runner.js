/* eslint linebreak-style: ['error', 'windows'] */
// GLOBALS
let n;
const canvas = document.getElementById('mainCanvas');
let tetris;
/**
 * @description init everything and begin each tetris instance
 */
function main() {
  const tetrisNum = document.getElementById('n');
  n = tetrisNum.value;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (tetris) {
    tetris.forEach((row) => row.forEach((tet) => tet.killTetris()));
  }
  createTetrisArray();
  tetris.forEach((row) => row.forEach((tet) => tet.draw()));

  document.addEventListener('keypress', onKeyPress);
  document.addEventListener('keydown', onKeyDown);
  const button = document.getElementById('restartButton');
  button.addEventListener('click', main);
}

/**
 * @description On key press wrapper
 * @param {*} keypress
 */
function onKeyPress(keypress) {
  if (keypress.code == 'KeyW') {
    tetris.forEach((row) => row.forEach((tet) => tet.rotate()));
  } else if (keypress.code == 'KeyA' || keypress.code == 'KeyD') {
    tetris.forEach((row) => row.forEach((tet) => tet.move(keypress.code)));
  } else if (keypress.code == 'KeyQ') {
    tetris.forEach((row) => row.forEach((tet) => tet.drop()));
  }
}

/**
 * @description On key down wrapper
 * @param {*} keypress
 */
function onKeyDown(keypress) {
  if (keypress.code == 'KeyS') {
    tetris.forEach((row) => row.forEach((tet) => tet.fall()));
  }
}

/**
 * @description create a squarish tetris array with each tetris
 * element scaled and padded
 * as long as the canvas is of ratio 3x4 this will work
 */
function createTetrisArray() {
  tetris = [];
  // determine size of square tetris array
  let i;
  for (i = n; i < n*2; i++) {
    const sqr = Math.sqrt(i);
    if (Number.isInteger(sqr)) {
      i = sqr;
      break;
    }
  }
  // determine scale
  const scale = canvas.width / (15 * i);

  // create array
  for (let j = 0; j < i; j++) {
    tetris[j] = new Array(i).fill(0);
  }

  // fill array with tetris
  for (let y = 0; y < tetris.length; y++) {
    const yPad = (canvas.height / i) * y;
    for (let x = 0; x < tetris[0].length; x++) {
      const xPad = (canvas.width / i) * x;
      if ((y*i) + x <= n - 1) {
        tetris[y][x] = new Tetris(scale, xPad, yPad);
      }
    }
  }
  // remove non tetris elements from array
  tetris = tetris.map((row) => row.filter((tet) => tet != 0));
}

main();
