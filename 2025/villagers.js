import { createPolylinePath, drawLineOnCanvas } from "../utils/paths";
import { point } from "../utils/point";
import { polyline } from "../utils/polyline";
import {hatch } from "../utils/hatch";
import { random } from "canvas-sketch-util";
const { createPath } = require('canvas-sketch-util/penplot');

export class villagers {
    points = [];
    center = [0,0];
    width = 1;
    height;


    constructor(topleftcorner, width) {
       this.width = width;
       this.height = width * 1.5;
       this.center = [topleftcorner[0]+this.width/2, topleftcorner[1]+this.height/2];

       let p = this.topLeftPoint;
       this.points.push(p);
       this.points.push(p.copy(this.width, 0));
       this.points.push(p.copy(this.width, this.height));
       this.points.push(p.copy(0, this.height));

    }

    draw() {
        return createPath(ctx => {
            this.outline().forEach(l => drawLineOnCanvas(ctx, l));
            this.leftChevronLines().forEach(l => drawLineOnCanvas(ctx, l));
            this.topTriangleLines().forEach(l => drawLineOnCanvas(ctx, l));
            this.fillLeftChevronDiagonal().forEach(l => drawLineOnCanvas(ctx, l));
          });
    }

    get topLeftPoint() {
        return new point(this.center[0]-this.width/2, this.center[1]-this.height/2);
    }

    fromTopLeftPoint(x, y) {
        return new point(x + this.center[0]-this.width/2, y + this.center[1]-this.height/2);
    }

    outline() {
        return new polyline(this.points).toLines()
    }

    leftChevronLines() {
        let lines = [];

        lines.push([this.topLeftPoint, this.fromTopLeftPoint(this.width/2, this.height/3)]);
        lines.push([this.fromTopLeftPoint(this.width/2, this.height/3), this.fromTopLeftPoint(this.width/2, this.height)]);
        lines.push([this.fromTopLeftPoint(this.width/2, this.height), this.fromTopLeftPoint(0, this.height - this.height/3)]);
        lines.push([this.fromTopLeftPoint(0, this.height - this.height/3), this.topLeftPoint]);

        return lines;
    }

    topTriangleLines() {
        let lines = [];

        lines.push([this.topLeftPoint, this.fromTopLeftPoint(this.width, 0)]);
        lines.push([this.fromTopLeftPoint(this.width, 0), this.fromTopLeftPoint(this.width/2, this.height/3)]);
        lines.push([this.fromTopLeftPoint(this.width/2, this.height/3), this.topLeftPoint]);

        return lines;
    }

    fillLeftChevronDiagonal(spacing = 1) {
        let lines = [];
        let h = this.height * 2/3;
        let n = Math.floor(h / spacing);
        let l = [this.topLeftPoint, this.fromTopLeftPoint(this.width/2, this.height/3)];

        for (let i = 0; i <= n; i++) {
            let l1 = [[l[0][0],l[0][1] + i*h/n],[l[1][0],l[1][1] + i*h/n]];

            lines.push(l1);
        }

        return lines;
    }
    
}