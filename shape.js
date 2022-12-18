/* eslint linebreak-style: ['error', 'windows'] */
/**
 * @classdesc Shape class - define and suggest updated positions
 */
class Shape {
  /**
   * @description Constructor for Shape class
   * @param {int} SPx starting x position
   * @param {int} SPy starting y position
   * @param {Array} bag bag of indexes
   */
  constructor(SPx, SPy, bag) {
    this.index = this.generateIndex(bag);

    this.color = this.setColor(this.index);
    this.position = this.setShape(SPx, SPy, this.index);
    this.lastPosition = structuredClone(this.position);
  }

  /**
   * @description Using random bag, pick an index for shape and color
   * @param {Array} bag bag of random indexes
   * @return {int} random number
   */
  generateIndex(bag) {
    return bag[Math.round(Math.random() * (bag.length - 1))];
  }

  /**
   * @description Set the color for the shape via index
   * @param {int} index index of shape and color
   * @return {hex} hexadecimal color
   */
  setColor(index) {
    const colors = ['#E3330D', '#E3BA0D', '#21B600', '#0298C0',
      '#0241C0', '#8602C0', '#C0029B'];
    return colors[index];
  }

  /**
   * @description Set the shape starting coords
   * @param {*} SPx Starting position X
   * @param {*} SPy Starting position Y
   * @param {*} index Index of shape and color
   * @return {[int[]]}
   */
  setShape(SPx, SPy, index) {
    // array of arrays of x and ys for each square in the shape
    const shapeArray = [
      [[SPx, SPy], [SPx-1, SPy+1], [SPx, SPy+1], [SPx+1, SPy+1]],
      [[SPx, SPy], [SPx, SPy+1], [SPx+1, SPy], [SPx+1, SPy+1]],
      [[SPx, SPy], [SPx+1, SPy], [SPx, SPy+1], [SPx, SPy+2]],
      [[SPx, SPy], [SPx, SPy-1], [SPx, SPy+1], [SPx, SPy+2]],
      [[SPx, SPy], [SPx+1, SPy], [SPx, SPy+1], [SPx-1, SPy+1]],
      [[SPx, SPy], [SPx-1, SPy], [SPx, SPy+1], [SPx+1, SPy+1]],
      [[SPx, SPy], [SPx-1, SPy], [SPx, SPy+1], [SPx, SPy+2]],
    ];
    return shapeArray[index];
  }

  /**
   * @description Add 1 to each y coord in shape positions
   * @return {Array} potential new positions after fall
   */
  fall() {
    this.lastPosition = structuredClone(this.position);
    const newpositions = [];

    for (let i = 0; i < this.position.length; i++) {
      const x = this.position[i][0];
      const y = this.position[i][1];
      newpositions[i] = [x, y+1];
    }
    return newpositions;
  }

  /**
   * @description Rotate each set of coords around the 1st set of coords
   * @return {Array} potential new positions after rotate
   */
  rotate() {
    this.lastPosition = structuredClone(this.position);
    const newpositions = [];
    const xPos0 = this.position[0][0]; // the first position x
    const yPos0 = this.position[0][1];
    for (let i = 0; i < this.position.length; i++) {
      const x = this.position[i][0] - xPos0;
      const y = this.position[i][1] - yPos0;

      newpositions[i] = [(-y+xPos0), (x+yPos0)];
    }
    return newpositions;
  }

  /**
   * @description Add or subtract 1 to each x coord in shape positions
   * @param {int} direction move right (+) or left (-) 1
   * @return {Array} potential new positions after move
   */
  move(direction) {
    this.lastPosition = structuredClone(this.position);
    const newpositions = [];
    for (let i = 0; i < this.position.length; i++) {
      const x = this.position[i][0] + (direction*1);
      newpositions[i] = [x, this.position[i][1]];
    }
    return newpositions;
  }
}
