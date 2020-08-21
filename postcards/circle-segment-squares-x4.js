const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
//const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);
// 469789
// 219376
  
const paths = [];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const drawLine = (line) => {
  return createPath(ctx => {
    let x1 = line[0].x  || line[0][0],
        x2 = line[1].x || line[1][0],
        y1 = line[0].y || line[0][1],
        y2 = line[1].y || line[1][1];

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  });
}

const drawArc = (center, radius, sAngle, eAngle) => {
  let cx = center.x || center[0],
      cy = center.y || center[1];

  return createPath(ctx => {
    ctx.arc(
      cx,
      cy,
      radius,
      (Math.PI / 180) * sAngle,
      (Math.PI / 180) * eAngle
    );
  });
};

// const drawArc = (center, radius, sAngle, eAngle) => {
//   const path = createPath(ctx => {
//     ctx.arc(center.x, center.y, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
//   });
//   paths.push(path);
// }

const createGrid = (columns, rows) => {
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = random.rangeFloor(0,4) * 90; //utils.random(0, 360);
      let size = random.range(45, 270);
      let quarter = random.rangeFloor(1,4);
      o[r].push([rot, size, quarter]);
    }
  }
  return o;
}

const sketch = ({ width, height }) => {
  const columns = 4;
  const rows = 6;



  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    

    const draw = (origin, w, h) => {
      this.paths = [];
      const marginX = w * 0.15;

      let grid = createGrid(columns, rows);
      let size = Math.floor((w-(2*marginX))/columns);
      let marginY = (h - (size * rows)) / 2;

      let radius = size / 2;
      let divide = 10
      let step = radius / divide;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          let segment = grid[r][c];
          let x0 = marginX + c * size;
          let y0 = marginY + r * size;
          let [x,y] = postcards.reorigin([x0,y0], origin);

          for (let s = 0; s < (divide); s++) {
            paths.push(drawArc([x + radius, y + radius], s * step, segment[0], segment[0] + 270));
          }
        }
      }
      
    }

    postcards.drawQuad(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);