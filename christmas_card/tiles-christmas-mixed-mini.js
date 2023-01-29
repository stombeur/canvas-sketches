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
const { drawTile:draw4QCTile } = require('../tiles/tiletype-four-quarter-circles');
  
let paths = [];

let seed = random.getRandomSeed();

const settings = {
  seed: seed,
  dimensions: 'A3',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  divide: 8,
  countX: 13,
  countY: 15,
  tiles: [[draw2QCTile, 31],[drawLineTile, 2], [draw4QCTile, 0], [drawQCLTile1, 0], [drawQCLTile2, 0], [drawQCLTile3, 4]],
  mini: 0.3,
  // minilevels:2,
  prefix: 'tiles-christmas-mixed-mini',
  suffix: seed,
};

const postcardGrid = { columns: 2, rows: 2};

const treeGrid = [
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,1,1,1,0,0,0,0,0],
];

const forceMiniBlanks = [
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,1,0,0],
  [0,0,1,0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,1,0,1,0,0,0,0,0],
];

const createGrid = (columns, rows, w, h, marginX) => {
  random.setSeed(seed);

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
      const position = [ start[0] + c*side, start[1]+r*side ];
      const drawTile = random.pick(weightedArray);
      const mini = random.value() < settings.mini;
      const miniDrawTiles = [[random.pick(weightedArray), random.rangeFloor(0,4)], [random.pick(weightedArray), random.rangeFloor(0,4)], 
                              [random.pick(weightedArray), random.rangeFloor(0,4)],[random.pick(weightedArray), random.rangeFloor(0,4)]];
      const miniBlanks = random.value();

      //console.log(corner);
      o[r].push({
        position,
        corner, 
        drawTile,
        mini,
        miniDrawTiles,
        miniBlanks,
      });
    }
  }

  return {seed: random.getSeed(), grid: o};
}

const sketch = ({ width, height }) => {
  const cardWidth = width / postcardGrid.columns;
  const cardHeight = height / postcardGrid.rows;
  //tile grid
  const countX = settings.countX;
  const countY = settings.countY;//Math.floor(cardHeight / Math.floor(cardWidth/countX));
  const margin = cardWidth * 0.093;

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
          const element = grid[row][column];
          const position = element.position;
          const oktoDraw = treeGrid[row][column] === 1;
          
          if (!oktoDraw) continue;

          const drawTile = element.drawTile;
          const [x,y] = postcards.reorigin([position[0],position[1]], origin);

          if (element.mini || row === 0 || forceMiniBlanks[row][column] === 1) {

            let r1 = element.miniDrawTiles[0][0](x, y, side/2, {corner: element.miniDrawTiles[0][1]}, settings.divide/2);
            let r2 = element.miniDrawTiles[1][0](x + side/2, y, side/2, {corner: element.miniDrawTiles[1][1]}, settings.divide/2);
            let r3 = element.miniDrawTiles[2][0](x, y+ side/2, side/2, {corner: element.miniDrawTiles[2][1]}, settings.divide/2);
            let r4 = element.miniDrawTiles[3][0](x+ side/2, y+ side/2, side/2, {corner: element.miniDrawTiles[3][1]}, settings.divide/2);
        
            if(forceMiniBlanks[row][column] === 1) {
              if (row === 14) {
                r1 = [];
                r2 = [];
              }
              else {
              if (element.miniBlanks < 0.5) {
                r1 = [];
                r4 = [];
              }
              else {
                r2 = [];
                r3 = [];
              }
            }
            }


            paths.push(...r1, ...r2, ...r3, ...r4);
        
          }
          else {
            paths.push(...drawTile(x, y, side, element, settings.divide));
          }
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
