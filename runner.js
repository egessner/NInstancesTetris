/* eslint linebreak-style: ['error', 'windows'] */
/**
 * @description
 */
function main() {
  tetris = new Tetris();
  tetris.draw();
  document.addEventListener('keypress', onKeyPress);
  document.addEventListener('keydown', onKeyDown);
}
let tetris;
main();


/**
 * @description On key press wrapper
 * @param {*} keypress
 */
function onKeyPress(keypress) {
  if (keypress.code == 'KeyW') {
    tetris.rotate();
  } else if (keypress.code == 'KeyA' || keypress.code == 'KeyD') {
    tetris.move(keypress.code);
  } else if (keypress.code == 'KeyQ') {
    tetris.drop();
  }
}

/**
 * @description On key down wrapper
 * @param {*} keypress
 */
function onKeyDown(keypress) { // probobly need to move this into runner
  if (keypress.code == 'KeyS') {
    tetris.fall();
  }
}
