/* eslint linebreak-style: ['error', 'windows'] */
/**
 * @description
 */
function main() {
  tetris.push(new Tetris(20, 0, 0));
  tetris.push(new Tetris(20, 300, 0));
  tetris.push(new Tetris(20, 0, 400));
  tetris.push(new Tetris(20, 300, 400));
  tetris.forEach((tet) => tet.draw());
  document.addEventListener('keypress', onKeyPress);
  document.addEventListener('keydown', onKeyDown);
}
let tetris = [];


/**
 * @description On key press wrapper
 * @param {*} keypress
 */
function onKeyPress(keypress) {
  if (keypress.code == 'KeyW') {
    tetris.forEach((tet) => tet.rotate());
  } else if (keypress.code == 'KeyA' || keypress.code == 'KeyD') {
    tetris.forEach((tet) => tet.move(keypress.code));
    // tetris.move(keypress.code);
  } else if (keypress.code == 'KeyQ') {
    tetris.forEach((tet) => tet.drop());
    // tetris.drop();
  }
}

/**
 * @description On key down wrapper
 * @param {*} keypress
 */
function onKeyDown(keypress) { // probobly need to move this into runner
  if (keypress.code == 'KeyS') {
    tetris.forEach((tet) => tet.fall());
    // tetris.fall();
  }
}

main();
