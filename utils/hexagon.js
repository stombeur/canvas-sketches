import { point } from "./point";
const { createArcPath, createLinePath } = require("./paths");

export class hexagon {
  constructor(center, innerRadius) {
    this.center = center;
    this.innerRadius = innerRadius;
    this.outerRadius = innerRadius / Math.cos((Math.PI / 180) * 30);
    this.points = this.getPoints(this.center, this.outerRadius);
  }

  points = [];
  center = [];
  innerRadius = 0;
  outerRadius = 0;

  getPoints(cen, outerR) {
    let result = [];
    let pStart = new point(cen[0] + outerR, cen[1]).rotate(cen, -30);
    result.push(pStart);

    for (let i = 0; i < 6; i++) {
      let p = pStart.rotate(cen, 60);
      result.push(p);
      pStart = p;
    }

    return result;
  }

  drawLines(paths) {
    for (let i = 0; i < this.points.length; i++) {
      paths.push(
        createLinePath([
          this.points[i],
          this.points[(i + 1) % this.points.length],
        ])
      );
    }
  }

  drawCircles(paths, offset) {
    let rows = 7
    let startAngle = 90
    for (let j = 1; j < rows; j++) {
        let r = this.outerRadius / rows * j
        for (let i = offset; i < this.points.length; i += 2) {
            let sAngle = startAngle + i/2*120
            paths.push(createArcPath(this.points[(i) % this.points.length], r, sAngle, (sAngle+120)));
        }
    }
    

    
  }
}
