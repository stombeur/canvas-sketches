
const canvasSketch = require('canvas-sketch');
const { renderPaths } = require('canvas-sketch-util/penplot');
import {room} from './room';
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath } = require('../utils/paths');

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

const drawPlan = (paths, center, width) => {
  let rooms = [];
  let unit = width/12;
  let origin = room.from(center, unit);
  rooms.push(origin);

  for (let i = 0; i < 10; i++) {
    //debugger
    let r = random.pick(rooms);
    let s = random.pick(r.extrudableSides());
    let d = random.pick([unit/2, unit, unit*2]);
    let a = random.value() > 0.2 ? random.range(10, 30) : 0;
    let stairUnit = unit / 10;
    if (random.value() > 0.8) { r.addStairs(random.pick([1,2,3,4]), stairUnit*1.5, random.pick([stairUnit*4, stairUnit*6, stairUnit*15])); }
    let columnunit = unit / 4;
    if (random.value() > 0.85) { r.addColumnade(random.pick([1,2,3,4]), columnunit*1.5, columnunit, columnunit/3); }

    try {
      let e = r.extrude(s, d, a);
      if (e) { 
        rooms.push(e); 
      } 
    }
    catch(e){
      console.log(r,s,d,a);
    }
  }  

  
  rooms.forEach(r => {
    if (!r) { return; }
    r.drawLines(l => {
      paths.push(createLinePath(l));
    });
    r.drawCircles((center, radius) => {
      paths.push(createArcPath(center, radius, 0, 360));
    });
  });
}

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {
    let paths = [];

    let margin = [6, 6];
    let columns = 4, rows = 5;

    let elementW = (width - margin[0]) / columns;
    let elementH = (height - margin[1]) / rows;

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          let center = [margin[0] + c*elementW + elementW/2, margin[1] + r*elementH + elementH/2];
          drawPlan(paths, center, elementW);
        }
    }

    return renderPaths([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);