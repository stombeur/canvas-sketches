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
import { DoubleCross, DoubleCross2, DoubleCrossBorder, EquilateralTriangle, RectangularBorder, SymmetricCross } from '../shape.js';
import { insetPolygon } from '../../utils/polygon.js';
import { clipregion } from '../../utils/clipregion.js';

// const seed = random.getRandomSeed();//set seed here

// random.setSeed(seed);
// console.log('seed: ', random.getSeed());

const settings = {
  suffix: '',
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',

};

const mysettings = {
  //seedvalues:["281708"],
  postcardrows: 1,
  postcardcolumns: 1,
  nrofsplitlines: 0,
  spreaddivider: 37,
  inset: false,
  insetamount: 0.2,
  //drawintact: true,
}

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
    //let sc = new DoubleCross2(center, width * 0.6, width * 0.5, height * 0.55, width / 7).toClipRegion(); 
    //let sc =  SymmetricCross.fromCenter(center, width * 0.7).toClipRegion(); 
    let sc = new EquilateralTriangle(center, width * 0.6).toClipRegion();
    let sc_clip_split = sc;

    if (card.lines.length === 0) {
      //sc_clip_split = sc_clip_split.translatePct(-2, width);
      sc_clip_split = sc_clip_split.translate(-5,-3)
    } else {
      if (mysettings.inset) {
        card.lines.forEach(l => {
          sc_clip_split = sc_clip_split.splitNoJoin(l.line, card.lines_bb);
        });
        let shapes = sc_clip_split.regions;
        let sc_clip_inset = new clipregion();
        shapes.forEach(shape => {
          let insetshape = insetPolygon(shape.map(p => { return {x: p[0], y: p[1]}}), mysettings.insetamount);
          insetshape = insetshape.map(p => [p.x, p.y]);
          sc_clip_inset.addRegion(insetshape);
        });
        sc_clip_split = sc_clip_inset;
      } else {
        for (let i = 0; i < card.lines.length; i++) {
          let tempsplit = sc_clip_split.split(card.lines[i].line, card.lines_bb, card.spreads[i]);
          //check if tempsplit goes outside of the card, if it does, ignore the split
          let outside = false;
          tempsplit.regions.forEach(r => {
            r.forEach(p => {
              if (p[0] < card.lines_bb.left || p[0] > card.lines_bb.right || p[1] < card.lines_bb.top || p[1] > card.lines_bb.bottom) {
                outside = true;
              }
            })
          });
          if (!outside) { 
          sc_clip_split = tempsplit;
        } else {

          console.log("iteration out of bounds: ", i);
          break;
        }
      }
      }
    }

    let hatchregions = sc.subtract(sc_clip_split);

    if (mysettings.drawintact) {
        //sc = sc.translatePct(-2, width);
        sc = sc.shrink(3);
        sc.toLines().forEach(l => {
          //result.push(createLinePath(l));
        });
        sc_clip_split = sc_clip_split.subtract(sc);
        //hatchregions = hatchregions.subtract(sc);
    }
    
    sc_clip_split.toLines().forEach(l => {
        result.push(createLinePath(l));
    });
   

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
    let nroflines = mysettings.nrofsplitlines;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, mysettings.postcardcolumns, mysettings.postcardrows, {"seedvalues":mysettings.seedvalues});
    
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];

        random.setSeed(cards[i].seed);
        let spreads = [card.width/75, card.width/75, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];
        card.center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(card.center, card.width*9.5/10, card.height*9.5/10);
        card.spreads = Array.from(Array(nroflines)).map(i => random.value()*card.width/mysettings.spreaddivider);
        card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
    } 

  for (let i = 0; i < cards.length; i++) {
    if (i>0) { settings.suffix += '-' }
    settings.suffix += `${cards[i].seed}`;
    console.log(settings.suffix);
  }
    
  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let localOrigin = postcards.reorigin([0, 0], origin);

        let card = cards.find(c => c.index === opts.index);

        paths.push(... drawShape(localOrigin, w, h, card));
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, mysettings.postcardcolumns, mysettings.postcardrows);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);