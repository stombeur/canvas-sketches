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
import { hatch } from '../../utils/hatch.js';
import { DoubleCross, DoubleCross2, DoubleCrossBorder, RectangularBorder } from '../shape.js';
import { insetPolygon } from '../../utils/polygon.js';
import { clipregion } from '../../utils/clipregion.js';

const seed = random.getRandomSeed();//set seed here

random.setSeed(seed);
console.log('seed: ', random.getSeed());

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



const drawShape = (coords, width, height, card) => {   
    let result = [];

    let center = [coords[0]+width/2, coords[1]+height/2];
    let sc = new DoubleCross2(center, width * 0.6, width * 0.5, height * 0.55, width / 7).toClipRegion(); 
    // let ll = sc.toLines();
    // ll.forEach(l => {
    //   result.push(createLinePath(l));
    // })

    let sc_clip_inset = sc;

    card.lines.forEach(l => {
      sc_clip_inset = sc_clip_inset.splitNoJoin(l.line, card.lines_bb);
    });
    // sc_clip_inset.toLines().forEach(l => {
    //     result.push(createLinePath(l));
    // });

    let shapes = sc_clip_inset.regions;
    let sc_clip_inset__ = new clipregion();
    shapes.forEach(shape => {
      let insetshape = insetPolygon(shape.map(p => { return {x: p[0], y: p[1]}}), 0.1);
      insetshape = insetshape.map(p => [p.x, p.y]);
      //console.log(shape, d, insetshape);
      new polyline(insetshape).toLines().forEach(l => {
        result.push(createLinePath(l));
      });
      sc_clip_inset__.addRegion(insetshape);
    });
    

    sc_clip_inset__.toLines().forEach(l => {
        result.push(createLinePath(l));
    });

    let hatchregions = sc.subtract(sc_clip_inset__);

    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 0.8, otherRegions)?.forEach(l => {
        result.push(createLinePath(l));
      });
    }

    return result;
}

const sketch = ({ width, height }) => {
    let nroflines = 49;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/75, card.width/75, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(center, card.width*9.5/10, card.height*9.5/10);
        card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
        card.spreads = Array.from(Array(nroflines)).map(i => random.value()*card.width/20);
      })

    
  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let localOrigin = postcards.reorigin([0, 0], origin);

        let card = cards.find(c => c.index === opts.index);

        paths.push(... drawShape(localOrigin, w, h, card));
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);