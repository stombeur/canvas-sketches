const poly = require('../utils/poly');

export class room {
    constructor(points = null) {
        if (points && Array.isArray(points) && points.length > 0) {
            this.points = points;
        }
        else {
            this.points = [];
        }
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

        return new room(r);
    }

    points = [];
    extrudedSides = [];

    extrudableSides() {
        return [1,2,3,4].filter(x => !this.extrudedSides.includes(x));
    }

    lines() {
        let l = [];
        for (let i = 0; i < this.points.length; i++) {
            let sideNr = i+1;
             if (!this.extrudedSides.includes(sideNr)) { 
               l.push([this.points[i], this.points[(i+1)%this.points.length]]);  
             }
        }

        return l;
    }

    drawLines(fn) {
        this.lines().forEach(l => {
            fn(l);
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

        let re = new room();
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

                re.points.push(p0, p1, p2, p3);
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
                
                re.points.push(p0, p1, p2, p3);
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

                re.points.push(p0, p1, p2, p3);
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

                re.points.push(p0, p1, p2, p3);
                re.extrudedSides.push(2);
                break;
                default:
                    break;
        }

        this.extrudedSides.push(sideNr); 
        //add to extruded!
        return re;

    }
}