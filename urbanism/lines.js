import { point } from '../utils/point.js';
import { createVector, distanceBetween, intersection } from '../utils/poly.js';
import { polyline } from '../utils/polyline.js';

export class linesObject {
    constructor() {}

    horizontal = [];
    vertical = [];

    verticalPolylines = [];
    horizontalPolylines = [];

    verticalBoxes = [];
    horizontalBoxes = [];

    move_point(point, vector) {
        let p1 = this.verticalPolylines.find(p => p.points.find(pp => pp.equals(point)));
        let p2 = this.horizontalPolylines.find(p => p.points.find(pp => pp.equals(point)));

        if (p1 && p2) {
            let pp1 = p1.points.find(pp => pp.equals(point));
            let pp2 = p2.points.find(pp => pp.equals(point));
            if (pp1) {
                pp1.move(...vector);
            }
            if (pp2) {
                pp2.move(...vector);
            }
        }
    }
}

export const polylineToBox = (pline, width, horizontal = true) => {
    let move = width/2;
    let box = [];
    let vector = horizontal ? [0, -move] : [move, 0];
    
    for (let index = 0; index < pline.points.length; index++) {
        const element = pline.points[index];
        box.push([element[0]+vector[0], element[1]+vector[1]]);
    }
    vector = horizontal ? [0, move] : [-move, 0];
    for (let index = pline.points.length - 1; index >= 0; index--) {
        const element = pline.points[index];
        box.push([element[0]+vector[0], element[1]+vector[1]]);
    }

    return new polyline(box);
}


export const createMeanderRegion = (origin, width, height, segments, thickness) => {
  let points = [];

  let c1 = new point(width/4 + origin[0], 0 + origin[1]);
  let c2 = new point(3 * width/4 + origin[0], height + origin[1]);

  let r = distanceBetween(c1, c2) / 2;
  let ri = r - thickness/2;
  let ro = r + thickness/2;

  let i = intersection(c1[0], c1[1], r, c2[0], c2[1], r)

  let v = createVector(c1, [i[0], i[2]]);

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