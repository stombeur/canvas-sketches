import { createPolylinePath, drawLineOnCanvas } from "../utils/paths";
import { point } from "../utils/point";
import { polyline } from "../utils/polyline";
import {hatch } from "../utils/hatch";
import { random } from "canvas-sketch-util";
const { createPath } = require('canvas-sketch-util/penplot');

export class hexagon {
    points = [];
    center = [0,0];
    side = 1;

    constructor(center, side) {
       this.side = side;
       this.center = center;
       let p = new point(center[0], center[1]-side);

       for (let i = 0; i < 6; i++) {
        this.points.push(p.rotate(center, i*60))
       }
    }

    draw() {
        return createPolylinePath(new polyline(this.points))
    }

    draw3d() {
        return createPath(ctx => {
            new polyline(this.points).toLines().forEach(l => {
                drawLineOnCanvas(ctx, l);
              });
              drawLineOnCanvas(ctx, [this.center, this.points[1]]);
              drawLineOnCanvas(ctx, [this.center, this.points[3]]);
              drawLineOnCanvas(ctx, [this.center, this.points[5]]);
          });
    }

    get3dFaces() {
        let faces = [];
        faces.push(new polyline([this.points[0], this.points[1], this.center, this.points[5]]).close());
        faces.push(new polyline([this.points[1], this.points[2], this.points[3], this.center]).close());
        faces.push(new polyline([this.points[5], this.center, this.points[3], this.points[4]]).close());
        return faces;
    }

    getOutsideLinesPredefined(borders) {
        let lines = [];
        
        if (borders.topright) lines.push([this.points[0], this.points[1]]);
        if (borders.right) lines.push([this.points[1], this.points[2]]);
        if (borders.bottomright) lines.push([this.points[2], this.points[3]]);
        if (borders.bottomleft) lines.push([this.points[3], this.points[4]]);
        if (borders.left) lines.push([this.points[4], this.points[5]]);
        if (borders.topleft) lines.push([this.points[5], this.points[0]]);

        return lines;
    }

    getOutsideLines(row, col, rows, columns) {
        let lines = [];
        const firstRow = row === 0;
        const lastRow = row === rows-1;
        const firstColumn = col === 0;
        const lastColumn = col === columns-1;
        const evenRow = row%2===0;

        if (!firstRow && !firstColumn && !lastRow && !lastColumn) return lines;

        if (firstRow) {
            lines.push([this.points[5], this.points[0]]);
            lines.push([this.points[0], this.points[1]]);
        }
        if (lastRow) {
            lines.push([this.points[4], this.points[3]]);
            lines.push([this.points[3], this.points[2]]);
        }
        if (firstColumn) {
            lines.push([this.points[4], this.points[5]]);
            if (evenRow) {
                lines.push([this.points[4], this.points[3]]);
                lines.push([this.points[5], this.points[0]]);
            }
        }
        if (lastColumn) {
            lines.push([this.points[1], this.points[2]]);
            if (!evenRow) {
                lines.push([this.points[0], this.points[1]]);
                lines.push([this.points[2], this.points[3]]);
            }
        }

        return lines;
    }

    /**
     * @return {polyline}
     */
    getTop3dFace() {
        return new polyline([this.points[0], this.points[1], this.center, this.points[5]]);
    }

    /**
     * @return {polyline}
     */
    getLeft3dFace() {
        return new polyline([this.points[5], this.center, this.points[3], this.points[4]])
    }

    /**
     * @return {polyline}
     */
    getRight3dFace() {
        return new polyline([this.points[1], this.points[2], this.points[3], this.center])
    }

    hatch3dFaces(nrOfHatches = 10) {
        let lines = [];

        this.get3dFaces().forEach(f => {
            let fi = f.copy().toLines();
            let ri = random.rangeFloor(0, 2);
            let li = fi[ri]; // 0 or 1 of the lines
            let lvi = fi[ri+1]; // other line for vector
            let vi = [lvi[1][0] - lvi[0][0], lvi[1][1]-lvi[0][1]];
    
            for (let i = 0; i < nrOfHatches+1; i++) {
                let l = new polyline(li).move([vi[0] / nrOfHatches * i, vi[1] / nrOfHatches * i])
                lines.push(l.points)
            }
        });
        
        return lines;
    }

    scale(s) {
        if (s === 0) return this;

        let c = this.center();
        let newPoints = [];
        this.points.forEach(p => {
            let v = [p[0] - c[0], p[1] - c[1]];
            let pa = [c[0] + (v[0]*s), c[1] + (v[1]*s)];
            newPoints.push(pa);
        });

        return new square(newPoints, Math.cos(s));
    }

    scaleMinMax(s, max) {
        if (max === 0) return this;
        let min = -1 * max;

        if (s > max) { s = max }
        if (s < min) { s = min }

        return this.scale(s)
    }

    rotate(angle) {
        if (angle === 0 || angle === 360) return this;
        let c = this.center();
        let newPoints = [];
        this.points.forEach(p => {
            newPoints.push(new point(...p).rotate(c, angle));
        });
        return new square(newPoints, this.side);
    }
}