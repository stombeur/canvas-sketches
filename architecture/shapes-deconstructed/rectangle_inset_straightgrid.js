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
import { insetPolygon } from '../../utils/polygon.js';
import { clipregion } from '../../utils/clipregion.js';

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
    let padleft = 13.5;
    let padtop = 18.5;
    let totalwidth = 143;
    let columngap = 4;
    let columnheight = 209;

    // total w = 133 gap = 4
    // h = 175

    //let sc = new DoubleCross(center, w, height/1.5, width / 12); 
    //let sc_border = new RectangularBorder(center, width, height, width/10, width/90);
    let sc1 = boundingbox.fromTopleft([padleft,padtop], (totalwidth-columngap)/2, columnheight);
    let sc2 = boundingbox.fromTopleft([padleft+((totalwidth-columngap)/2+columngap),padtop], (totalwidth-columngap)/2, columnheight);

    let sc3 = boundingbox.fromTopleft([padleft,padtop+27], (totalwidth-columngap)/2, 60);
    let sc4 = boundingbox.fromTopleft([padleft+((totalwidth-columngap)/2+columngap),padtop+63], (totalwidth-columngap)/2, 100);


    let sc_left = new clipregion();
    sc_left.addRegion(sc1.points);

    let sc_right = new clipregion();
    sc_right.addRegion(sc2.points);

    let sc = new clipregion();
    sc.addRegion(sc1.points);
    sc.addRegion(sc2.points);

    let sc_sub = new clipregion();
    sc_sub.addRegion(sc3.points);
    sc_sub.addRegion(sc4.points);

    sc_left = sc_left.subtract(sc_sub);
    sc_right = sc_right.subtract(sc_sub);
    sc = sc.subtract(sc_sub);

    let bb =  card.lines_bb; //boundingbox.fromWH(center, width*9.5/10, height*9.5/10);

    card.linesx.forEach(l => {
      sc_left = sc_left.splitNoJoin(l.line, card.lines_bb);
      sc_right = sc_right.splitNoJoin(l.line, card.lines_bb);
    });

    card.linesy1.forEach(l => {
      sc_left = sc_left.splitNoJoin(l.line, card.lines_bb);
    });
    
    card.linesy2.forEach(l => {
      sc_right = sc_right.splitNoJoin(l.line, card.lines_bb);
    });

    let sc_clip_split = new clipregion();
    sc_left.regions.forEach(r => sc_clip_split.addRegion(r));
    sc_right.regions.forEach(r => sc_clip_split.addRegion(r));

    let shapes = sc_clip_split.regions;
    let sc_clip_inset = new clipregion();
    shapes.forEach(shape => {
      let insetshape = insetPolygon(shape.map(p => { return {x: p[0], y: p[1]}}), 0.1);
      insetshape = insetshape.map(p => [p.x, p.y]);
      //console.log(shape, d, insetshape);
      new polyline(insetshape).toLines().forEach(l => {
        result.push(createLinePath(l));
      });
      sc_clip_inset.addRegion(insetshape);
    });
    

    // let sc_sub = new clipregion();
    // sc_sub.addRegion(sc3.points);
    // sc_sub.addRegion(sc4.points);

    // sc_clip_inset = sc_clip_inset.subtract(sc_sub);

    // sc_clip_inset.toLines().forEach(l => {
    //     result.push(createLinePath(l));
    // });

    
    let hatchregions = sc.subtract(sc_clip_inset);
    //hatchregions = hatchregions.subtract(sc_sub);

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
      
      hatch.inside(region, 30, 0.8, otherRegions)?.forEach(l => {
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

    // card.lines.forEach(l => {
    //    result.push(createLinePath(l.line));
    //   });
   

    return result;
}

const sketch = ({ width, height }) => {
    let nroflines = 51;
    
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let spreads = [card.width/75, card.width/75, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.lines_bb = boundingbox.fromWH(center, card.width*9.5/10, card.height*9.5/10);
        // // divide the lines over height and width proportionally
        // let nroflines_width = Math.round(nroflines * (card.width / (card.width + card.height)));
        // let nroflines_height = nroflines - nroflines_width;
        // card.lines = [];
        // for (let i = 0; i < nroflines_width - 1; i++) {
        //   let x = (i+1) * (card.lines_bb.right - card.lines_bb.left) / nroflines_width + card.lines_bb.left;
        //   card.lines.push({line: [[x, 0], [x, card.height]], spread: random.pick(spreads)});
        // }        
        // for (let i = 0; i < nroflines_height - 1; i++) {
        //   let y = (i+1) * (card.lines_bb.bottom - card.lines_bb.top) / nroflines_height + card.lines_bb.top;
        //   card.lines.push({line: [[0, y], [card.width, y]], spread: random.pick(spreads)});
        // }
        card.linesx = [];
        
        card.linesy1 = [];
        card.linesy2 = [];
        let nroflines_width = Math.round(nroflines * (card.width / (card.width + card.height)));
        let nroflines_height = nroflines - nroflines_width;
        // divide width in nroflines_width segments of random size and same for height
        let xSegments = [];
        let ySegments = [];
        let ySegments2 = [];
        let currentX = card.origin[0];
        for (let i = 0; i < nroflines_width - 1; i++) {
          let segmentSize = (card.width - currentX) / (nroflines_width - i) * random.value() * 2;
          xSegments.push(currentX + segmentSize);
          currentX += segmentSize;
        }
        let currentY = card.origin[1];
        for (let i = 0; i < nroflines_height - 1; i++) {
          let segmentSize = (card.height - currentY) / (nroflines_height - i) * random.value() * 2;
          ySegments.push(currentY + segmentSize);
          currentY += segmentSize;
        }
        currentY = card.origin[1];
        for (let i = 0; i < nroflines_height - 1; i++) {
          let segmentSize = (card.height - currentY) / (nroflines_height - i) * random.value() * 2;
          ySegments2.push(currentY + segmentSize);
          currentY += segmentSize;
        }
        xSegments.forEach(x => {
          card.linesx.push({line: [[x, card.origin[1]], [x, card.origin[1] + card.height]], spread: random.pick(spreads)});
        });
        ySegments.forEach(y => {
          card.linesy1.push({line: [[card.origin[0], y], [card.origin[0] + card.width/2, y]], spread: random.pick(spreads)});
        });
        ySegments2.forEach(y => {
          card.linesy2.push({line: [[card.origin[0] + card.width/2, y], [card.origin[0] + card.width, y]], spread: random.pick(spreads)});
        });

        for (let i = 0; i < 7; i++) {
          card.linesx.push({line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)});
        }
        //card.lines = Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
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