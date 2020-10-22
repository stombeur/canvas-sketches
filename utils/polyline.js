import { point } from "./point";


export class polyline {
    constructor(points = null) {
        if (points && Array.isArray(points)) { this.points = points; }
    }

    points = [];

    add(point) {
        this.points.push(point);
    }

    rotate(center, angle) {
        let rotatedPoints = this.points.map(p => {
            let pp = new point(...p);
            let ppr = pp.rotate(center,angle);
            return [ppr.x, ppr.y];
        });
        return new polyline(rotatedPoints);
    }

    tolines() {
        let result = [];

        for (let i = 0; i < this.points.length; i++) {
            let i2 = (i+1)%this.points.length;
            result.push([this.points[i], this.points[i2]]);
        }

        return result;
    }

    sortByLength() {
        return this.tolines().sort((l2, l1) => Math.hypot(l1[1][0]-l1[0][0], l1[1][1]-l1[0][1]) - Math.hypot(l2[1][0]-l2[0][0], l2[1][1]-l2[0][1]));
    }

    static angle(line) {
        let a = Math.atan2(line[0][1] - line[1][1], line[0][0] - line[1][0]) * 180 / Math.PI;
        //console.log(a)
        return a;
    }

    // sortPointsCW() {
    //     this.points.sort((a,b)=>a.y - b.y);

    //     // Get center y
    //     const cy = (points[0].y + points[points.length -1].y) / 2;

    //     // Sort from right to left
    //     points.sort((a,b)=>b.x - a.x);

    //     // Get center x
    //     const cx = (points[0].x + points[points.length -1].x) / 2;

    //     // Center point
    //     const center = {x:cx,y:cy};

    //     // Pre calculate the angles as it will be slow in the sort
    //     // As the points are sorted from right to left the first point
    //     // is the rightmost

    //     // Starting angle used to reference other angles
    //     var startAng;
    //     points.forEach(point => {
    //         var ang = Math.atan2(point.y - center.y,point.x - center.x);
    //         if(!startAng){ startAng = ang }
    //         else {
    //             if(ang < startAng){  // ensure that all points are clockwise of the start point
    //                 ang += Math.PI * 2;
    //             }
    //         }
    //         point.angle = ang; // add the angle to the point
    //     });


    //     // Sort clockwise;
    //     points.sort((a,b)=> a.angle - b.angle);
    // }
}