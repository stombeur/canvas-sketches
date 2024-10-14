const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../../utils/arc.js');
const { createLinePath } = require('../../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../../utils/poly.js');
const postcards = require('../../utils/postcards.js');
const rnd2 = require('../../utils/random.js');
const { point } = require('../../utils/point.js');
const { polyline } = require('../../utils/polyline.js');
import { boundingBox } from '@lnjs/core/lib/path';
import { boundingbox } from '../../utils/boundingbox.js';
import { clipregion } from '../../utils/clipregion.js';
import { hatch } from '../../utils/hatch.js';
import { ChristmasTree } from '../shape.js';

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

const drawShape = (coords, width, height, card, thinLines, thickLines) => {   
    let center = [coords[0]+width/2, coords[1]+ height/2];
    let w = width/1.5;
    let h = height/1.5;
    //let p_center = new point(... card.center);

    let sc = new ChristmasTree(center, w, h);
    let sc_clip = sc.toClipRegion();

    let pad = w;
    let bb = sc.bb(pad);
   // let bb_zero = [bb.left, bb.top];

    let lines = card.lines;//Array.from(Array(20)).map(x => randomLine(bb_zero, bb.right-bb.left, bb.bottom-bb.top));
    console.log(lines)

    let sc_clip_split = sc_clip.move([0,0]);
    lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l.line, card.lines_bb, l.spread);
    });


    
    let hatchregions = sc_clip.move([9,9]).subtract(sc_clip_split);

    let finalbb = boundingbox.from(sc_clip_split.toPoints()).union(hatchregions.bb());
    
    let delta = [center[0]-finalbb.center[0], center[1]-finalbb.center[1]];
    sc_clip_split.move(delta);
    hatchregions.move(delta);


    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 1.2, otherRegions)?.forEach(l => {
        thinLines.push(createLinePath(l));
      });
    }

   

  console.log(sc, sc_clip);

  sc_clip_split.toLines().map(l => thickLines.push(createLinePath(l)));
}

const sketch = ({ width, height }) => {
    let nroflines = 18; 
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/20, card.width/30, card.width/20, card.width/75, card.width/75, card.width/50, card.width/50, card.width/30];
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.center = center;
        card.lines_bb = boundingbox.fromWH(card.center, card.width*2, card.height*2);
        card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
        // let nrofsides = random.pick([8,9,10,11]);
        // let nroflines_ = Math.floor(nroflines/0.8);
        // card.hole = {
        //   nrofsides,
        //   nroflines: nroflines_,
        //   angles: Array.from(Array(nroflines_)).map(i => random.value()*60),
        //   spreads:  Array.from(Array(nroflines_)).map(i => random.value()*card.width/20),
        // }
      })

    
  return ({ context, width, height, units }) => {
    paths1 = [];
    paths2 = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let localOrigin = postcards.reorigin([0, 0], origin);

        let card = cards.find(c => c.index === opts.index);
        drawShape(localOrigin, w, h, card, paths1, paths2);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    let paths3 = postcards.drawCutlines(width, height, settings.postcardrows, settings.postcardcolumns);


    return renderGroups([paths1, paths2, paths3], {
      context, width, height, units, groupnames: ['thin', 'normal', 'cutlines']
    });
  };
};

canvasSketch(sketch, settings);