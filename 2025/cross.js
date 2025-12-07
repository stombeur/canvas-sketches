import { createLinePath, createPolylinePath } from "../utils/paths";
import { point } from "../utils/point";
import { polyline } from "../utils/polyline";

export class cross {
    points = [];
    size = 1;
    index = -1;

    constructor(points, size) {
        if(!points) return;
        if (points.length != 12) throw new Error("a square must have 4 points");
        this.points = points;
        this.size = size;
    }

    static fromCenter(center, size = 1) {
        let result = new cross();
        /*      ---
             ___| |___
            |___   ___|
                | |
                ---
        */

        result.size = size;
        let armlength = result.size / 3 ;
        let armthickness = result.size / 3;

        let pstart = new point(center[0]-result.size/2+armlength, center[1]-result.size/2);

        result.points.push(pstart.copy());
        result.points.push(pstart.copy(armthickness, 0));
        result.points.push(pstart.copy(armthickness, armlength));
        result.points.push(pstart.copy(armthickness + armlength, armlength));
        result.points.push(pstart.copy(armthickness + armlength, armlength + armthickness));
        result.points.push(pstart.copy(armthickness, armlength + armthickness));
        result.points.push(pstart.copy(armthickness, result.size));
        result.points.push(pstart.copy(0, result.size));
        result.points.push(pstart.copy(0, result.size - armlength));
        result.points.push(pstart.copy(-armlength, result.size - armlength));
        result.points.push(pstart.copy(-armlength, armlength));
        result.points.push(pstart.copy(0, armlength));

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

        return new cross(newPoints, this.size * s);
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
        return new cross(newPoints, this.size);
    }

    center() {
        let l1 = [this.points[0], this.points[6]];
        let l2 = [this.points[1], this.points[7]];

        //console.log(l1, l2)

        return polyline.findIntersection(l1, l2);
    }
}