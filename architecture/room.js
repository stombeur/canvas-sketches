import { boundingbox } from '../utils/boundingbox';
import { polyline } from '../utils/polyline';

const poly = require('../utils/poly');

export class room {
    constructor(points = null, unit = 10) {
        if (points && Array.isArray(points) && points.length > 0) {
            this.points = points;
        }
        else {
            this.points = [];
        }
        this.unit = unit;

        let bb = boundingbox.from(this.points);
        this.center = bb.center;
    }

    static from(origin, side) {
        let r = [];
 
        //points
        //  1  2
        //  0  3
        r.push([origin[0] - side/2, origin[1] + side/2]);
        r.push([origin[0] - side/2, origin[1] - side/2]);
        r.push([origin[0] + side/2, origin[1] - side/2]);
        r.push([origin[0] + side/2, origin[1] + side/2]);

        return new room(r, side);
    }

    points = [];
    extrudedSides = [];
    decoratedSides = [];
    unit = 0;
    stairs;
    columns;
    center = [];

    extrudableSides() {
        return [1,2,3,4].filter(x => !this.extrudedSides.includes(x));
    }

    plan() {
        let l = [];
        for (let i = 0; i < this.points.length; i++) {
            let sideNr = i+1;
             if (!this.extrudedSides.includes(sideNr)) { 
               l.push([this.points[i], this.points[(i+1)%this.points.length]]);  
             }
        }
        return l;
    }

    lines() {
        let l = [];

        if (this.stairs) { l.push(...this.stairs); }

        return l;
    }

    circles() {
        let c = [];

        if (this.columns) { c.push(...this.columns); }

        return c;
    }

    drawPlan(fn) {
        this.plan().forEach(l => {
            fn(l);
            });
    }

    drawLines(fn) {
        this.lines().forEach(l => {
            fn(l);
            });
    }

    drawCircles(fn) {
        this.circles().forEach(c => {
            fn(c.c, c.r);
            });
    }

    getSide(nr) {
        // sides
        //   2
        // 1   3
        //   4
        let m1 = nr % 4;
        let m2 = (nr-1)%4;
        return [this.points[m2], this.points[m1]];
    }

    getExtraDisplacement(angle, a) {
        if (angle) { // angle is not null and coincidentally not 0
            let rad = (Math.PI / 180) * angle;
            let d = Math.abs(a * Math.sin(rad) / Math.cos(rad));
            if (angle < 0 && angle > -90) { 
                //rotate CCW
                return [0,d];
            }
            if (angle > 0 && angle < 90) { 
                //rotate CW
                return [d,0];
            }
        } 
        //no rotation
        return [0,0]  
    }

    extrude(sideNr, distance, angle = null) {
        if (this.extrudedSides.includes(sideNr)) { return null; }

        // calculate new points
        /* clockwise && inverted y-axis
            1  2
            0  3

            dx = x1 - x2 en dy = y1 - y2
            dx = 0 && dy > 0 => left    => extrude x - distance
            dx < 0 && dy = 0 => top     => extrude y - distance
            dx = 0 && dy < 0 => right   => extrude x + distance
            dx > 0 && dy = 0 => bottom  => extrude y + distance

        **/

        let re;
        let p0, p1, p2, p3, d, vx, vy;
        switch(sideNr) {
            case 1:
                //points
                // d(1') 2' <= 1  2
                // d(0') 3' <= 0  3
                // extrude x - distance
                // 0 = extruded(p0)
                // 1 = extruded(p1)
                // 2 = p1
                // 3 = p0
                // extruded = side3
                d = this.getExtraDisplacement(angle, this.points[1][1] - this.points[0][1]);
                p0 = [this.points[0][0] - distance -d[0], this.points[0][1]];
                p1 = [this.points[1][0] - distance -d[1], this.points[1][1]];
                p2 = this.points[1];
                p3 = this.points[0];

                if (this.points[0][0] !== this.points[1][0]) { // 0&1 x neg
                    // rotate new p2 and p3 around angle between points above
                    let dx = this.points[1][0] - this.points[0][0];
                    let dy = this.points[1][1] - this.points[0][1];
                    let a = Math.PI - Math.atan2(dx, dy);

                    p0 = poly.rotatePoint(p0, this.points[0], a / Math.PI * 180);
                    p1 = poly.rotatePoint(p1, this.points[1], a / Math.PI * 180);
                }

                re = new room([p0, p1, p2, p3]);
                re.extrudedSides.push(3);
                break;
            case 2:
                // extrude y - distance
                // 0 = p1
                // 1 = extruded(p1)
                // 2 = extruded(p2)
                // 3 = p2
                // extruded = side4
                d = this.getExtraDisplacement(angle, this.points[1][0] - this.points[2][0]);
                p0 = this.points[1];
                p1 = [this.points[1][0], this.points[1][1]-distance-d[0]];
                p2 = [this.points[2][0], this.points[2][1]-distance-d[1]];
                p3 = this.points[2];

                if (this.points[1][1] !== this.points[2][1]) {
                    let dx = this.points[1][0] - this.points[2][0];
                    let dy = this.points[1][1] - this.points[2][1];
                    let a = Math.PI + Math.atan2(dy, dx);

                    p2 = poly.rotatePoint(p2, this.points[2], a / Math.PI * 180);
                    p1 = poly.rotatePoint(p1, this.points[1], a / Math.PI * 180);
                }
                
                re = new room([p0, p1, p2, p3]);
                re.extrudedSides.push(4);
                break;
            case 3:
                // extrude x + distance
                // 0 = p3
                // 1 = p2
                // 2 = extruded(p2)
                // 3 = extruded(p3)
                // extruded = side1
                d = this.getExtraDisplacement(angle, this.points[3][1] - this.points[2][1]);
                p0 = this.points[3];
                p1 = this.points[2];
                p2 = [this.points[2][0] + distance + d[1], this.points[2][1]];
                p3 = [this.points[3][0] + distance + d[0], this.points[3][1]];

                if (this.points[3][0] !== this.points[2][0]) {
                    // rotate new p2 and p3 around angle between points above
                    let dx = this.points[3][0] - this.points[2][0];
                    let dy = this.points[3][1] - this.points[2][1];
                    let a = - Math.atan2(dx, dy);
  
                    p2 = poly.rotatePoint(p2, this.points[2], a / Math.PI * 180);
                    p3 = poly.rotatePoint(p3, this.points[3], a / Math.PI * 180);
                }

                re = new room([p0, p1, p2, p3]);
                re.extrudedSides.push(1);
                break;
            case 4:
                // extrude y + distance
                // 0 = extruded(p0)
                // 1 = p0
                // 2 = p3
                // 3 = extruded(p3)
                // extruded = side2
                d = this.getExtraDisplacement(angle, this.points[0][0] - this.points[3][0]);
                p0 = [this.points[0][0], this.points[0][1] + distance + d[1]];
                p1 = this.points[0];
                p2 = this.points[3];
                p3 = [this.points[3][0], this.points[3][1] + distance + d[0]];

                if (this.points[3][1] !== this.points[0][1]) {
                    let dx = this.points[3][0] - this.points[0][0];
                    let dy = this.points[3][1] - this.points[0][1];
                    let a = Math.atan2(dy, dx);

                    p3 = poly.rotatePoint(p3, this.points[3], a / Math.PI * 180);
                    p0 = poly.rotatePoint(p0, this.points[0], a / Math.PI * 180);
                }

                re = new room([p0, p1, p2, p3]);
                re.extrudedSides.push(2);
                break;
                default:
                    break;
        }

        this.extrudedSides.push(sideNr); 
        re.unit = this.unit;
        //add to extruded!
        return re;
    }

    addStairs(sideNr, step = 5, width = 10, perpendicular = true) {
        //debugger;
        if (this.stairs || this.decoratedSides.includes(sideNr)) { return; }
        this.stairs = [];
        this.decoratedSides.push(sideNr);
        //draw alongside wall
        //clip with polygon/room outline
        //orient towards opposite wall?
        //not always perp to lining wall

        let side = this.getSide(sideNr);
        let length = poly.distanceBetween(side[0], side[1]);
        let steps = Math.floor(length / step);
        let dxdy = [side[1][0] - side[0][0], side[1][1] - side[0][1]];
        let vector = [dxdy[0]/steps, dxdy[1]/steps];
        let start = [[side[0][0], side[0][1]]];
        let angle = 0;
        let po = [];
        po.push(side[0], side[1]);
        switch(sideNr) {
            case 1:
                angle = Math.PI - Math.atan2(dxdy[0], dxdy[1]);
                start.push([start[0][0] + width, start[0][1]]);
                po.push(
                    [side[1][0] + width, side[1][1]],
                    [side[0][0] + width, side[0][1]]
                    );
                break;
            case 2:
                angle = Math.atan2(dxdy[1], dxdy[0]);
                start.push([start[0][0], start[0][1] + width]);
                break;
            case 3:
                angle = - Math.atan2(dxdy[0], dxdy[1]);
                start.push([start[0][0] - width, start[0][1]]);
                break;
            case 4:
                angle = Math.PI + Math.atan2(dxdy[1], dxdy[0]);
                start.push([start[0][0], start[0][1] - width]);
                break;
        }

        if (perpendicular)  {
            let rotstart = poly.rotatePoint(start[1], start[0], angle/ Math.PI * 180);
            start[1] = rotstart;
        }
   
        //this.stairs = poly.hatchPolygon(po, 45, 5);


        for (let s = 0; s < steps; s++) {
            let stair = [
                [start[0][0]+vector[0]*s,start[0][1]+vector[1]*s],
                [start[1][0]+vector[0]*s,start[1][1]+vector[1]*s]
            ];
            this.stairs.push(stair);
        }
    }

    addColumnade(sideNr, step = 5, width = 5, r = 5, perpendicular = true) {
        if (this.columns || this.decoratedSides.includes(sideNr)) { return; }
        this.columns = [];
        this.decoratedSides.push(sideNr);

        let side = this.getSide(sideNr);
        let length = poly.distanceBetween(side[0], side[1]);
        let steps = Math.floor(length / step);
        let dxdy = [side[1][0] - side[0][0], side[1][1] - side[0][1]];
        let vector = [dxdy[0]/steps, dxdy[1]/steps];
        let center_rot = [[side[0][0], side[0][1]]];
        let center_circle;
        let angle = 0;

        switch(sideNr) {
            case 1:
                angle = Math.PI - Math.atan2(dxdy[0], dxdy[1]);
                center_circle = [center_rot[0][0] + width, center_rot[0][1]];
                break;
            case 2:
                angle = Math.atan2(dxdy[1], dxdy[0]);
                center_circle = [center_rot[0][0], center_rot[0][1] + width];
                break;
            case 3:
                angle = - Math.atan2(dxdy[0], dxdy[1]);
                center_circle = [center_rot[0][0] - width, center_rot[0][1]];
                break;
            case 4:
                angle = Math.PI + Math.atan2(dxdy[1], dxdy[0]);
                center_circle = [center_rot[0][0], center_rot[0][1] - width];
                break;
        }

        // if (perpendicular)  {
        //     let rotp = poly.rotatePoint(center_circle, center_rot, angle/ Math.PI * 180);
        //     center_circle = rotp;
        // }

        for (let s = 1; s < steps; s++) {
            let c = [center_circle[0]+vector[0]*s,center_circle[1]+vector[1]*s];
            this.columns.push({c,r});
        }
    }

    move(vector) {
        if (this.points) { this.points = poly.movePoly(this.points, vector); }
        if (this.stairs) {this.stairs = this.stairs.map(s => poly.movePoly(s, vector)); }
        if (this.columns) {this.columns.forEach(col => {
            col.c = poly.movePoint(col.c, vector);
        });}
    }

    moveToCenter(center) {
        this.move([center[0] - this.center[0], center[1] - this.center[1] ])
    }

    static linkroomlines(rooms) {
        let result = new polyline();
        //debugger;
        let lines = [];
        rooms.forEach(r => { 
            lines.push(...r.plan()); 
        });
        //console.log(lines)
        let start = lines[0];
        let current = lines[0];
        let end = false;
        //console.log('lines: ' + lines.length)
        let count = 0;
        while(!end) {
            result.add(current[0]);
            count++;
            //console.log('added point ', current[0][0], current[0][1])
            let next = lines.find(l => l[0][0] === current[1][0] && l[0][1] === current[1][1]);
            if (next[0][0] === start[0][0] && next[0][1] === start[0][1]) { end = true;}
            current = next;
            if (count > lines.length + 1) { end = true; console.log('did not exit')}
        }
        //console.log('polyline points: ' + result.points.length)

        return result;
    }
}