const canvasSketch = require('canvas-sketch');
const { renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');
const { arc } = require('../utils/arc.js');
const { createLinePath, createCirclePath } = require('../utils/paths.js');
const postcards = require('../utils/postcards.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
const { square } = require('./square.js');
const { cross } = require('./cross.js');

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};
let postcardrows = 2;
let postcardcolumns = 4;
let lineWidth = 0.1;
let noiseFactor = 0.4;
let diamondSpacing = 1.2;
// grid settings
let margin = 5;
let columns = 33;
let rows = 85;

let pathsPerCard = [];

let inversenoise = true;
let seeds = {"seedvalues":["795692","879736","513582","19503","977828","204266","21316","842433"]};

const createGrid = (countX, countY, noiseFactor = 1) => {
    const grid = [];
    for (let x = 0; x < countX; x++) {
      const points = [];
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
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




const sketch = ({ width, height }) => {
    // do random stuff here
    

    let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardcolumns, postcardrows, seeds);
   
    cards.forEach(card => {
        random.setSeed(card.seed);
        card.grid = createGrid(columns, rows, noiseFactor)
        card.margin = margin
      })

      
    
  return ({ context, width, height, units }) => {
    // do drawing stuff here
    console.log('start');
    pathsPerCard = [];
    
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let dist = diamondSpacing * (card.width - 2*card.margin) / columns

      let grid = card.grid
      let paths1 = [];

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const row = col[r];
          
          //const x = lerp(card.origin, width - margin, position[0]);
          const x = lerp(card.left+card.margin, card.right-card.margin, row.position[0]);
          const y = lerp(card.top+card.margin, card.bottom-card.margin, row.position[1]);
          //console.log(`col ${c} row ${r}`, row, [x,y], row.position[0]+row.position[1])

          if ((c+r)%2 === 0) { 
            //console.log(row.noise)
            let scale = 10*row.noise;
            if (seeds && inversenoise) { scale = 1/scale; }
            let s = cross.fromCenter([x,y]).scaleMinMax(scale, dist * 1.15);
            paths1.push(s.draw());
          }
        }
      }
      pathsPerCard.push(paths1);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...pathsPerCard];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
    let j = groupnames.length;
    pathsPerCard.forEach((p, i) => groupnames.push(`${i+j} card`))
    j = groupnames.length;

    return renderGroupsWithText(groups, text1, {
      context, width, height, units, groupnames, lineWidth, optimize : {
        sort: true,
        merge: true,
        removeDuplicates: true,
        removeCollinear: true
      }
    });
  };
};

canvasSketch(sketch, settings);