import { createLinePath, createPolylinePath } from "../utils/paths";
import { point } from "../utils/point";
import { polyline } from "../utils/polyline";

export class square {
    points = [];
    side = 1;

    constructor(points, side) {
        if(!points) return;
        if (points.length != 4) throw new Error("a square must have 4 points");
        this.points = points;
        this.side = side;
    }

    static fromPoints(points) {
        if (points.length != 4) throw new Error("a square must have 4 points");
        
        let result = new square();
        result.points = points;
        return result;
    }

    static fromCenter(center) {
        let result = new square();
        result.points.push([center[0]-result.side/2, center[1]-result.side/2]);
        result.points.push([center[0]+result.side/2, center[1]-result.side/2]);
        result.points.push([center[0]+result.side/2, center[1]+result.side/2]);
        result.points.push([center[0]-result.side/2, center[1]+result.side/2]);
        return result;
    }

    draw() {
        return createPolylinePath(new polyline(this.points))
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

    center() {
        return polyline.findIntersection([this.points[0], this.points[2]], [this.points[1], this.points[3]])
    }
}