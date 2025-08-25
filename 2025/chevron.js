import { createLinePath, createPolylinePath } from "../utils/paths";
import { point } from "../utils/point";
import { polyline } from "../utils/polyline";

export class chevron {
    points = [];
    side = 1;

    constructor(points, side) {
        if(!points) return;

        this.points = points;
        this.side = side;
    }

    static fromPoints(points) {

        
        let result = new chevron();
        result.points = points;
        return result;
    }

    static fromCenter(center) {
        let result = new chevron();


        result.points.push([center[0]-result.side/2, center[1]-result.side/2]); // topleft
        result.points.push([center[0]+result.side/2, center[1]-result.side/2]); // topright
        result.points.push([center[0]+result.side/2-result.side/3, center[1]]); // inham rechts
        result.points.push([center[0]+result.side/2, center[1]+result.side/2]); //bottom right
        result.points.push([center[0]-result.side/2, center[1]+result.side/2]); // bottom left
        result.points.push([center[0]-result.side/2-result.side/3, center[1]]);
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

        return new chevron(newPoints, Math.cos(s));
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
        return new chevron(newPoints, this.side);
    }

    center() {
        return polyline.findIntersection([this.points[0], this.points[3]], [this.points[1], this.points[4]])
    }
}