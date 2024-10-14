const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('./utils/postcards');
const { createArcPath, createLinePath, createCubicBezierPath, createQuadraticBezierPath, findTangentialControlPoint, createCirclePath } = require('./utils/paths');
const { point } = require('./utils/point');
const { distanceBetween, intersection } = require('./utils/poly');
const { polyline } = require('./utils/polyline');
const poly = require('./utils/poly.js');
const { clipregion } = require('./utils/clipregion.js');


const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const createMeanderRegion = (origin, width, height, segments, thickness) => {
  let points = [];

  let c1 = new point(width/4 + origin[0], 0 + origin[1]);
  let c2 = new point(3 * width/4 + origin[0], height + origin[1]);

  let r = distanceBetween(c1, c2) / 2;
  let ri = r - thickness/2;
  let ro = r + thickness/2;

  let i = intersection(c1[0], c1[1], r, c2[0], c2[1], r)

  let v = poly.createVector(c1, [i[0], i[2]]);

  let starti1 = c1.copy(v[0]*r/ri, v[1]*r/ri);
  let starto1 = c1.copy(v[0]*r/ro, v[1]*r/ro);
  let starti2 = c1.copy(v[0]*r/ri, v[1]*r/ri);
  let starto2 = c1.copy(v[0]*r/ro, v[1]*r/ro);

  let a1 = -polyline.angle([c1, [i[0], i[2]]]);
  let a2 = 180 - polyline.angle([c2, [i[0], i[2]]]);

  //  c1
  //  1   2
  //  4   3
  //      c2

  // 1i<------reverse     2i------->
  // 1o<------     2o------->reverse

  // 1i reverse
  let temp = [];
  temp.push(starti1);
  for (let i = 0; i < segments; i++) {
        let endi1 = starti1.rotate(c1, (a1 / segments));
        starti1 = endi1;
        temp.push(starti1);
    }
  Array.prototype.reverse.call(temp);
  points.push(...temp);
  temp = [];

  // 2i forward
  temp.push(starti2);
  for (let i = 0; i < segments; i++) {
        let endi2 = starti2.rotate(c2, (a2 / segments));
        starti2 = endi2;
        temp.push(starti2);
    }
  points.push(...temp);
  temp = [];

  // 2o reverse
  temp.push(starto2);
  for (let i = 0; i < segments; i++) {
        let endo2 = starto2.rotate(c2, (a2 / segments));
        starto2 = endo2;
        temp.push(starto2);
    }
  Array.prototype.reverse.call(temp);
  points.push(...temp);
  temp = [];

  // 1o forward
  temp.push(starto1);
  for (let i = 0; i < segments; i++) {
        let endo1 = starto1.rotate(c1, (a1 / segments));
        starto1 = endo1;
        temp.push(starto1);
    }
  points.push(...temp);

  return points;
}

const sketch = ({ width, height }) => {
  // do random stuff here

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];

    let margin = width / 10;

    let origin = [margin*2, height/8];
    let points = createMeanderRegion(origin, width - (4 * margin), height/2, 16, 20);
    let points2 = createMeanderRegion(origin, width - (4 * margin), height/2, 16, 10);

    //console.log(points)

    let r = new clipregion(points);
    r.toLines().forEach(l => paths.push(createLinePath(l)));
    new clipregion(points2).toLines().forEach(l => paths.push(createLinePath(l)));

    
    return renderGroups([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);