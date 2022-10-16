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
const { drawTile:draw2QCTile } = require('../tiles/tiletype-two-quarter-circles.js');
const { drawTile:drawLineTile } = require('../tiles/tiletype-lines.js');
const { drawTile:drawQCLTile1 } = require('../tiles/tiletype-quarter-circle-line1.js');
const { drawTile:drawQCLTile2 } = require('../tiles/tiletype-quarter-circle-line2.js');
const { drawTile:drawQCLTile3 } = require('../tiles/tiletype-quarter-circle-line3.js');
  
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

  let weightedArray = [];
  for (let i = 0; i < 2; i++) {
    weightedArray.push(drawQCLTile2);
  }
  for (let i = 0; i < 20; i++) {
    weightedArray.push(draw2QCTile);
  }
  for (let i = 0; i < 2; i++) {
    weightedArray.push(drawQCLTile1);
  }
  for (let i = 0; i < 2; i++) {
    weightedArray.push(drawLineTile);
  }
  for (let i = 0; i < 2; i++) {
    weightedArray.push(drawQCLTile3);
  }
  
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

  return {seed: random.getSeed(), grid: o};
}

const sketch = ({ width, height }) => {
  const cardWidth = width / postcardGrid.columns;
  const cardHeight = height / postcardGrid.rows;
  //tile grid
  const countX = 15;
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
          
          paths.push(...drawTile(x, y, side, rnd, 10));
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
