import { clip } from "../utils/poly";
import { point } from "./point";
import { clipregion } from "./clipregion";
const poly = require("../utils/poly");

export class polyline {
  constructor(points = null) {
    if (points && Array.isArray(points)) {
      this.points = points.map((p) => p.x ? p : new point(p[0], p[1]));
      //this.points = points.map(p => structuredClone(p))
    }
  }

  points = [];

  add(point) {
    this.points.push(point);
  }

  rotate(center, angle) {
    let rotatedPoints = this.points.map((p) => {
      let pp = new point(...p);
      let ppr = pp.rotate(center, angle);
      return [ppr.x, ppr.y];
    });
    return new polyline(rotatedPoints);
  }

  move(vector) {
    if (this.points) {
      this.points = poly.movePoly(this.points, vector);
    }
    return this;
  }

  static copy(original) {
    let newline = new polyline();
    original.points.forEach((p) => newline.add([p[0], p[1]]));
    return newline;
  }

  get lastPoint() {
    return this.points[this.points.length - 1];
  }

  copy() {
    return polyline.copy(this);
  }

  toLines() {
    let result = [];

    for (let i = 0; i < this.points.length; i++) {
      let i2 = (i + 1) % this.points.length;
      result.push([this.points[i], this.points[i2]]);
    }

    return result;
  }

  sortByLength() {
    return this.toLines().sort(
      (l2, l1) =>
        Math.hypot(l1[1][0] - l1[0][0], l1[1][1] - l1[0][1]) -
        Math.hypot(l2[1][0] - l2[0][0], l2[1][1] - l2[0][1])
    );
  }

  static angle(line) {
    let a =
      (Math.atan2(line[0][1] - line[1][1], line[0][0] - line[1][0]) * 180) /
      Math.PI;
    //console.log(a)
    return a;
  }

  angle() {
    return polyline.angle(this);
  }

  toClipRegion() {
    let r = new clipregion();
    r.addRegion(this.points);
    return r;
  }

  centroid() {
    const avgx =
      this.points.reduce((a, b) => a + b[0], 0) / this.points.length || 0;
    const avgy =
      this.points.reduce((a, b) => a + b[1], 0) / this.points.length || 0;
    return new point(avgx, avgy);
  }

  join(other, prepend = false) {
    if (prepend) {
      this.points.splice(0, 0, ...other.points);
    } else {
      this.points.push(...other.points);
    }
    return this;
  }

  static findIntersection(line1, line2) {
    let P1 = line1[0];
    let P2 = line1[1];
    let P3 = line2[0];
    let P4 = line2[1];

    if (!P1.x) {
      P1 = new point(P1[0], P1[1]);
    }
    if (!P2.x) {
      P2 = new point(P2[0], P2[1]);
    }
    if (!P3.x) {
      P3 = new point(P3[0], P3[1]);
    }
    if (!P4.x) {
      P4 = new point(P4[0], P4[1]);
    }

    var x =
      ((P1.x * P2.y - P2.x * P1.y) * (P3.x - P4.x) -
        (P1.x - P2.x) * (P3.x * P4.y - P3.y * P4.x)) /
      ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));
    var y =
      ((P1.x * P2.y - P2.x * P1.y) * (P3.y - P4.y) -
        (P1.y - P2.y) * (P3.x * P4.y - P3.y * P4.x)) /
      ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));
    if (x && y) return new point(x, y);
    else return undefined;
  }

  static perpendicularVector(line) {
    let pl = new polyline(line);
    //console.log(polyline.angle(line));
    let vl = [line[1][0] - line[0][0], line[1][1] - line[0][1]];
    let d = pl.points[0].distanceTo(pl.points[1]);
    let rl = pl.rotate(line[0], -90).toLines()[0];
    let v = [(rl[1][0] - rl[0][0]) / d, (rl[1][1] - rl[0][1]) / d];
    return v;
  }


 // get perpendicular point from C -> AB
 static getSpPoint(A,B,C){
    if (!A.x) A = new point(...A);
    if (!B.x) B = new point(...B);
    if (!C.x) C = new point(...C);

    var x1=A.x, y1=A.y, x2=B.x, y2=B.y, x3=C.x, y3=C.y;
    var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
    var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
    var x = x1 + u * px, y = y1 + u * py;
    return new point(x, y); //this is D
}
  

  toDottedLines() {
    let nrOfSegmentsNormal = 10;
    let divider = 20;
    let dotLength = 0.02;

    let result = [];

    this.toLines().forEach((l) => {
      let d = l[0].distanceTo(l[1]);
      let nrOfSegments = Math.floor((d / divider) * nrOfSegmentsNormal);

      let v = [l[1][0] - l[0][0], l[1][1] - l[0][1]];
      let dx = v[0] / nrOfSegments;
      let dy = v[1] / nrOfSegments;

      let last = l[0];
      for (let i = 0; i < nrOfSegments; i++) {
        let p = [last[0] + dx * dotLength, last[1] + dy * dotLength];
        result.push([last, p]);
        let blank = [p[0] + dx * (1 - dotLength), p[1] + dy * (1 - dotLength)];
        last = blank;
      }
    });

    return result;
  }

  hasPointInside(pt) {
    let eps = 0.0000001;
    let region = this.points;

    var x = pt[0];
    var y = pt[1];
    var last_x = region[region.length - 1][0];
    var last_y = region[region.length - 1][1];
    var inside = false;
    for (var i = 0; i < region.length; i++) {
      var curr_x = region[i][0];
      var curr_y = region[i][1];

      // if y is between curr_y and last_y, and
      // x is to the right of the boundary created by the line
      if (
        curr_y - y > eps != last_y - y > eps &&
        ((last_x - curr_x) * (y - curr_y)) / (last_y - curr_y) + curr_x - x >
          eps
      )
        inside = !inside;

      last_x = curr_x;
      last_y = curr_y;
    }
    return inside;
  }

  overlapsWith(other) {
    let pts = [];
    if (other && Array.isArray(other)) {
        pts = other;
    }
    else {
        pts = other.points;
    }

    let overlaps = false;
    let isinside = true;
    for (let i = 0; i < pts.length; i++) {
      let inside = this.hasPointInside(pts[i]);
      isinside = isinside && inside;
      overlaps = overlaps || inside;
    }
    return { overlaps, isinside };
  }

  // shorter(end, distance) {
  //     let line = end ? [this.points[this.points.length-2], this.lastPoint] : [this.points[0], this.points[1]];
  //     if (end) {
  //         let ints = poly.findCircleLineIntersectionsP(distance/2, this.lastPoint, line);

  //     }
  //     else {

  //     }
  // }

  // sortPointsCW() {
  //     this.points.sort((a,b)=>a.y - b.y);

  //     // Get center y
  //     const cy = (points[0].y + points[points.length -1].y) / 2;

  //     // Sort from right to left
  //     points.sort((a,b)=>b.x - a.x);

  //     // Get center x
  //     const cx = (points[0].x + points[points.length -1].x) / 2;

  //     // Center point
  //     const center = {x:cx,y:cy};

  //     // Pre calculate the angles as it will be slow in the sort
  //     // As the points are sorted from right to left the first point
  //     // is the rightmost

  //     // Starting angle used to reference other angles
  //     var startAng;
  //     points.forEach(point => {
  //         var ang = Math.atan2(point.y - center.y,point.x - center.x);
  //         if(!startAng){ startAng = ang }
  //         else {
  //             if(ang < startAng){  // ensure that all points are clockwise of the start point
  //                 ang += Math.PI * 2;
  //             }
  //         }
  //         point.angle = ang; // add the angle to the point
  //     });

  //     // Sort clockwise;
  //     points.sort((a,b)=> a.angle - b.angle);
  // }
}
