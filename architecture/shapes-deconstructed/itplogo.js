const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../../utils/arc.js');
const { createLinePath } = require('../../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../../utils/poly.js');
const postcards = require('../../utils/postcards');
const rnd2 = require('../../utils/random');
const { point } = require('../../utils/point');
const { polyline } = require('../../utils/polyline.js');
import { boundingBox } from '@lnjs/core/lib/path';
import { boundingbox } from '../../utils/boundingbox';
import { clipregion } from '../../utils/clipregion';
import { hatch } from '../../utils/hatch';
import { DoubleCross, DoubleCrossBorder, HH, ITPLogo, RectangularBorder } from '../shape';

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'landscape',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  postcardrows: 3,
  postcardcolumns: 6,
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



const drawShape = (coords, width, height, card, thinLines, thickLines) => {   
    let center = [coords[0]+width/2, coords[1]+ height/2];
    let w = width/2;
    let h = height/2;
    let p_center = new point(... card.center);

    let sc = new ITPLogo(center, width / 1.9); 


    let bulletholecenter = card.center;

    let bullethole = randomHoles(bulletholecenter, width/20, card);
      let bulletholeOutside = bullethole[0];
      let bulletholeInside = bullethole[1];
      let linehole = [[-width,bulletholecenter[1]],[width*2, bulletholecenter[1]]];

      let sc_clip = sc.toClipRegion();
      let sc_clip_split = sc_clip;

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

    sc_clip_split = boundingbox.fromWH(p_center, width, height)
                                .toClipRegion()
                                .intersect(sc_clip_split)

    sc_clip_split.toLines().forEach(l => {
        thickLines.push(createLinePath(l));
    });

    
    let hatchregions = sc.toClipRegion().move([3,3]).subtract(sc_clip_split);

    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 0.6, otherRegions)?.forEach(l => {
        thinLines.push(createLinePath(l));
      });
    }

   //sc.toClipRegion().toLines().map(l => paths1.push(createLinePath(l)));
}

const sketch = ({ width, height }) => {
    let nroflines = 10; 
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/75, card.width/75, card.width/75, card.width/75, card.width/75, card.width/50, card.width/50, card.width/30];
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