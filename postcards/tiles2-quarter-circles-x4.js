const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');
const rnd2 = require('../utils/random');

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);
// 469789
// 219376
  
let paths = [];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};



const createGrid = (columns, rows, w, h, marginX) => {
  let o = [];
  let side = (w - (marginX*2))/columns;
  let marginY = (h - (side*rows))/2;
  let start = [marginX, marginY];

  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let c = 0; c < columns; c++) {
      let corner = random.rangeFloor(0,4);//rnd2.getRandomInt(4, 0);//Math.floor(random.noise2D(c,r) * (4 - 0) + 0);
      const position = [ start[0] + c*side, start[1]+r*side ];

      //console.log(corner);
      o[r].push({
        position,
        corner, 
        draw01: true,
        draw12: true,
        draw23: true,
        draw30: true
      });
    }
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      switch (o[r][c].corner) {
        // 0 1
        // 3 2
        case 0:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        case 1:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          break;
        case 2:
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          if (
            r < rows - 1 &&
            (o[r + 1][c].corner === 1 || o[r + 1][c].corner === 0)
          ) {
            o[r][c].draw23 = false;
          }
          break;
        case 3:
          if (r < rows - 1 && (o[r + 1][c].corner === 0 || o[r + 1][c].corner === 1)) {
            o[r][c].draw23 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        default:
          break;
      }
    }
  }

  return o;
}

const drawLineOnCanvas = (ctx, line) => {
  let x1 = line[0].x  || line[0][0],
      x2 = line[1].x || line[1][0],
      y1 = line[0].y || line[0][1],
      y2 = line[1].y || line[1][1];

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

const drawArcOnCanvas = (ctx, cx, cy, radius, sAngle, eAngle) => {
  //ctx.beginPath();
  ctx.arc(
    cx,
    cy,
    radius,
    (Math.PI / 180) * sAngle,
    (Math.PI / 180) * eAngle
  );
  //ctx.stroke();
};

const drawTile = (x, y, side, rnd, padding = 0) => {
  //console.log({x, y, side, rnd});
  // let s = poly.createSquarePolygon(x,y, side, side);
  // poly.drawPolygonOnCanvas(context, s);
  // squareGroup1.push(s);
  let corner = rnd.corner;

  let zeroCorner = [x + padding, y + padding],
    oneCorner = [x + side - padding, y + padding],
    twoCorner = [x + side - padding, y + side - padding],
    threeCorner = [x + padding, y + side - padding];

  let drawline1 = true;
  let drawline2 = true;

  let cx = x + padding, // case 0
    cy = y + padding,
    startAngle = 0,
    p0 = zeroCorner,
    p1 = oneCorner,
    p2 = threeCorner;
  // p0p1 = 01
  drawline1 = rnd.draw01;
  // p0p2 = 30
  drawline2 = rnd.draw30;

  // 0 1
  // 3 2
  switch (corner) {
    case 1:
      cx = x + side - padding;
      cy = y + padding;
      startAngle = 90;
      p0 = oneCorner;
      p1 = zeroCorner;
      p2 = twoCorner;
      // p0p1 = 01
      drawline1 = rnd.draw01;
      // p0p2 = 12
      drawline2 = rnd.draw12;
      break;
    case 2:
      cx = x + side - padding;
      cy = y + side - padding;
      startAngle = 180;
      p0 = twoCorner;
      p1 = oneCorner;
      p2 = threeCorner;
      // p0p1 = 12
      drawline1 = rnd.draw12;
      // p0p2 = 23
      drawline2 = rnd.draw23;
      break;
    case 3:
      cx = x + padding;
      cy = y + side - padding;
      startAngle = 270;
      p0 = threeCorner;
      p1 = twoCorner;
      p2 = zeroCorner;
      // p0p1 = 23
      drawline1 = rnd.draw23;
      // p0p2 = 30
      drawline2 = rnd.draw30;
      break;
    default:
      break;
  }

  let result = [];

  
    if (drawline1) {
      let l1 = [p0, p1];
      result.push(createPath(ctx => {
        drawLineOnCanvas(ctx, l1);
      }));
    }
    if (drawline2) {
      let l2 = [p0, p2];
      result.push(createPath(ctx => {
        drawLineOnCanvas(ctx, l2);
      }));
    }
  
    let endAngle = startAngle + 90;
  
    let radius = side - padding * 2;
    let divide = 5;
    let step = radius / divide;
  
    for (let s = 1; s <= divide; s++) {
      result.push(createPath(ctx => {
        drawArcOnCanvas(ctx, cx, cy, s * step, startAngle, endAngle);     
      }));
                                             
    }
  
  return result;
};

const sketch = ({ width, height }) => {
  const countX = 4;
  const countY = 7

  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h) => {
      this.paths = [];
      const margin = w * 0.15;
      //const countY = Math.floor(countX / w * h);
      let grid = createGrid(countX, countY, w, h, margin);

      let side = (w - (margin*2)) / countX;
      
      for (let row = 0; row < countY; row++) {
        for (let column = 0; column < countX; column++) {
          const position = grid[row][column].position;
          const tile = {border, draw01, draw12,draw23,draw30} = grid[row][column];

          const x0 = position[0]; //lerp(margin, w - margin, position[0]);
          const y0 = position[1]; //lerp(margin, h - margin, position[1]);

          const [x,y] = postcards.reorigin([x0,y0], origin);
          //console.log([x0, y0], [x,y])


          // paths.push(createPath(ctx => {
          //   drawArcOnCanvas(ctx, x, y, 2, 0, 360);     
          // }));

          path = drawTile(x,y,side, tile, 0);
          
          paths.push(...path);
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