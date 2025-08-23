const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');

export const create2dLerpedGrid = (countX, countY, {left, top, right, bottom}, noiseFactor = 1) => {
    const grid = [];
    for (let x = 0; x < countX; x++) {
      const points = [];
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const xpos = lerp(left, right, u);
        const ypos = lerp(top, bottom, v);
        const position = [ xpos, ypos ];
        const noise = random.noise2D(u,v) * noiseFactor;
        points.push({
          position,
          noise
        });
      }
      grid.push(points);
    }
    return grid;
  };


  export const create2dClassicGrid = (elementHeight, elementWidth, {left, top, right, bottom}, noiseFactor = 1) => {
    let width = right - left;
    let height = bottom - top;
    const countX = Math.floor(width / elementWidth);
    const countY = Math.floor(height / elementHeight)
  
    const grid = [];
    for (let x = 0; x < countX; x++) {
      const points = [];
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const posX = left + (x * elementWidth)
        const posY = top + (y * elementHeight)
        const position = [ posX, posY ];
        const noise = random.noise2D(u,v) * noiseFactor;
        points.push({
          position,
          noise,
        });
      }
      grid.push(points);
    }

    console.log(grid)
    return grid;
  };
