/* eslint linebreak-style: ['error', 'windows'] */
/* GLOBALS */
/**
 * @description
 */
class Tetris {
  /**
   * @description init canvases/contexts, init globals, create starting shapes,
   *  draw grids, define and init event listeners
   * @param {int} scale
   * @param {int} xPad
   * @param {int} yPad
   */
  constructor(scale, xPad, yPad) {
    this.STARTING_X = 7;
    this.STARTING_Y = 2;
    this.FPS = 30;
    this.INTERVAL = 1000 / this.FPS;
    this.SCALE = scale;
    this.SIDESCALE = 40;
    this.BUFFERSPACE = 4;
    this.DFALLSPEED = .5;
    this.xPad = xPad;
    this.yPad = yPad;

    this.delta = 0;
    this.now = 0;
    this.grid = 0;
    this.sideGrid = 0;
    this.requestID = 0;


    this.mainCanvas = document.getElementById('mainCanvas');
    this.sideCanvas = document.getElementById('sideCanvas');
    // this.scoreLabel = document.getElementById('scoreLabel');
    this.context = this.mainCanvas.getContext('2d');
    this.sideContext = this.sideCanvas.getContext('2d');

    this.then = Date.now();
    this.framecount = 0;
    this.gameOver = 0;
    this.compFallSpeed = 0;
    this.score = 0;
    this.updateScore();

    this.createGrids(15, 20 + this.BUFFERSPACE);
    // this.printGrid();
    // this.drawGrid();

    this.shapeBag = [0, 1, 2, 3, 4, 5, 6];
    this.curShape = new Shape(this.STARTING_X, this.STARTING_Y, this.shapeBag);
    this.shapeBag.splice(this.shapeBag.indexOf(this.curShape.index), 1);
    this.nextShape = new Shape(this.STARTING_X, this.STARTING_Y, this.shapeBag);
    this.shapeBag.splice(this.shapeBag.indexOf(this.nextShape.index), 1);

    this.updateSideGrid();
    // this.drawSideGrid();
  }

  /**
   * @description creates a height * width 2d array main grid and 4*4 sidegrid
   * @param {int} width
   * @param {int} height
   */
  createGrids(width, height) {
    this.grid = [];
    for (let h = 0; h < height; h++) {
      this.grid.push(new Array(width).fill(0));
    }

    this.sideGrid = [];
    for (let h = 0; h < 4; h++) {
      this.sideGrid.push(new Array(4).fill(0));
    }
  }

  // /**
  //  * @description print the grid to console - debugging
  //  */
  // printGrid() {
  //   for (let i = 0; i < this.grid.length; i++) {
  //     console.log(i + '\t' + this.grid[i].toString() + '\n');
  //   }
  // }

  // /**
  //  * @description draw grid on canvas - debugging
  //  */
  // drawGrid() {
  //   for (let y = 0; y < this.grid.length; y++) {
  //     for (let x = 0; x < this.grid[y].length; x++) {
  //       if (this.grid[y][x] == 0) {
  //         this.context.strokeRect(x * this.SCALE, y * this.SCALE -
  //             (this.SCALE * this.BUFFERSPACE), this.SCALE, this.SCALE);
  //       }
  //     }
  //   }
  // }

  /**
   * @description draw outline of main canvas
   */
  drawOutline() {
    this.context.strokeRect(0, 0, this.mainCanvas.width,
        this.mainCanvas.height);
  }

  /**
   * @description draws all shapes on canvas at grid positions
   * I know I could do this with canvas.scale() and translate and keep a stack
   * but the math makes much more sense to me
   */
  drawShapes() {
    for (let y = this.BUFFERSPACE; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] != 0) {
          this.context.fillStyle = this.grid[y][x].color;
          this.context.fillRect(this.xPad + x * this.SCALE,
              this.yPad + y * this.SCALE - (this.SCALE * this.BUFFERSPACE),
              this.SCALE, this.SCALE);
          this.context.strokeRect(this.xPad + x * this.SCALE,
              this.yPad + y * this.SCALE - (this.SCALE * this.BUFFERSPACE),
              this.SCALE, this.SCALE);
        } else {
          this.context.fillStyle = '#000000';
          this.context.fillRect(this.xPad + x * this.SCALE,
              this.yPad + y * this.SCALE - (this.SCALE * this.BUFFERSPACE),
              this.SCALE, this.SCALE);
        }
      }
    }
  }

  /**
   * @description draws side grid displaying next shape
   */
  drawSideGrid() {
    for (let y = 0; y < this.sideGrid.length; y++) {
      for (let x = 0; x < this.sideGrid[y].length; x++) {
        if (this.sideGrid[y][x] != 0) {
          this.sideContext.fillStyle = this.sideGrid[y][x].color;
          this.sideContext.fillRect(x * this.SIDESCALE, y * this.SIDESCALE,
              this.SIDESCALE, this.SIDESCALE);
          this.sideContext.strokeRect(x * this.SIDESCALE, y * this.SIDESCALE,
              this.SIDESCALE, this.SIDESCALE);
        } else {
          this.sideContext.fillStyle = '#ffffff';
          this.sideContext.fillRect(x * this.SIDESCALE, y * this.SIDESCALE,
              this.SIDESCALE, this.SIDESCALE);
        }
      }
    }
  }

  /**
   * @description Try to drop curShape 1
   * @return {undefined}
   */
  fall() {
    let newpositions = [];
    newpositions = this.curShape.fall();

    if (this.borderDetection(newpositions) == 1) {
      this.pickNextShape();
      return;
    }

    if (this.collisionDetection(newpositions) == 1) {
      this.pickNextShape();
      return; // curShape can no longer drop - select next shape
    }

    // newpositions are valid, set to curShape
    this.curShape.position = newpositions;
    this.updateGrid();
  }

  /**
   * @description do later
   */
  drop() {
    let newpositions = this.curShape.fall();
    let blocksFallen = 1;
    while (this.borderDetection(newpositions) != 1 &&
    this.collisionDetection(newpositions) != 1) {
      this.curShape.position = newpositions;
      this.updateGrid();
      newpositions = this.curShape.fall();
      blocksFallen++;
    }
    this.curShape.position = newpositions;
    this.score+= blocksFallen++;
    this.pickNextShape();
  }

  /**
   * @description Try to move curShape left or right one
   * @param {*} keyCode
   * @return {undefined}
   */
  move(keyCode) {
    let newpositions = [];
    if (keyCode == 'KeyA') {
      newpositions = this.curShape.move(-1); // move left
    } else if (keyCode == 'KeyD') {
      newpositions = this.curShape.move(1); // move right
    }

    if (this.collisionDetection(newpositions) == 1) {
      return; // do nothing
    }

    const borderHit = this.borderDetection(newpositions);
    if (borderHit == 0) { // no hit
      this.curShape.position = newpositions;
      this.updateGrid();
    }
  }

  /**
   * @description Try to rotate curShape
   */
  rotate() {
    const newpositions = this.curShape.rotate();
    if (this.borderDetection(newpositions) == 0 &&
          this.collisionDetection(newpositions) == 0) { // no hit
      this.curShape.position = newpositions;
      this.updateGrid();
    }
  }

  /**
   * @description updateGrid with new positions, remove old ones
   */
  updateGrid() {
    const lastPosition = this.curShape.lastPosition;
    lastPosition.forEach((square) => { // clear old positions
      this.grid[square[1]][square[0]] = 0;
    });

    const position = this.curShape.position;
    position.forEach((square) => { // set new positions
      this.grid[square[1]][square[0]] = this.curShape;
    });
  }

  /**
   * @description UpdateSideGrid with nextShape
   */
  updateSideGrid() {
    this.sideGrid.forEach((row) => row.fill(0)); // clear grid

    this.nextShape.position.forEach((pos) => { // set grid with nextShape
      this.sideGrid[pos[1] - (this.STARTING_Y - 1)][pos[0] -
      (this.STARTING_X - 1)] = this.nextShape;
    });
  }

  /**
   * @description Check for border collisons
   * @param {*} position
   * @return {int} 1: bottom hit 2: side hit; 0: no hit
   */
  borderDetection(position) {
    // find lowest square
    let lowY = 0;
    let leftX = 0;
    let rightX = this.grid[0].length;

    position.forEach(([x, y]) => { // we only need to check the outer coords
      lowY = Math.max(lowY, y);
      leftX = Math.max(leftX, x);
      rightX = Math.min(rightX, x);
    });

    if (lowY == this.grid.length) { // bottom hit
      return 1;
    }
    if (leftX == this.grid[0].length) { // side hit
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
  collisionDetection(position) {
    for (let i = 0; i < position.length; i++) {
      if (this.grid[position[i][1]][position[i][0]] != 0 &&
          this.grid[position[i][1]][position[i][0]] != this.curShape) {
        return 1;
      }
    }
    return 0;
  }

  /**
   * @description Check for gameOver - update global this.gameOver if true
   */
  checkGameOver() {
    this.curShape.position.forEach(([x, y]) => {
      if (y <= this.BUFFERSPACE) {
        this.gameOver = 1;
      }
    });
  }

  /**
   * @description Dsiplay Game over using the HTML elements
   */
  displayGameOver() {
    // this.scoreLabel.innerHTML = 'GAME OVER   Final Score: ' + this.score;
  }

  /**
   * @descriptionv Check for a row full of shapes - clear if true
   * @source https://tetris.wiki/Scoring using Original BPS scoring system
   */
  checkClearRow() {
    // find all rows without a 0 (full rows)
    const fullRows = this.grid.filter((row) => !row.includes(0));

    fullRows.forEach((row) => { // remove full rows
      this.grid = this.grid.slice(0, this.grid.indexOf(row)).concat(
          this.grid.slice(this.grid.indexOf(row) + 1));
      // add in empty row
      this.grid.unshift(new Array(this.grid[0].length).fill(0));
    });

    if (fullRows.length == 1) {
      this.score+=40;
    } else if (fullRows.length == 2) {
      this.score+=100;
    } else if (fullRows.length == 3) {
      this.score+=300;
    } else if (fullRows.length == 4) {
      this.score+=1200;
    }
  }

  /**
   * @description Cancel animation frame; remove event listeners
   */
  killTetris() {
    cancelAnimationFrame(this.requestID);
    // document.removeEventListener('keypress', onKeyPress);
    // document.removeEventListener('keydown', onKeyDown);
  }

  /**
   * @description CheckGameOver; select next shape; check cleared row;
   *  updated global compFallSpeed
   * @return {undefined}
   */
  pickNextShape() {
    this.checkGameOver();
    if (this.gameOver) {
      return;
    }

    this.curShape = this.nextShape;
    if (this.shapeBag.length == 0) {
      this.shapeBag = [0, 1, 2, 3, 4, 5, 6];
    }
    // make the 7 2 constant starting points
    this.nextShape = new Shape(this.STARTING_X, this.STARTING_Y, this.shapeBag);
    this.shapeBag.splice(this.shapeBag.indexOf(this.nextShape.index), 1);

    this.checkClearRow();

    this.updateScore();
    this.compFallSpeed = (this.FPS + this.compFallSpeed) <= 5 ?
      this.compFallSpeed : this.compFallSpeed - this.DFALLSPEED;

    this.updateSideGrid();
    // this.drawSideGrid();
  }

  /**
   * @description Update HTML label score
   */
  updateScore() {
    // this.scoreLabel.innerHTML = 'Score ' + this.score;
  }

  /**
   * @description Main draw loop
   */
  draw() {
    this.now = Date.now();
    this.delta = this.now - this.then;

    if (this.delta > this.INTERVAL) {
      this.framecount++;
      this.then = this.now - (this.delta % this.INTERVAL);

      // every fall frame
      /* previously: if(framecount % this.FPS == 0) { */
      if (this.framecount >= (this.FPS + this.compFallSpeed)) {
        this.framecount = 0;
        this.fall();
      }

      this.drawShapes();
      this.drawOutline();
      // drawGrid();
      // printGrid();
    }

    if (!this.gameOver) {
      this.requestID = requestAnimationFrame(() => this.draw());
    } else {
      this.killTetris();
      this.displayGameOver();
    }
  }
};
