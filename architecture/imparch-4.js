
const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
import { hatch } from '../utils/hatch';
import {room} from './room';
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath } = require('../utils/paths');
const poly = require('../utils/poly');
const polybool = require('polybooljs');
import { polyline } from "../utils/polyline";
import { boundingbox } from '../utils/boundingbox';

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
    let r = random.pick(rooms);
    let s = random.pick(r.extrudableSides());
    let d = random.pick([unit/2, unit, unit*2]);
    let a = random.value() > 0.2 ? random.range(10, 30) : 0;
    let stairUnit = unit / 10;
    if (random.value() > 0.8) { r.addStairs(random.pick([1,2,3,4]), stairUnit*1.5, random.pick([stairUnit*4, stairUnit*6, stairUnit*15])); }
    let columnunit = unit / 4;
    if (random.value() > 0.6) { r.addColumnade(random.pick([2,3,4]), columnunit*1.5, columnunit, columnunit/3); }

    try {
      let e = r.extrude(s, d, a);
      if (e) { 
        rooms.push(e); 
      } 
    }
    catch(e){
      console.log(e, r,s,d,a);
    }
  }  
  
  return rooms;
}

const sketch = ({ width, height }) => {
  
  let margin = [6, 6];
  let columns = 1, rows = 1;

  let elementW = (width - margin[0]) / columns;
  let elementH = (height - margin[1]) / rows;

  let plans = [];
  let copies = [];
  let lines = [];

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      let center = [margin[0] + c*elementW + elementW/2, margin[1] + r*elementH + elementH/2];
      let rooms = drawPlan(center, elementW);

      let bb = boundingbox.from(room.linkroomlines(rooms).points);
      console.log(bb)

      let v = [center[0]-bb.center[0], center[1]-bb.center[1]];
      rooms.forEach(r => r.move(v));

      let h = hatch.inside(room.linkroomlines(rooms).points, 10, 1);
      lines.push(...h)

      let roomRegion = room.toClipRegion(rooms);
      let bb2 = boundingbox.from([[elementW*c, elementH*r],[elementW*(r+1), elementH*r],[elementW*(r+1), elementH*(r+1)],[elementW*r,elementH*(r+1)]]);
      let region2 = roomRegion.splitVertically([[width/2.4, 0],[width/2, height]], bb2, [5, -2]);
      let region3 = region2.splitHorizontally([[0, height/2],[width, height/3]], bb2, [2, 5]);
      let region4 = region3.splitVertically([[width/4, 0],[width, height]], bb2, [5, -2]);

      lines.push(...region4.toLines())

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

    lines.forEach(l => {
      planPaths.push(createLinePath(l));
    })

    return renderGroups([planPaths, otherPaths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);