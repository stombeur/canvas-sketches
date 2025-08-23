const canvasSketch = require('canvas-sketch');
const { renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');
const { arc } = require('../utils/arc.js');
const { createLinePath, createCirclePath, createPolylinePath } = require('../utils/paths.js');
const postcards = require('../utils/postcards.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
const { square } = require('./square.js');
const { hexagon } = require('./hexagon.js');
import { OutlineSphere } from "@lnjs/core";
import { create2dClassicGrid, create2dLerpedGrid } from "../utils/grid.js";
import {hatch } from "../utils/hatch";


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
let noiseFactor = 0.8;
// grid settings
let margin = 7;//Math.max (30/(Math.max(postcardcolumns, postcardrows)), 10);
let columns = 5;
let rows = 21;

let pathsPerCard = [];

const createGrid = (columns, rows, card, noiseFactor = 1) => {
  const widthFactor = Math.cos(30 * Math.PI / 180)
  const countX = columns;
  const elementWidth = (card.width-2*card.margin) / countX;
  const elementHeight = elementWidth / widthFactor;

  const countY = rows;
  
  const offsetLeft = card.left + (card.width - elementWidth*(countX-0.5))/2
  const offsetTop = card.top + card.margin// card.top + (card.height - elementHeight*(countY/1.5))/2

  const grid = [];
  for (let x = 0; x < countX; x++) {
    const points = [];
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      let posX = offsetLeft + (x * elementWidth)
      if (y%2 === 1) posX = posX + elementWidth/2
      let posY = offsetTop + (y * elementHeight) - y*elementHeight/4
      const position = [ posX, posY ];
      const noise = random.noise2D(u,v) * noiseFactor;
      points.push({
        position,
        noise,
      });
    }
    grid.push(points);
  }
  return grid;
};


const sketch = ({ width, height }) => {
    // do random stuff here

    let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardcolumns, postcardrows);
   
    cards.forEach(card => {
        random.setSeed(card.seed);
        card.margin = margin
        card.grid = createGrid(columns, rows, card, noiseFactor)
      })

      
    
  return ({ context, width, height, units }) => {
    // do drawing stuff here
    pathsPerCard = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let cardPaths = [];
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let grid = card.grid
      const elementWidth = (card.width-2*margin) / columns;
      const elementHeight = elementWidth / Math.cos(30 * Math.PI / 180);

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const row = col[r];
          
          let x = row.position[0];
          let y = row.position[1];

          let h = new hexagon([x,y], elementHeight/2);
      
          h.getOutsideLines(r, c, rows, columns).forEach(l => cardPaths.push(createLinePath(l)));
          h.hatch3dFaces(5).forEach(l => cardPaths.push(createLinePath(l)));
        }
      }
      pathsPerCard.push(cardPaths);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...pathsPerCard];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`cutlines ${i}`))
    pathsPerCard.forEach((p, i) => groupnames.push(`card ${i}`))

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