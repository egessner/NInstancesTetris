/* eslint linebreak-style: ['error', 'windows'] */
const n = 1;
const canvas = document.getElementById('mainCanvas');
let tetris;
/**
 * @description
 */
function main() {
  if (tetris) {
    tetris.forEach((row) => row.forEach((tet) => tet.killTetris()));
  }
  createTetrisArray();
  tetris.forEach((row) => row.forEach((tet) => tet.draw()));

  document.addEventListener('keypress', onKeyPress);
  document.addEventListener('keydown', onKeyDown);
  button = document.getElementById('restartButton');
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

main();

/**
 * @description
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
  console.log(scale);

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
  tetris = tetris.map((row) => row.filter((index) => index != 0));
}

// the math for xPad is (canvas.width / numColumns) * current column
// yPad is (canvas.length / numRows) * current row
/**
 * this is how we determine scale:
 *  scale = canvas.width / n / 15
 *  15 is the width of a tetris object
 * so i think as long as scale is > 1 we should be good to go
 * this will work as long as we keep the canvas this ratio
 *
 * to create a square matrix:
 * increment n until Math.sqr(n) is an integer
 */
/**
 * one way is to say ok the canvas is 400 x 600 thats 4x6 find the lowest
 * scaling of that ratio that fits n indices; thats not enough needs
 * to fit with scale
 *=
  * we are forgetting about scale how do we do scale
  * scale of 20 is a rectangle 20xrows x 20xcolumns
  *
  * need to find the largest 4x6xscale that fits n indices i think
  * so for 600x800 with n of 4 the scale is 20 why?
  * each tetris object is 15x20 so 20x that is 300x400
  * the orig is 40 thats 600x800 ie the whole orig canvas
  * each time i half the scale i get 4 spaces its squared?
  * need to find a relation between scale and number of columns i think
  *
  * when scale is 10 i can fit 8 in a 1200 width canvas 10x15=150 x8=1200
  * when scale is 20 i can fit 4 in a 1200 width canvas 20x15=300 x4=1200
  * When scale is 40 I can fit 2 in a 1200 width canvas 40x15=600 x2=1200
  * what is the relation
  *
  * I think scale is the most important
  * if the canvas is 1200x1600 and n=4 then scale is 40
  * if the canvas is 1200x1600 and n=16 then scale is 20
  *
  * this is how we determine scale:
  *  scale = canvas.width / n / 15
  *  15 is the width of a tetris object
  * so i think as long as scale is > 1 we should be good to go
  * this will work as long as we keep the canvas this ratio
  * but what if n is not a multiple of 4?
  */
