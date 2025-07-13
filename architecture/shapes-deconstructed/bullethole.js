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
import { DoubleCross, DoubleCrossBorder, RectangularBorder } from '../shape';

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



const drawShape = (width, height, card, pathsNormal, pathsThin) => {   
    let rect_height = height*3/20;
    let offset = width/120;
    let rect_width = width*3.5/5;

    let p_center = new point(... card.center);
    let rect0 = new polyline(boundingbox.fromWH(p_center.copy(-offset, -rect_height*2.5 + 10), rect_width, rect_height).points).rotate(p_center, -3);
    let rect1 = new polyline(boundingbox.fromWH(p_center.copy(-offset, -rect_height*1.5 + 5), rect_width, rect_height).points).rotate(p_center, 3);
    let rect2 = new polyline(boundingbox.fromWH(p_center.copy(offset, -rect_height*0.5 ), rect_width, rect_height).points).rotate(p_center, -3);
    let rect3 = new polyline(boundingbox.fromWH(p_center.copy(-offset, rect_height*0.5 -5 ), rect_width, rect_height).points).rotate(p_center, 3);
    let rect4 = new polyline(boundingbox.fromWH(p_center.copy(offset, rect_height*1.5 -10), rect_width, rect_height).points).rotate(p_center, -3);
    let rect5 = new polyline(boundingbox.fromWH(p_center.copy(offset, rect_height*2.5 -15), rect_width, rect_height).points).rotate(p_center, 3);

    let sc_clip = rect0.toClipRegion()
                  .add(rect1.toClipRegion())
                  .add(rect2.toClipRegion())
                  .add(rect3.toClipRegion())
                  .add(rect4.toClipRegion())
                  .add(rect5.toClipRegion());

    let original = sc_clip.deepCopy();


    let sc_clip_split = sc_clip;

    let bulletholecenter = card.center;
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
       //first split, we use the holes
       if (i === 1) {
        sc_clip_split = sc_clip_split.subtract(new clipregion(bulletholeOutside));
        sc_clip_split.addRegion(bulletholeInside);
       }
    }

    card.lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l.line, card.lines_bb, l.spread);
    });

    // clip everything outside the page (but take 1pct for postcards)
    sc_clip_split = boundingbox.fromWH(p_center, width*0.99, height*0.99)
    .toClipRegion()
    .intersect(sc_clip_split)

    sc_clip_split.toLines().forEach(l => {
    pathsThin.push(createLinePath(l));
    });

    
    let hatchregions = original.move([3,3]).subtract(sc_clip_split);
    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 0.6, otherRegions)?.forEach(l => {
        pathsNormal.push(createLinePath(l));
      });
    }
}

const sketch = ({ width, height }) => {
    let nroflines = 12;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/100,card.width/150,card.width/100,card.width/150,card.width/100,card.width/150,card.width/100,card.width/150];//[card.width/75, card.width/74, card.width/75, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];

        card.center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(card.center, card.width*1.2, card.height*1.2);
        card.lines = Array.from(Array(nroflines)).map(x => { return {
          line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), 
          spread: random.pick(spreads)
        }
      });
      let nrofsides = random.pick([8,9,10,11]);
      let nroflines_ = card.lines.length/0.8;
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
        let card = cards.find(c => c.index === opts.index);
        drawShape(w, h, card, paths1, paths2);
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    //postcards.drawSingle(draw, width, height);

    // return renderPaths(paths, {
    //   context, width, height, units
    // });
    return renderGroups([paths1, paths2], {
      context, width, height, units, groupnames: ['normal', 'thin']
    });
  };
};

canvasSketch(sketch, settings);