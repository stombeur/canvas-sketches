import { polyline } from "./polyline";
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

    static from(pline, padding = 0) {
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
}
