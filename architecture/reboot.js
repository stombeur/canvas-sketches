const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createArcPath, createLinePath } = require('../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');
const rnd2 = require('../utils/random');
const { point } = require('../utils/point');
const { polyline } = require('../utils/polyline.js');
import { hatch } from '../utils/hatch';
import { clipregion } from '../utils/clipregion';
import { boundingbox } from '../utils/boundingbox';
import { House, SymmetricCross } from './shape';

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
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

const randomLine2 = (origin, width, height) => {
  let sides = [1,2,3];
  let skips = [1,2];
  let side = random.pick(sides);
  let skip = random.pick(skips);
  
  // first point = limited to 270 -> 90

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

const drawCross = (w, coords, width, height, nroflines = 4) => {   
    let result = [];

   // let sc = new SymmetricCross(coords[0], coords[1], w, w/6);
    let sc = new House(coords[0], coords[1], w, w*3); 
   
    
    sc.toLines().forEach(l => {
     //result.push(createLinePath(l));
    })

    let pad = 10;
    let bb = sc.bb(pad);
    let sc_clip = sc.toClipRegion();
    let bb_zero = [bb.left, bb.top];

   // let bb = boundingbox.from([[5,5],[width, 5],[width-5, height-5],[5, height-5]]);

  let lines = Array.from(Array(15)).map(x => randomLine(bb_zero, w+pad*2, w*3+pad*2));
  //  let lines = [
  //   [[0,50],[width, height]],
  

  //   [[width,20],[0,height]],
  //   [[0,50],[width, height/2]],
  //   [[width, height/2],[0, height/2]],

  //   [[0, 2*height/3],[width, 0]],
  // [[width, height/1.5],[0, -30+height/4]],
  //  ];

    let sc_clip_split = sc_clip;
    lines.forEach(l => {
      sc_clip_split = sc_clip_split.split(l, bb, width/60);
    });

    sc_clip_split.toLines().forEach(l => {
        result.push(createLinePath(l));
    });

    
    let hatchregions = sc.toClipRegion().move([3,3]).subtract(sc_clip_split);

    //let hatchregions = sc_clip_split;
    let regionPolylines = hatchregions.regions.map(r => new polyline(r));
    
    regionPolylines.forEach(rp => {
      hatchregions.regions.forEach((r, i) => {
        let {overlaps, isinside} = rp.overlapsWith(r);
        console.log('region is inside other region', i, isinside, overlaps, r);
      });
    });

    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 1, otherRegions)?.forEach(l => {
        result.push(createLinePath(l));
      });
    }

    hatchregions.regions.forEach(r => {
      hatch.inside(r).forEach(l => {
        //result.push(createLinePath(l));
      });
    })

    hatchregions.toLines().forEach(l => {
      //result.push(createLinePath(l));
     });

    lines.forEach(l => {
      new polyline(l).toDottedLines().forEach(dl => {
        result.push(createLinePath(dl));
      })
    })
   

    return result;
}

const sketch = ({ width, height }) => {
  

  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let nroflines = (opts.index+1)*1;
        let localOrigin = postcards.reorigin([0, 0], origin);
        let crossOrigin = new point(...localOrigin).copy(w/4, h/10);


        paths.push(... drawCross(w/2, crossOrigin, w, h, nroflines));
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, 4, 2);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);