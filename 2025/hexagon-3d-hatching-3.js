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
import {hatch } from "../utils/hatch.js";


const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};
let postcardrows = 4;
let postcardcolumns = 2;
let lineWidth = 0.1;
let noiseFactor = 0.8;
// grid settings
let margin = 25;//Math.max (30/(Math.max(postcardcolumns, postcardrows)), 10);
let columns = 2;
let rows = 2;

let pathsPerCard = [];
let pathsPerCard2 = [];

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
      if (x === 1) {
        break;
      }
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
    pathsPerCard2 = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let cardPaths = [];
      let cardPaths2 = [];
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
      
          h.getOutsideLines(r, c, rows, columns).forEach(l => cardPaths2.push(createLinePath(l)));
          if (c == 1 && r == 0) {
            cardPaths2.push(createLinePath([h.points[2], h.points[3]]));
          }
          if (c == 0 && r == 1) {
            cardPaths2.push(createLinePath([h.points[1], h.points[2]]));
          }
         
          h.hatch3dFaces(13).forEach(l => cardPaths.push(createLinePath(l)));
        }
      }
      pathsPerCard.push(cardPaths);
      pathsPerCard2.push(cardPaths2);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...pathsPerCard, ... pathsPerCard2];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
    let j = groupnames.length;
    pathsPerCard.forEach((p, i) => groupnames.push(`${i+j} card`))
    j = groupnames.length;
    pathsPerCard2.forEach((p, i) => groupnames.push(`${i+j} card thick`))

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