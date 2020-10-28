
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
const postcards = require('../utils/postcards');

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

  for (let i = 0; i < 10; i++) {
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

  let plans = [];

  const prepare = (origin, w, h) => {
    let bounds = boundingbox.from([origin, postcards.reorigin([w, 0], origin), postcards.reorigin([w, h], origin), postcards.reorigin([0, h], origin)]);
    let rooms = drawPlan(bounds.center, w);
    let linkedrooms = room.linkroomlines(rooms);
    let bb = boundingbox.from(linkedrooms.points);
    rooms.forEach(r => r.move(poly.createVector(bb.center, bounds.center)));
    linkedrooms = room.linkroomlines(rooms);

    let lines = [];
    rooms.forEach(r => lines.push(...r.plan()));

    let hatches = hatch.inside(linkedrooms.points, 10, h/150);

    let startregion = room.toClipRegion(rooms);
    let times = random.pick([3,4,5]);
    
    for (let i = 0; i < times; i++) {
      let vertical = random.boolean();
      let divider = random.range(2,3);
      if (vertical) {
        startregion = startregion.splitVertically([postcards.reorigin([w/divider, 0], origin),postcards.reorigin([w-(w/divider), h], origin)], bounds, [3, 3]);
      }
      else {
        startregion = startregion.splitHorizontally([postcards.reorigin([0, h/divider], origin),postcards.reorigin([w, h-(h/divider)], origin)], bounds, [3, 3]);
      }
    }
    plans.push({lines:startregion.toLines(), hatches});
  }

  postcards.drawQuad(prepare, width, height);
  
  return ({ context, width, height, units }) => {
    
    let planPaths = [];
    let otherPaths = [];

    const draw = (origin, w, h) => {
      plans.forEach(p => {
        p.lines.forEach(l => { planPaths.push(createLinePath(l)); })
        p.hatches.forEach(l => { otherPaths.push(createLinePath(l)); })
      });

    }

    postcards.drawQuad(draw, width, height);

    return renderGroups([planPaths, otherPaths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);