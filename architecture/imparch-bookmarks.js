
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
import { clipregion } from '../utils/clipregion';
const postcards = require('../utils/postcards');

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'landscape',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};


const drawPlan = (center, width) => {
  let rooms = [];
  let unit = width/6.4;
  let origin = room.from(center, unit,);
  origin.name = "origin";
  rooms.push(origin);

  for (let i = 0; i < 14; i++) {
    let r = random.pick(rooms);

    if (random.value() > 0.7) { r.addWindow(random.pick([1,2,3,4])); }
    let s = random.pick(r.extrudableSides());
    let d = random.pick([unit/2, unit, unit*2]);
    let a = random.value() > 0.2 ? random.range(10, 30) : 0;
    let stairUnit = unit / 10;
    if (random.value() > 0.7) { r.addStairs(random.pick([1,2,3,4]), stairUnit*1.5, random.pick([stairUnit*4, stairUnit*6, stairUnit*15])); }
    let columnunit = unit / 4;
    if (random.value() > 0.7) { r.addColumnade(random.pick([1,2,3,4]), columnunit*1.5, columnunit, columnunit/3); }



    try {
      let e = r.extrude(s, d, a);
      e.name = "room "+i;
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


const pushOutwards = (r, l, d) => {
  // room, line, distance
  let {m,n} = poly.lineEquationFromPoints(l[0], l[1]);
  let ld = Math.hypot(l[1][0]-l[0][0], l[1][1]-l[0][1]);
  let vd = [d*(l[1][1]-l[0][1])/ld, d*(l[1][0]-l[0][0])/ld];

  if (r.columns) {
    const avgx = (r.columns.reduce((a,b) => a + b.c[0], 0) / r.columns.length) || 0;
    const avgy = (r.columns.reduce((a,b) => a + b.c[1], 0) / r.columns.length) || 0;
    let cs = [avgx, avgy];
    let lx = (cs[1] - n) / m;
    let left = (lx > cs[0]);
    let v = left ? [vd[0], - vd[1]] : [-vd[0], vd[1]];
    let newColumns = r.columns.map(x => {return {r:x.r, c:poly.movePoint(x.c, v)}});
    r.columns = newColumns;
    //console.log("columns", r.name, "left:"+left, v, cs, lx);
  }
  if (r.stairs) {
    //center for all stairs
    //let xx = r.stairs.reduce((a, b) => {console.log(a,b); return a + b[0][0] + b[1][0]}, 0);
    const avgx = (r.stairs.reduce((a, b) => a + b[0][0] + b[1][0], 0) / r.stairs.length) || 0;
    const avgy = (r.stairs.reduce((a, b) => a + b[0][1] + b[1][1], 0) / r.stairs.length) || 0;
    let cs = [avgx, avgy];
    let lx = (cs[1] - n) / m;
    let left = (lx > cs[0]);
    let v = left ? [vd[0], - vd[1]] : [-vd[0], vd[1]];
    let newStairs = r.stairs.map(s => new polyline(s).move(v).points);
    r.stairs = newStairs;
    //console.log("stairs", r.name, "left:"+left, v, cs, lx);

  }
  if (r.windows) {
    //center of room
    r.center;
    const avgx = r.center[0] || 0;
    const avgy = r.center[1] || 0;
    let cs = [avgx, avgy];
    let lx = (cs[1] - n) / m;
    let left = (lx > cs[0]);
    let v = left ? [vd[0], - vd[1]] : [-vd[0], vd[1]];
    let newWindows = r.windows.map(w => new polyline(w).move(v).points);
    r.windows = newWindows;
    //console.log("windows", r.name, "left:"+left, v, cs, lx);

  }

}



const sketch = ({ width, height }) => {

  let plans = [];

  const prepare = (origin, w, h) => {
    let boundsL = boundingbox.from([origin, postcards.reorigin([w/2, 0], origin), postcards.reorigin([w/2, h], origin), postcards.reorigin([0, h], origin)]);
    let roomsL = drawPlan(boundsL.center, h/2);
    let boundsR = boundingbox.from([postcards.reorigin([w/2, 0], origin), postcards.reorigin([w, 0], origin), postcards.reorigin([w, h], origin), postcards.reorigin([w/2, h], origin)]);
    let roomsR = roomsL.map(r => room.copy(r).move([w/2, 0]));

    let lines = [];
    let arcs = [];
    let hatches = [];
    let borders = [];

    // borders
    let boundsAll = boundingbox.from([origin, postcards.reorigin([w, 0], origin), postcards.reorigin([w, h], origin), postcards.reorigin([0, h], origin)]);
    boundsAll.lines.forEach(l => borders.push(l));

    // draw left side unchanged
    let vl = poly.createVector(boundingbox.from(room.linkroomlines(roomsL).points).center, boundsL.center); //center in bounds
    roomsL.forEach(r => {
      r.move(vl);

      lines.push(...r.plan());
      if (r.columns) { arcs.push(...r.columns); }
      if (r.stairs) { lines.push(...r.stairs); }
      if (r.windows) { lines.push(...r.windows); }
    });

    let hatchL = roomsL.map(r => room.copy(r).move([w/80, w/80]));
    let originalRegionL = room.toClipRegion(roomsL);
    let hatchRegionL = room.toClipRegion(hatchL);
    hatchRegionL = hatchRegionL.diff(originalRegionL);
    hatchRegionL.regions.forEach(hh => {
      let x = hatch.inside(hh, 10, h/80);
      hatches.push(...x);
    })

    
    //debugger
    //let bbL = boundingbox.from(room.linkroomlines(roomsL), w/20);
    // let backRegionL = bbL.toClipRegion();
    let backRegionL = new clipregion([[0,0],[w/4,0],[w/4,h/1.2],[0,h/1.2]]);
    backRegionL.addRegion([[w/4+0.2,0],[w/2,0],[w/2,h/1.2],[w/4+0.2,h/1.2]])
    let smaller = new clipregion([[w/8,h/4],[7*w/8,h/4],[w/2,0], [w/2, h/2],[w/2,h],[0,h]]);
    backRegionL.inverted = true;
    let rrr = backRegionL.union(originalRegionL);
    console.log({rrr})
    rrr.regions.forEach(rr => {
      let x = hatch.inside(rr, -2, h/50);
     // hatches.push(...x);
    });
    //lines.push(...bbL.lines);


    // draw right side exploded
    let vr = poly.createVector(boundingbox.from(room.linkroomlines(roomsR).points).center, boundsR.center); //center in bounds
    roomsR.forEach(r => {
      r.move(vr);
    });

    let startregionR = room.toClipRegion(roomsR);
    let originalRegionR = room.toClipRegion(roomsR);
    let times = random.pick([6,7,8]);
    
    for (let i = 0; i < times; i++) {
      let vertical = random.boolean();
      let divider = random.range(2,3);
      let dist = w/120;
      let vertdivider = [postcards.reorigin([w/2 + (w/2)/divider, 0], origin),postcards.reorigin([w/2 + w/2-((w/2)/divider), h], origin)];
      let hordivider = [postcards.reorigin([w/2, h/divider], origin),postcards.reorigin([w, h-(h/divider)], origin)];
      startregionR = vertical ? startregionR.splitVertically(vertdivider, boundsR, [dist, dist]) : startregionR.splitHorizontally(hordivider, boundsR, [dist, dist]);
      roomsR.forEach(r => pushOutwards(r, vertical ? vertdivider : hordivider, dist));
    }
    lines.push(...startregionR.toLines());
    roomsR.forEach(r => {
      if (r.columns) { arcs.push(...r.columns); }
      if (r.stairs) { lines.push(...r.stairs); }
      if (r.windows) { lines.push(...r.windows); }
     
    });

    let hatchregionR = originalRegionR.diff(startregionR);
    hatchregionR.regions.forEach(hh => {
      let x = hatch.inside(hh, 10, h/80);
      hatches.push(...x);
    })

    // let lines2 = [], hatches2 = [], arcs2 = [];
    // let center = [origin[0] + h/2, origin[1] + w/2];
    // lines.forEach(l => lines2.push(poly.rotatePolygon(l, center, 90)));
    // hatches.forEach(l => hatches2.push(poly.rotatePolygon(l, center, 90)));
    // arcs.forEach(a => arcs2.push({c: poly.rotatePoint(a.c, center, 90), r: a.r}))
      
    
    plans.push({lines, hatches, arcs, borders});

  }

  postcards.drawTwoColumnsFourRowsLandscape(prepare, width, height);
  
  return ({ context, width, height, units }) => {
    
    let planPaths = [];
    let hatchPaths = [];
    let borders = [];

    const draw = (origin, w, h) => {
      plans.forEach(p => {
        p.lines.forEach(l => { planPaths.push(createLinePath(l)); })
        p.hatches.forEach(l => { hatchPaths.push(createLinePath(l)); })
        p.arcs.forEach(a => { planPaths.push(createArcPath(a.c, a.r, 0, 360)); })
        p.borders.forEach(l => { borders.push(createLinePath(l)); })
      });

    }

    postcards.drawTwoColumnsFourRowsLandscape(draw, width, height);

    return renderGroups([planPaths, hatchPaths, borders], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);