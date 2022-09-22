import { clip } from "../utils/poly";
import { point } from "./point";
import { clipregion } from "./clipregion";
import { OutlineSphere } from "@lnjs/core";
const poly = require('../utils/poly');
import { polyline } from "./polyline";

export class arc {
    constructor(center, radius, startAngle = null, endAngle = null) {
        //console.log(center)
        if (center) { 
            if (center.x) {this.c = center}
            else {this.c = new point(center[0], center[1])}
             }
        this.r = radius;
        if (startAngle) { this.sAngle = startAngle; }
        if (endAngle) { this.eAngle = endAngle; }
    }

    c = new point(0, 0);
    r = 1;
    sAngle = 0;
    eAngle = 360;


    rotate(center, angle) {
        let rotatedPoints = this.points.map(p => {
            let pp = new point(...p);
            let ppr = pp.rotate(center,angle);
            return [ppr.x, ppr.y];
        });
        return new polyline(rotatedPoints);
    }

    move(vector) {
        if (this.c) { this.c = poly.movePoly(this.c, vector); }
        return this;
    }

    // intersect(circle) {
    //     // check if circles really intersect
    //     let R = Math.sqrt( Math.pow(this.c.x - circle.c.x, 2) + Math.pow(this.c.y - circle.c.y, 2))
    //     if (R >= this.r + circle.r) {
    //         console.log("no intersection");
    //         return null;
    //     }
    // }

    intersect(circle) {//x1,y1,r1, x2,y2,r2) {
        let [x1, y1, r1] = [this.c.x, this.c.y, this.r]
        let [x2, y2, r2] = [circle.c.x, circle.c.y, circle.r]

        var centerdx = x1 - x2;
        var centerdy = y1 - y2;
        var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
        if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
          return []; // empty list of results
        }
        // intersection(s) should exist
      
        var R2 = R*R;
        var R4 = R2*R2;
        var a = (r1*r1 - r2*r2) / (2 * R2);
        var r2r2 = (r1*r1 - r2*r2);
        var c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);
      
        var fx = (x1+x2) / 2 + a * (x2 - x1);
        var gx = c * (y2 - y1) / 2;
        var ix1 = fx + gx;
        var ix2 = fx - gx;
      
        var fy = (y1+y2) / 2 + a * (y2 - y1);
        var gy = c * (x1 - x2) / 2;
        var iy1 = fy + gy;
        var iy2 = fy - gy;

        let a1 = polyline.angle([[ix1, iy1], this.c])
        let a2 = polyline.angle([[ix2, iy2], this.c])

        let result = {
            a: [a1, a2],
            p: [[ix2, iy2], [ix1, iy1]]
        }

        // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
        // but that one solution will just be duplicated as the code is currently written
        return result;
      }

      intersects(circles) {
        let result = []
        for (let i = 0; i < circles.length; i++) {
            const element = circles[i];
            let x = this.intersect(element)
            if (x.a) {
              result.push(x.a)
            }
        }
        result = this.reduceOverlappingSections(result)
        return result
      }
    
    reduceOverlappingSections(sections, max = 360) {
        let overlaps = true;
        //console.log(sections)
        while(overlaps) {
            overlaps = false;
            let swap = [];
            sections.forEach((el, i, arr) =>{
                let f = arr.filter((a, j) =>  ((a[0] >= el[0] && a[0] <= el[1] ) || (a[1] >= el[0] && a[1] <= el[1])));
                if (f.length === 1 && swap.findIndex(x => x[0] === f[0][0] && x[1] === f[0][1]) === -1) {
                    swap.push(...f)
                }
                if (f.length > 1) {
                    f.sort((a,b) => a[0] - b[0])
                    let e = [Math.min(...f.map(e => e[0])), Math.max(... f.map(e=> e[1]))]
                    if (swap.findIndex(x => x[0] === e[0] && x[1] === e[1]) === -1) { swap.push(e); overlaps = true;} 
                }
            }
            )

            if (!overlaps) break;
            
            swap.sort((a,b) => a[0] - b[0])
            // swap.forEach(el => {
            //     el[0] = el[0] % max;
            //     el[1] = el[1] % max;
            // })
            
            //console.log(swap)
            sections = swap
        }

        let out = []
        for (let i = 0; i < sections.length ; i++) {
            out.push([sections[i][1], sections[(i+1)%sections.length][0]])
        }

        return out
    }
}