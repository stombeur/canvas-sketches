const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createArcPath, createLinePath } = require('../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards.js');
const rnd2 = require('../utils/random.js');
const { drawTile:draw2QCTile } = require('../tiles/tiletype-two-quarter-circles.js');
const { drawTile:drawLineTile } = require('../tiles/tiletype-lines.js');
const { drawTile:drawQCLTile1 } = require('../tiles/tiletype-quarter-circle-line1.js');
const { drawTile:drawQCLTile2 } = require('../tiles/tiletype-quarter-circle-line2.js');
const { drawTile:drawQCLTile3 } = require('../tiles/tiletype-quarter-circle-line3.js');
const { drawTile:draw4QCTile } = require('../tiles/tiletype-four-quarter-circles.js');
const { drawTile:drawSideSemiCircle } = require('../tiles/tiletype-side-semicircle-bookmarks.js');
const { drawTile:drawCorner } = require('../tiles/tiletype-side-corner.js');
  
let paths = [];

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`)

const settings = {
  suffix: `.seed-${random.getSeed()}`,
  dimensions: [ 370, 700 ],
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  divide: 3,
  countX: 5,
  tiles: [[draw2QCTile, 13],[drawLineTile, 0], [draw4QCTile, 0], [drawQCLTile1, 0], [drawQCLTile2, 0], [drawQCLTile3, 0]],
};

const postcardGrid = { columns: 1, rows: 1};

const createGrid = (columns, rows, w, h, marginX) => {
  let o = [];
  let side = (w - (marginX*2))/columns;
  let marginY = (h - (side*rows))/2;
  let start = [marginX, marginY];

  let weightedArray = [];
  settings.tiles.forEach((t) => {
    for (let i = 0; i < t[1]; i++) {
      weightedArray.push(t[0])
    }
  })
  
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let c = 0; c < columns; c++) {
      let corner = random.rangeFloor(0,4);//rnd2.getRandomInt(4, 0);//Math.floor(random.noise2D(c,r) * (4 - 0) + 0);
      let lines = random.value() < 0.07;
      const position = [ start[0] + c*side, start[1]+r*side ];
      const drawTile = random.pick(weightedArray);

      //console.log(corner);
      o[r].push({
        position,
        corner, 
        drawTile
      });
    }
  }
  // draw left and right borders
  for (let r = 1; r < rows-1; r++) {
    let left = o[r][0];
    let right = o[r][columns-1];

    left.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 1, divide, padding, r !== 1 && r !== rows-2);
    right.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 3, divide, padding, r !== 1 && r !== rows-2, r === rows-2);
  }

  // drawtop and bottom borders
  for (let c = 1; c < columns-1; c++) {
    let top = o[0][c];
    let bottom = o[rows-1][c];

    top.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 2, divide, padding, c !== 1 && c !== columns-2);
    bottom.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 0, divide, padding, c !== 1 && c !== columns-2, c === columns-2);
  }

  // o[0][0].drawTile = (x, y, side, rnd, divide, padding) => drawCorner(x, y, side, 0, divide, padding);
  // o[0][columns-1].drawTile = (x, y, side, rnd, divide, padding) => drawCorner(x, y, side, 1, divide, padding);
  // o[rows-1][0].drawTile = (x, y, side, rnd, divide, padding) => drawCorner(x, y, side, 3, divide, padding);
  // o[rows-1][columns-1].drawTile = (x, y, side, rnd, divide, padding) => drawCorner(x, y, side, 2, divide, padding);

  o[0][0].drawTile = (x, y, side, rnd, divide, padding) => [];
  o[0][columns-1].drawTile = (x, y, side, rnd, divide, padding) => [];
  o[rows-1][0].drawTile = (x, y, side, rnd, divide, padding) => [];
  o[rows-1][columns-1].drawTile = (x, y, side, rnd, divide, padding) => [];

  return {seed: random.getSeed(), grid: o};
}

const sketch = ({ width, height }) => {
  const cardWidth = width / postcardGrid.columns;
  const cardHeight = height / postcardGrid.rows;
  //tile grid
  const countX = settings.countX;
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
          const rnd = grid[row][column];
          const drawTile = grid[row][column].drawTile;
          const [x,y] = postcards.reorigin([position[0],position[1]], origin);
          
          paths.push(...drawTile(x, y, side, rnd, settings.divide));
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
