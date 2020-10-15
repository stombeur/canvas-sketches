
const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
import {room} from './room';
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath } = require('../utils/paths');
const poly = require('../utils/poly');

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

const drawPlan = (center, width) => {
  let rooms = [];
  let unit = width/12;
  let origin = room.from(center, unit);
  rooms.push(origin);

  for (let i = 0; i < 14; i++) {
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

  return rooms;
  

}

const sketch = ({ width, height }) => {
  
  let margin = [6, 6];
  let columns = 2, rows = 3;

  let elementW = (width - margin[0]) / columns;
  let elementH = (height - margin[1]) / rows;

  let plans = [];

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      let center = [margin[0] + c*elementW + elementW/2, margin[1] + r*elementH + elementH/2];
      let rooms = drawPlan(center, elementW);

      const points = [];
      let x = rooms.map(r => r.plan().map(p => points.push(...p) ));
      let bb = poly.calculateBoundingBox(points);
      let bbcenter = [[(bb[1][0]-bb[0][0])/2+bb[0][0]],[(bb[1][1]-bb[0][1])/2+bb[0][1]]];

      let v = [center[0]-bbcenter[0], center[1]-bbcenter[1]];
      //rooms.forEach(r => r.move(v));

      plans.push(rooms);
    }
  }
  
  return ({ context, width, height, units }) => {
    
    let planPaths = [];
    let otherPaths = [];

    plans.forEach(p => {
      p.forEach(r => {
        if (!r) { return; }
        r.drawPlan(l => {
          planPaths.push(createLinePath(l));
        });
        r.drawLines(l => {
          otherPaths.push(createLinePath(l));
        });
        r.drawCircles((center, radius) => {
          otherPaths.push(createArcPath(center, radius, 0, 360));
        });
      });
    });

    return renderGroups([planPaths, otherPaths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);