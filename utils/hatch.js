import { boundingbox } from "./boundingbox";
import { clipregion } from "./clipregion";
import { point } from "./point";
import { polyline } from "./polyline";
const polybool = require("polybooljs");

export class hatch {
  constructor() {}

  static drawSnake (center, width, height, spacing) {
    let points = [];
  
    let bb = boundingbox.fromWH(center, width, height);
    let padH = spacing;
    let padW = padH / 4;
  
    let hh = bb.height - padH * 3;
    let j = Math.ceil(hh / (padH * 4));
  
    let start = new point(bb.left, bb.top);
    points.push(start);
  
    // open outside
    let next = start.copy(bb.width, 0);
    points.push(next);
    next = next.copy(0, padH * 3);
    points.push(next);
  
    for (let i = 0; i < j; i++) {
      next = next.copy(-bb.width + padW, 0);
      points.push(next);
      next = next.copy(0, padH);
      points.push(next);
      next = next.copy(bb.width - padW, 0);
      points.push(next);
      next = next.copy(0, padH * 3);
      points.push(next);
    }
  
  
    // close outside
    next = next.copy(-bb.width /* NO PAD */, 0); points.push(next);
  
    //switch direction
  
    // open inside
    next = next.copy(0, -padH);
    points.push(next);
    next = next.copy(bb.width - padW, 0);
    points.push(next);
    next = next.copy(0, -padH);
    points.push(next);
  
    for (let i = 0; i < j; i++) {
      next = next.copy(-bb.width + padW, 0);
      points.push(next);
      next = next.copy(0, -3 * padH);
      points.push(next);
      next = next.copy(bb.width - padW, 0);
      points.push(next);
      next = next.copy(0, -padH);
      points.push(next);
    }
    // close inside
    next = next.copy(-bb.width + padW, 0); points.push(next);
  
    return points;
  };

  static inside2(border, angle = 30, spacing = 1, otherBorders = []) {
    if (spacing < 0.2) {
      throw Error("spacing too small");
    }

    // check if this is inside some other border
    // if not, then list the borders that are inside this one
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
        }
      }
      if (isinsideotherline) {
        // not drawing hatch, fully inside other region
        return;
      }
    }

    let result = [];

    // create boundingbox that is larger on all sides than the border by half its height or width
    // to have enough room to cut into the hatchline after rotation
    let bb = boundingbox.from(border);
    let bbpad = boundingbox.from(border, Math.max(bb.width, bb.height) / 2);

    // the border that will cut the hatchlines
    let poly2 = new clipregion(border);

    let snakePoints = this.drawSnake(bbpad.center, bbpad.width, bbpad.height, spacing);
    let snakePLine = new polyline(snakePoints);
    snakePLine = snakePLine.rotate(bbpad.center, angle);
    let poly1 = new clipregion(snakePLine.points);
    let int = poly2.intersect(poly1);

    if (bordersInside && bordersInside.length > 0) {
      bordersInside.forEach(bi => {
        int = int.subtract(new clipregion(bi));
      })
    }

    for (let r = 0; r < int.regions.length; r++) {
      new polyline(int.regions[r]).toLines().forEach((l) => {
        if (point.distanceBetween(l[0], l[1]) >= spacing) {
          let a = Math.round(polyline.angle(l));
          if (a === angle || a + 180 === angle || a - 180 === angle) {
            result.push(l);
          }
      }
      });
    }

    return result;
  }

  static inside(border, angle = 30, spacing = 1, otherBorders = []) {
    if (spacing < 0.2) {
      throw Error("spacing too small");
    }

    // check if this is inside some other border
    // if not, then list the borders that are inside this one
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
        }
      }
      if (isinsideotherline) {
        // not drawing hatch, fully inside other region
        return;
      }
    }

    let result = [];

    // create boundingbox that is larger on all sides than the border by half its height or width
    // to have enough room to cut into the hatchline after rotation
    let bb = boundingbox.from(border);
    let bbpad = boundingbox.from(border, Math.max(bb.width, bb.height) / 2);

    // the border that will cut the hatchlines
    let poly2 = new clipregion(border);

    // space out the lines according to the total height of the box
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
          if (point.distanceBetween(l[0], l[1]) >= spacing) {
            let a = Math.round(polyline.angle(l));
            if (a === angle || a + 180 === angle || a - 180 === angle) {
              result.push(l);
            }
        }
        });
      }
    }

    return result;
  }
}
