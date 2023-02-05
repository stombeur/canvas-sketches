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
import { hatch } from '../../utils/hatch';
import { DoubleCross, DoubleCrossBorder, RectangularBorder } from '../shape';

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  postcardrows: 2,
  postcardcolumns: 2,
};

let paths = [];

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



const drawShape = (width, height, card) => {   
    let result = [];

    let rect_height = height*3/25;
    let offset = width/100;

    let p_center = new point(... card.center);
    let rect0 = new polyline(boundingbox.fromWH(p_center.copy(-offset, -rect_height*2.5 + 10), width*2/5, rect_height).points).rotate(p_center, -3);
    let rect1 = new polyline(boundingbox.fromWH(p_center.copy(-offset, -rect_height*1.5 + 5), width*2/5, rect_height).points).rotate(p_center, 3);
    let rect2 = new polyline(boundingbox.fromWH(p_center.copy(offset, -rect_height*0.5 ), width*2/5, rect_height).points).rotate(p_center, -3);
    let rect3 = new polyline(boundingbox.fromWH(p_center.copy(-offset, rect_height*0.5 -5 ), width*2/5, rect_height).points).rotate(p_center, 3);
    let rect4 = new polyline(boundingbox.fromWH(p_center.copy(offset, rect_height*1.5 -10), width*2/5, rect_height).points).rotate(p_center, -3);
    let rect5 = new polyline(boundingbox.fromWH(p_center.copy(offset, rect_height*2.5 -15), width*2/5, rect_height).points).rotate(p_center, 3);

    let sc_clip = rect0.toClipRegion()
                  .add(rect1.toClipRegion())
                  .add(rect2.toClipRegion())
                  .add(rect3.toClipRegion())
                  .add(rect4.toClipRegion())
                  .add(rect5.toClipRegion());

    let original = sc_clip.deepCopy();

    let sc_clip_split = sc_clip;
    card.lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l.line, card.lines_bb, l.spread);
    });

    sc_clip_split.toLines().forEach(l => {
        result.push(createLinePath(l));
    });

    
    let hatchregions = original.move([3,3]).subtract(sc_clip_split);
    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 1, otherRegions)?.forEach(l => {
        result.push(createLinePath(l));
      });
    }

    return result;
}

const sketch = ({ width, height }) => {
    let nroflines = 35;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/75, card.width/25, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];

        card.center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(card.center, card.width*9.5/10, card.height*9.5/10);
        card.lines = Array.from(Array(nroflines)).map(x => { return {
          line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), 
          spread: random.pick(spreads)
        }
      });
    })

    
  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let card = cards.find(c => c.index === opts.index);
        paths.push(... drawShape(w, h, card));
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);