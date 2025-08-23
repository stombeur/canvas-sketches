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
import {hatch } from "../utils/hatch.js";
import { QR } from "./qr.js";
import { villagers } from "./villagers.js";


const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  lineWidth: 0.5,
};
let postcardrows = 2;
let postcardcolumns = 1;
let noiseFactor = 0.8;

// grid settings
let margin = 10;
let columns = 5;
let rows = 5;

let paths1 = [];
let paths2 = [];

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

    paths1 = [];
    paths2 = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let grid = card.grid;
      let center = card.center;

      let vw = 30;
      let vi = 3;
      let vj = 1;
      let offsetleft = card.left + (card.width - (vi * vw)) / 2;
      let vtemp = new villagers(card.center, vw);
      let vh = vtemp.height;
      let offsettop = card.top + (card.height - (vj * vh)) / 2;

      let qrcodew = 13;

      for (let i = 0; i < vi; i++) {
        for (let j = 0; j < vj; j++) {
          let vv = new villagers([offsetleft + i*vw, offsettop + j*vh] , vw)
          paths1.push(vv.draw())

          if (i === vi-1 && j === vj-1) {
            let qrcodem = (vw/2 - qrcodew) / 2;
            let qrcodeloc = [offsetleft + i*vw + vw/2 + qrcodem, offsettop + vh - qrcodew - qrcodem];
        
            let q = new QR("https://katamari.be/"+card.seed, 64);
            paths2.push(...q.toLines(qrcodeloc, qrcodew, 0.5))
          }
        }
        
      }
      // paths1.push(v.topTriangleLines())
      // paths1.push(v.leftChevronLines())
 
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let paths3 = postcards.drawCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [paths1, paths2, paths3];
    let groupnames = ['1 design', '2 qrcodes', '3 cutlines'];
    let groupoptions = [
      {lineWidth: 0.1},
      {lineWidth: 0.5},
      {lineWidth: 0.1}
    ]

    return renderGroupsWithText(groups, text1, {
      context, width, height, units: settings.units,groupoptions, groupnames, lineWidth: settings.lineWidth, optimize : {
        sort: true,
        merge: true,
        removeDuplicates: true,
        removeCollinear: true
      }
    });
  };
};

canvasSketch(sketch, settings);