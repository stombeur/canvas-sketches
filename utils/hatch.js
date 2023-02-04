import { boundingbox } from "./boundingbox";
import { clipregion } from "./clipregion";
import { polyline } from "./polyline";
const polybool = require("polybooljs");

export class hatch {
  constructor() {}

  static inside(border, angle = 30, spacing = 1, otherBorders = []) {
    if (spacing < 0.2) {
      throw Error("spacing too small");
    }

    let bordersInside = [];
    if (otherBorders && otherBorders.length > 0) {
      let isinsideotherline = false;
      const my = new polyline(border);

      for (let i = 0; i < otherBorders.length; i++) {
        const other = new polyline(otherBorders[i]);
        isinsideotherline =
          isinsideotherline || other.overlapsWith(border).isinside;
        
        if (my.overlapsWith(otherBorders[i]).isinside) { 
          bordersInside.push(otherBorders[i]);
          //console.log('other border is inside this')
        }
      }
      if (isinsideotherline) {
        //console.log("not drawing hatch, fully inside other region");
        return;
      }
    }
    //console.log(bordersInside);

    let result = [];

    let bb = boundingbox.from(border);
    let bbpad = boundingbox.from(bb.points, Math.max(bb.width, bb.height) / 2);

    let poly2 = new clipregion(border);

    for (let i = 0; i < Math.floor(bbpad.height / spacing) + 1; i++) {
      let l = new polyline([
        [bbpad.left, bbpad.top + i * spacing],
        [bbpad.right, bbpad.top + i * spacing],
        [bbpad.right, bbpad.top + (i + 1) * spacing],
        [bbpad.left, bbpad.top + (i + 1) * spacing],
      ]);
      let rl = l.rotate(bbpad.center, angle);

      let poly1 = new clipregion(rl.points);

      let int = poly2.intersect(poly1);
      if (bordersInside && bordersInside.length > 0) {
        bordersInside.forEach(bi => {
          int = int.subtract(new clipregion(bi));
        })
      }

      for (let r = 0; r < int.regions.length; r++) {
        new polyline(int.regions[r]).toLines().forEach((l) => {
          let a = Math.round(polyline.angle(l));
          if (a === angle || a + 180 === angle || a - 180 === angle) {
            result.push(l);
          }
        });
      }
    }

    return result;
  }
}
