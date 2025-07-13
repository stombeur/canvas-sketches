const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createLinePath } = require('../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards.js');
const rnd2 = require('../utils/random.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
import { boundingBox } from '@lnjs/core/lib/path';
import { boundingbox } from '../utils/boundingbox.js';
import { clipregion } from '../utils/clipregion.js';
import { hatch } from '../utils/hatch.js';
import { DoubleCross, DoubleCrossBorder, FloodfillShape, HH, ITPLogo, RectangularBorder, TurtleShape } from './shape.js';
const snake = require('../utils/snakefill.js');

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  postcardrows: 1,
  postcardcolumns: 1,
};

let paths1 = [];
let paths2 = [];

const randomHoles = (center, radius, card) => {

  let nrofsides = card.hole.nrofsides;
  let angle = 360 / nrofsides;
  let nextBig = new point(...center).copy(radius, 0);
  let nextSmall = new point(...center).copy(radius*7/10, 0);

  let resultBig = [];
  let resultSmall = [];
  resultBig.push(nextBig);
  resultSmall.push(nextSmall);

  for (let i=1; i < nrofsides; i++) {
    nextBig = nextBig.rotate(center, angle);
    nextSmall = nextSmall.rotate(center, angle);
    resultBig.push(nextBig);
  resultSmall.push(nextSmall);

  }
  
  return [resultBig, resultSmall];
}

const randomLine = (origin, width, height) => {
  let sides = [1,2,3,4];
  let side1 = random.pick(sides);
  let side2 = random.pick(sides);
  while (side2 === side1) {
    side2 = random.pick(sides);
  }

  const randomPoint = (side) => {
    let [x,y] = [origin[0], origin[1]];

    /*
        2
      1   3
        4
    */

    switch(side) {
      case 1:
        y = origin[1] + random.value() * height;
        break;
      case 2:
        x = origin[0] + random.value() * width;
        break;
      case 3:
        x = origin[0] + width;
        y = origin[1] + random.value() * height;
        break;
      case 4:
        y = origin[1] + height;
        x = origin[0] + random.value() * width;
    }
    return [x,y];
  }

  let p1 = randomPoint(side1);
  let p2 = randomPoint(side2);

  return [p1,p2];
}


const drawShape = (coords, width, height, card, thinLines, thickLines, shapegrid, split = false) => {   
    let center = [coords[0]+width/2, coords[1]+ height/2];
    let p_center = new point(... center);

    let elementSize = Math.min(width, height) / Math.max(card.rows, card.columns);

    let sc = new FloodfillShape(shapegrid, elementSize, elementSize, center);
    let sc_clip = sc.toClipRegion().copy([0,0]);
    let sc_clip_split = sc_clip;

    if (split) {
      let bulletholecenter = card.center; //[card.center[0]+width/2, card.center[1]];

      let bullethole = randomHoles(bulletholecenter, width/20, card);
      let bulletholeOutside = bullethole[0];
      let bulletholeInside = bullethole[1];
      let linehole = [[-width,bulletholecenter[1]],[width*2, bulletholecenter[1]]];

      for (let i = 1; i < card.hole.nroflines; i++) {
        let a = i * card.hole.angles[i];
        let l = linehole.map(p => {
          return new point(...p).rotate(bulletholecenter, a);
         });
         sc_clip_split = sc_clip_split.split(l, card.lines_bb, card.hole.spreads[i]);
         if (i === 1) {
          sc_clip_split = sc_clip_split.subtract(new clipregion(bulletholeOutside));
          //sc_clip_split.addRegion(bulletholeInside);
         }
      }

    let lines = card.lines;

    
    lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l.line, card.lines_bb, l.spread);
    });

    sc_clip_split = boundingbox.fromWH(p_center, width*2, height)
                                .toClipRegion()
                                .intersect(sc_clip_split)

    sc_clip_split.toLines().forEach(l => {
        thickLines.push(createLinePath(l));
    });
  }

  sc_clip_split.toLines().forEach(l => {
    thickLines.push(createLinePath(l));
  });

  let hatchregions = sc.toClipRegion().copy([2,2]).subtract(sc_clip_split);

  for (let i = 0; i < hatchregions.regions.length; i++) {
    const region = hatchregions.regions[i];
    const otherRegions = hatchregions.regions.slice();
    otherRegions.splice(i,1);
    
    hatch.inside(region, 30, 0.6, otherRegions)?.forEach(l => {
      thinLines.push(createLinePath(l));
    });
  }
}

const sketch = ({ width, height }) => {
    let nroflines = 10; 
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [2,2,3,2,4,2,5,2];
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.center = center;
        card.lines_bb = boundingbox.fromWH(card.center, card.width*1.5, card.height*1.5);
        card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
        let nrofsides = random.pick([8,9,10,11]);
        let nroflines_ = Math.floor(nroflines/0.8);
        card.hole = {
          nrofsides,
          nroflines: nroflines_,
          angles: Array.from(Array(nroflines_)).map(i => random.value()*60),
          spreads:  Array.from(Array(nroflines_)).map(i => random.value()*card.width/20),
        }
        card.rows = 11;
        card.columns = 8;
        card.grid = snake.snakefill(card.rows, card.columns, {iterations: 7 });
      })

      
    
  return ({ context, width, height, units }) => {
    paths1 = [];
    paths2 = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let card = cards.find(c => c.index === opts.index);

      let shapegrid = [];
      for (let r = 0; r < card.rows; r++) {
          let row = [];
          for (let c = 0; c < card.columns; c++) {
              row.push(card.grid[r][c]);
          }
          shapegrid.push(row);
      }

      // draw single non-split
      drawShape(origin, w, h, card, paths1, paths2, shapegrid);

      // // draw original left
      // let localOrigin = postcards.reorigin([0, 0], origin);
      // drawShape(localOrigin, w/2, h, card, paths1, paths2, shapegrid);

      // // draw split rigth
      // let localOrigin2 = postcards.reorigin([w/2, 0], origin);
      // drawShape(localOrigin2, w/2, h, card, paths1, paths2, shapegrid, true);     
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    let paths3 = postcards.drawCutlines(width, height, settings.postcardrows, settings.postcardcolumns);


    return renderGroups([paths1, paths2, paths3], {
      context, width, height, units, groupnames: ['thin', 'normal', 'cutlines']
    });
  };
};

canvasSketch(sketch, settings);