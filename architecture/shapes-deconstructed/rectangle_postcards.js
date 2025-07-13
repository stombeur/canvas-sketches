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
import { DoubleCross, DoubleCrossBorder, RectangularBorder } from '../shape.js';

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



const drawShape = (coords, width, height, card) => {   
    let result = [];
    let center = [coords[0]+width/2, coords[1]+ height/2];
    let w = width/2;
    let h = height/2;

    //let sc = new DoubleCross(center, w, height/1.5, width / 12); 
    //let sc_border = new RectangularBorder(center, width, height, width/10, width/90);
    let sc = boundingbox.fromWH(center, width*2/5, height*3/5);

    // sc_border.toLines().forEach(l => {
    //     result.push(createLinePath(l));
    //    })

    // hatch.inside(sc_border.points).forEach(l => {
    //     //result.push(createLinePath(l));
    // })


    
    // let borderhatchregions = sc_border.regions;
    // for (let i = 0; i < borderhatchregions.length; i++) {
    //     const region = borderhatchregions[i];
    //     const otherRegions = borderhatchregions.slice();
    //     otherRegions.splice(i,1);
        
    //     hatch.inside(region, 30, 10, otherRegions)?.forEach(l => {
    //       //result.push(createLinePath(l));
    //     //   new polyline(l).toDottedLines().forEach(dl => {
    //     //     result.push(createLinePath(dl));
    //     //    })
    //     });
    //   }
   
    
    // sc.toLines().forEach(l => {
    //  //result.push(createLinePath(l));
    // })

    let bb =  card.lines_bb; //boundingbox.fromWH(center, width*9.5/10, height*9.5/10);

    let lines = card.lines;//Array.from(Array(nroflines)).map(x => randomLine(bb_zero, bb.right-bb.left, bb.bottom-bb.top));
    //let spreads = [width/75, width/75, width/75, width/75, width/75, width/50, width/50, width/30];

    let sc_clip = sc.toClipRegion();
    let sc_clip_split = sc_clip;
    lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l.line, card.lines_bb, l.spread);
    });

    sc_clip_split.toLines().forEach(l => {
        result.push(createLinePath(l));
    });

    
    let hatchregions = sc.toClipRegion().move([3,3]).subtract(sc_clip_split);

    //let regionPolylines = hatchregions.regions.map(r => new polyline(r));
    
    // regionPolylines.forEach(rp => {
    //   hatchregions.regions.forEach((r, i) => {
    //     let {overlaps, isinside} = rp.overlapsWith(r);
    //     console.log('region is inside other region', i, isinside, overlaps, r);
    //   });
    // });

    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 1, otherRegions)?.forEach(l => {
        result.push(createLinePath(l));
      });
    }

    // lines.forEach(l => {
    //   new polyline(l).toDottedLines().forEach(dl => {
    //    result.push(createLinePath(dl));
    //   })
    // })

    // let otherregions = [];
    // otherregions.push(...sc_clip_split.regions);
    // otherregions.push(...hatchregions.regions);

    // let bbdot = boundingbox.fromWH(center, width - width/10, height - height/10);
    // hatch.inside(bbdot.points, 120, 4, otherregions).forEach(l => {
    //     // result.push(createLinePath(l));
    //       new polyline(l).toDottedLines().forEach(dl => {
    //         result.push(createLinePath(dl));
    //        })
    // })

   

    return result;
}

const sketch = ({ width, height }) => {
    let nroflines = 25;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/75, card.width/75, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(center, card.width*9.5/10, card.height*9.5/10);
        card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
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