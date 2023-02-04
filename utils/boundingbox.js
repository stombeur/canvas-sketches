import { polyline } from "./polyline";
import { point } from "./point";
import {clipregion} from './clipregion';

export class boundingbox {
    constructor() {

    }

    left = Number.MAX_VALUE;
    top = Number.MAX_VALUE;
    right = 0;
    bottom = 0;

    height = 0;
    width = 0;

    points = [];
    lines = [];
    center = [];

    toClipRegion() {
        let r = new clipregion();
        let p = [...this.points];
        p.reverse();
        // p.push(...this.points);
        p.push(this.points[0]);
        r.addRegion(p);
        return r;
    }

    toPolyline() {
        return new polyline(this.points);
    }

    static fromWH(center, width, height, padding = 0) {
        const pline = new polyline([[center[0]-width/2,center[1]-height/2],
        [center[0]+width/2,center[1]-height/2],
        [center[0]+width/2,center[1]+height/2],
        [center[0]-width/2,center[1]+height/2],]);

        return boundingbox.from(pline, padding);
    }

    static from(pline, padding = 0) {
        if (pline instanceof polyline) { pline = pline.points; }
        
        let bb = new boundingbox();

        if (pline instanceof polyline) { pline = pline.points; }

        pline.map(p => {
            bb.left = Math.min(p[0], bb.left);
            bb.top = Math.min(p[1], bb.top);
            bb.right = Math.max(p[0], bb.right);
            bb.bottom = Math.max(p[1], bb.bottom);
            });

        bb.left = bb.left - padding;
        bb.top = bb.top - padding;
        bb.right = bb.right + padding;
        bb.bottom = bb.bottom + padding;

        bb.height = bb.bottom - bb.top;
        bb.width = bb.right - bb.left;

        bb.points = [
            [bb.left, bb.top],
            [bb.right, bb.top],
            [bb.right, bb.bottom],
            [bb.left, bb.bottom]
          ];

        bb.lines = [
            [bb.points[0], bb.points[1]],
            [bb.points[1], bb.points[2]],
            [bb.points[2], bb.points[3]],
            [bb.points[3], bb.points[0]]
        ];

        bb.center = [
            (bb.right - bb.left)/2 + bb.left,
            (bb.bottom - bb.top)/2 + bb.top
        ];
        
        return bb;
    }

    bisect(line) {
        let topLine = this.lines[0];
        let rightLine = this.lines[1];
        let bottomLine = this.lines[2];
        let leftLine = this.lines[3];

        let intersectTop = polyline.findIntersection(topLine, line);
        if (intersectTop && !intersectTop.isBetween(this.points[0], this.points[1])) intersectTop = undefined;

        let intersectRight = polyline.findIntersection(rightLine, line);
        if (intersectRight && !intersectRight.isBetween(this.points[1], this.points[2])) intersectRight = undefined;

        let intersectBottom = polyline.findIntersection(bottomLine, line);
        if (intersectBottom && !intersectBottom.isBetween(this.points[3], this.points[2])) intersectBottom = undefined;
        
        let intersectLeft = polyline.findIntersection(leftLine, line);
        if (intersectLeft && !intersectLeft.isBetween(this.points[0], this.points[3])) intersectLeft = undefined;

        let nrOfIntersections = [!!intersectTop, !!intersectRight, !!intersectBottom, !!intersectLeft].reduce((a,c) => a+c, 0);

        if (nrOfIntersections < 2) return [this.toPolyline()];

        if (intersectTop) {
            if(intersectLeft) {
                return [new polyline([ this.points[0], intersectTop, intersectLeft]),
                        new polyline([intersectTop, this.points[1], this.points[2], this.points[3], intersectLeft])];
            }
            if(intersectBottom) {
                return [new polyline([ this.points[0], intersectTop, intersectBottom, this.points[3]]),
                        new polyline([  intersectTop, this.points[1], this.points[2], intersectBottom])];
            }
            if(intersectRight) {
                return [new polyline([this.points[0], intersectTop, intersectRight, this.points[2], this.points[3]]),
                        new polyline([intersectTop, this.points[1], intersectRight])];
            }
            return [this.toPolyline()];
        }
        if (intersectBottom) {
            if(intersectLeft) {
                return [new polyline([intersectLeft, intersectBottom, this.points[3]]),
                        new polyline([intersectLeft, this.points[0], this.points[1], this.points[2], intersectBottom])];
            }
            if(intersectRight) {
                return [new polyline([this.points[0], this.points[1], intersectRight, intersectBottom, this.points[3]]),
                        new polyline([intersectRight, this.points[2], intersectBottom])];
            }
            return [this.toPolyline()];
        }
        if (intersectLeft) {
            if(intersectRight) {
                return [new polyline([this.points[0], this.points[1], intersectRight, intersectLeft]), 
                        new polyline([intersectLeft, intersectRight, this.points[2], this.points[3]])];
            }
            return [this.toPolyline()];
        }
    }
}
