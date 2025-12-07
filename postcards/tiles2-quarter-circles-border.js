const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath, renderGroupsWithText } = require('canvas-sketch-util/penplot');
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
const { drawTile:drawSideSemiCircle } = require('../tiles/tiletype-side-semicircle.js');
const { drawTile:drawCorner } = require('../tiles/tiletype-side-corner.js');
  


random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`)

const settings = {
  suffix: `.seed-${random.getSeed()}`,
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  divide: 7,
  countX: 5,
  tiles: [[draw2QCTile, 13],[drawLineTile, 4], [draw4QCTile, 0], [drawQCLTile1, 0], [drawQCLTile2, 0], [drawQCLTile3, 7]],
};

const postcardGrid = { columns: 1, rows: 1 };
let pathsPerCard = [];

const createGrid = (columns, rows, w, h, marginX) => {
  let o = [];
  let side = (w - (marginX*2))/columns;
  let marginY = 0 //(h - (side*rows))/2;
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

  for (let r = 1; r < rows-1; r++) {
    let left = o[r][0];
    let right = o[r][columns-1];

    left.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 1, divide, padding, r !== 1 && r !== rows-2);
    right.drawTile = (x, y, side, rnd, divide, padding) => drawSideSemiCircle(x, y, side, 3, divide, padding, r !== 1 && r !== rows-2, r === rows-2);
  }

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

  return o//;{seed: random.getSeed(), grid: o};
}

const sketch = ({ width, height }) => {
  
  const cardWidth = width / postcardGrid.columns;
  const cardHeight = height / postcardGrid.rows;
  //tile grid
  const countX = settings.countX;
  const countY = Math.floor(cardHeight / Math.floor(cardWidth/countX));
  const margin = 0; //cardWidth * 0.013;

  let seeds = undefined;//{"seedvalues":["267755"]}
  let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardGrid.columns, postcardGrid.rows, seeds);
     
  //console.log(cards)
  cards.forEach(card => {
      random.setSeed(card.seed);
      card.grid = createGrid(countX, countY, cardWidth, cardHeight, margin)
      card.margin = margin
    })

  return ({ context, width, height, units }) => {
    pathsPerCard = [];
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let paths = [];

      let grid = card.grid;

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

      pathsPerCard.push(paths)
    }

    

    postcards.drawColumnsRowsPortrait(draw, width, height, postcardGrid.columns, postcardGrid.rows);
     let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardGrid.rows, postcardGrid.columns);
      let text1 = postcards.addSeedText(width, height, postcardGrid.columns, postcardGrid.rows, {seeds: cards.map(c => c.seed)})
  
      let groups = [ ...pathsPerCard];
  
      let groupnames = [];
      cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
      let j = groupnames.length;
      pathsPerCard.forEach((p, i) => groupnames.push(`${i+j} card`))
      j = groupnames.length;

      return renderGroupsWithText(groups, text1, {
        context, width, height, units, groupnames, lineWidth: 0.1, optimize : {
          sort: true,
          merge: true,
          removeDuplicates: true,
          removeCollinear: true
        }
      });
  };
};

canvasSketch(sketch, settings);
