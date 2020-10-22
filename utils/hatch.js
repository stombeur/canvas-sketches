import { boundingbox } from "./boundingbox";
import { polyline } from "./polyline";
const polybool = require('polybooljs');

export class hatch {
    constructor() {

    }

    static inside(border, angle = 30, spacing = 1) {
        if (spacing < 0.2) { throw Error('spacing too small'); }
        let result = [];

        let bb = boundingbox.from(border);
        let bbpad = boundingbox.from(bb.points, Math.max(bb.width, bb.height)/2);
        
        let poly2 = {
            regions: [
              [...border]
            ],
            inverted: false
          }

        for (let i = 0; i < Math.floor(bbpad.height / spacing) + 1; i++) {
            let l = new polyline([
                                [bbpad.left, bbpad.top + i * spacing], 
                                [bbpad.right, bbpad.top + i * spacing],
                                [bbpad.right, bbpad.top + (i+1) * spacing],
                                [bbpad.left, bbpad.top + (i+1) * spacing]
                            ]);
            let rl = l.rotate(bbpad.center, angle);
            
            let poly1 = {
                regions: [
                  rl.points
                ],
                inverted: false
              }

            let int = polybool.intersect(poly1, poly2);

            for (let r = 0; r < int.regions.length; r++) {
                new polyline(int.regions[r]).tolines().forEach(l => {
                    let a = Math.round(polyline.angle(l));
                    if (a === angle || (a+180) === angle || (a-180) === angle){
                        result.push(l);
                    }
                })
            }
        }

        return result;
    }
}