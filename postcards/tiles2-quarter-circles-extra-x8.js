const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createArcPath, createLinePath } = require('../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');
const rnd2 = require('../utils/random');
  
let paths = [];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const postcardGrid = { columns: 1, rows: 1};

const createGrid = (columns, rows, w, h, marginX) => {
  random.setSeed(random.getRandomSeed());

  let o = [];
  let side = (w - (marginX*2))/columns;
  let marginY = (h - (side*rows))/2;
  let start = [marginX, marginY];

  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let c = 0; c < columns; c++) {
      let corner = random.rangeFloor(0,4);//rnd2.getRandomInt(4, 0);//Math.floor(random.noise2D(c,r) * (4 - 0) + 0);
      let lines = random.value() < 0.07;
      const position = [ start[0] + c*side, start[1]+r*side ];

      //console.log(corner);
      o[r].push({
        position,
        corner, 
        draw01: true,
        draw12: true,
        draw23: true,
        draw30: true,
        lines
      });
    }
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      switch (o[r][c].corner) {
        // 0 1
        // 3 2
        case 0:
          o[r][c].draw12 = false;
          o[r][c].draw23 = false;
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        case 1:
          o[r][c].draw30 = false;
          o[r][c].draw23 = false;
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
          o[r][c].draw01 = false;
          o[r][c].draw30 = false;
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
          o[r][c].draw01 = false;
          o[r][c].draw12= false;
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

  return {seed: random.getSeed(), grid: o};
}

const drawTile = (x, y, side, rnd, padding = 0) => {

  let corner = rnd.corner;

  let zeroCorner = [x + padding, y + padding],
    oneCorner = [x + side - padding, y + padding],
    twoCorner = [x + side - padding, y + side - padding],
    threeCorner = [x + padding, y + side - padding];

  // case 0
  let cx = x + padding, 
    cy = y + padding,
    ocx = x + side - padding,
    ocy = y + side - padding,
    startAngle = 0,
    ostartAngle = 180,
    p0 = zeroCorner,
    p1 = oneCorner,
    p2 = threeCorner,
    l1 = [[x, y], [x+ side, y]],
    l1hor = true;
  // p0p1 = 01
  // p0p2 = 30

  // 0 1
  // 3 2
  switch (corner) {
    case 1:
      cx = x + side - padding;
      cy = y + padding;
      ocx = x + padding;
      ocy = y + side - padding;
      startAngle = 90;
      ostartAngle = 270;
      p0 = oneCorner;
      p1 = zeroCorner;
      p2 = twoCorner,
      l1 = [[x, y], [x, y+side]],
      l1hor = false;
      // p0p1 = 01
      // p0p2 = 12

      break;
    case 2:
      cx = x + side - padding;
      cy = y + side - padding;
      ocx = x + padding,
      ocy = y + padding,
      startAngle = 180;
      ostartAngle = 0;
      p0 = twoCorner;
      p1 = oneCorner;
      p2 = threeCorner,
      l1 = [[x, y], [x+ side, y]],
      l1hor = true;
      // p0p1 = 12
      // p0p2 = 23

      break;
    case 3:
      cx = x + padding;
      cy = y + side - padding;
      ocx = x + side - padding,
      ocy = y + padding,
      startAngle = 270;
      ostartAngle = 90;
      p0 = threeCorner;
      p1 = twoCorner;
      p2 = zeroCorner,
      l1 = [[x, y], [x, y+ side]],
      l1hor = false;
      // p0p1 = 23
      // p0p2 = 30

      break;
    default:
      break;
  }

  let result = [];

  
  let radius = side - padding * 2;
  let divide = 7;
  let step = radius / divide;

  if (rnd.lines) {
    for (let s = 0; s <= divide; s++) {
      result.push(
        createLinePath(l1)
      );
      if(l1hor) {l1[0][1] = l1[0][1]+step; l1[1][1] = l1[1][1]+step;}
      else {l1[0][0] = l1[0][0] +step; l1[1][0] = l1[1][0]+step;}                                    
    }
  }

  else {
    let endAngle = startAngle + 90;

  for (let s = 1; s <= divide; s++) {
    createArcPath([cx, cy], s * step, startAngle, endAngle);
    result.push(createArcPath([cx, cy], s * step, startAngle, endAngle));
                                            
  }

  for (let s = 1; s < divide; s++) {
    let a = new arc([ocx, ocy], s * step, startAngle, endAngle);
    let i = a.intersects([{r: radius, c: {x: cx, y:cy}}])
    
    if (!i || i.length === 0) {
        result.push(createArcPath( [ocx, ocy], s * step, ostartAngle, ostartAngle+90));     
    }
    else {
    i.forEach(element => {
      result.push(createArcPath([ocx, ocy], s* step, ostartAngle, element[1]))
      result.push(createArcPath([ocx, ocy], s* step, element[0], ostartAngle-270))

    });
  }
                                     
  }
  }
  
  
  return result;
};

const sketch = ({ width, height }) => {
  const cardWidth = width / postcardGrid.columns;
  const cardHeight = height / postcardGrid.rows;
  //tile grid
  const countX = 19;
  const countY = Math.floor(cardHeight / Math.floor(cardWidth/countX));
  const margin = cardWidth * 0.013;

  const grids = [];
  for (let i = 0; i < postcardGrid.columns*postcardGrid.rows; i++) {
      grids.push(createGrid(countX, countY, cardWidth, cardHeight, margin))
  }

  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      this.paths = [];

      let grid = grids[opts.index].grid;

      let side = (w - (margin*2)) / countX;
      
      for (let row = 0; row < countY; row++) {
        for (let column = 0; column < countX; column++) {
          const position = grid[row][column].position;
          const tile = {border, draw01, draw12,draw23,draw30} = grid[row][column];

          const [x,y] = postcards.reorigin([position[0],position[1]], origin);

          path = drawTile(x,y,side, tile, 0);
          
          paths.push(...path);
        }
      }
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, postcardGrid.columns, postcardGrid.rows);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);