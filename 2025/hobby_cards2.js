const canvasSketch = require('canvas-sketch');
const { renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');
const { arc } = require('../utils/arc.js');
const { createLinePath, createCirclePath, createCubicBezierPath } = require('../utils/paths.js');
const postcards = require('../utils/postcards.js');
const { cross } = require('./cross.js');
const { hatch } = require('../utils/hatch.js');
const { hobby, hilbertSort, hobbyClosed } = require('../utils/hobby.js');

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};
let postcardrows = 1;
let postcardcolumns = 1;
let lineWidth = 0.2;
let noiseFactor = 0.4;
let diamondSpacing = 1.2;
// grid settings
let margin = 5;
let columns = 55;
let rows = 93;

let pathsPerCard = [];
let pathsPerCard2 = [];

let inversenoise = false;
let splitBlueRed = false;
let seeds = undefined;//{"seedvalues":["664571","395761","456393","475119"]};

const createPoints = (minmaxX, minmaxY, nrX, nrVars, spread) => {
    //console.log({minmaxX, minmaxY, nrX, nrVars, spread})
    let w = minmaxX[1]-minmaxX[0];
    let h = minmaxY[1]-minmaxY[0];
    const result = [];

    let amp = 1;
    let freq = 1;

    for (let i = 0; i < nrX; i++) {
        let points = [];
        let ax = random.rangeFloor(0, 100);
        let bx = random.rangeFloor(0, 100);
        let ay = random.rangeFloor(0, 100);
        let by = random.rangeFloor(0, 100);
        
        for (let i = 0; i <= nrVars; i++) {
            bx = bx + spread;
            by = by + spread;
            let u = random.noise2D(ax, bx, amp, freq);
            let v = random.noise2D(ay, by, amp, freq);
            let x = minmaxX[0] + Math.abs(lerp(0, w, u));
            let y = minmaxY[0] + Math.abs(lerp(0, h, v));
            points.push([x,y]);
        }

        result.push({points, spread})
    }
    return result;
}


const sketch = ({ width, height }) => {
    // do random stuff here
    let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardcolumns, postcardrows, seeds);
   
    
    cards.forEach(card => {
        let marginx = card.width/4;
        let marginy = card.height/4;
        random.setSeed(card.seed);
        card.margin = margin;
        card.data = createPoints([card.left+marginx, card.right-marginx],
                                 [card.top+marginy, card.bottom-marginy], 
                                 5, 1, 0.01);
        console.log(card.data)
      })

      
    
  return ({ context, width, height, units }) => {
    // do drawing stuff here
    console.log('start');
    pathsPerCard = [];
    pathsPerCard2 = [];
    
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let paths1 = [];
      let paths2 = [];

      card.data.forEach(d => {
        for (let i = 0; i < d.points.length; i++) {
            paths1.push(createCirclePath(d.points[i], 1))
        }
      });

      let allsets = card.data.map(d => d.points)
      let setlength = allsets[0].length
      let last = setlength-1

      for (let i = 0; i < allsets.length; i++) {
        let s = allsets[i]
        if (i > 0) { allsets[i-1][last] = allsets[i][0] }
      }

      createCubicBezierPath


      // for (let i = 0; i < allsets[0].length; i++) {
      //   let thisset = allsets.map(s => s[i])
      //   let thissortedset = thisset //hilbertSort(thisset, width, height)

      //   let hobbyset = hobby(thissortedset, 0.1)

      //   for (let i = 0; i < thissortedset.length-1; i++) {
      //       let j = i*3;
      //       let start = hobbyset[j]
      //       let end = hobbyset[j+3]
      //       let c1 = hobbyset[j+1]
      //       let c2 = hobbyset[j+2]
      //       paths2.push(createCubicBezierPath(start, end, c1, c2))
      //   }
      //   paths2.push(createCubicBezierPath(hobbyset[hobbyset.length-3], hobbyset[0], hobbyset[hobbyset.length-2], hobbyset[hobbyset.length-1]))
      // }

      pathsPerCard.push(paths1);
      pathsPerCard2.push(paths2);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...pathsPerCard2, ...pathsPerCard];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
    let j = groupnames.length;
    pathsPerCard.forEach((p, i) => groupnames.push(`${i+j} card`))
    j = groupnames.length;
    pathsPerCard2.forEach((p, i) => groupnames.push(`${i+j} card`))

   // console.log({pathsPerCard, pathsPerCard2, groups, groupnames})

    return renderGroupsWithText(groups, text1, {
      context, width, height, units, groupnames, lineWidth, optimize : {
        sort: true,
        merge: true,
        removeDuplicates: true,
        removeCollinear: true
      }
    });
  };
};

canvasSketch(sketch, settings);