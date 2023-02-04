import { boundingbox } from '../utils/boundingbox';
import { clipregion } from '../utils/clipregion';
import { point } from '../utils/point';
import { polyline } from '../utils/polyline';

export class Shape {
    points = [];
    polyline;

    constructor(...points) { // 
        this.points.push(...points);
        this.polyline = new polyline(this.points);
    }

    bb(padding = 0) {
        return boundingbox.from(this.points, padding);
    }

    toLines() {
        return this.polyline.toLines();
    }

    copy(moveX = 0, moveY = 0) {
        let copiedPoints = this.points.map(p => p.copy(moveX, moveY));
        return new Shape(...copiedPoints);
    }

    toClipRegion() {
        return this.polyline.toClipRegion();
    }

    subtractShape(other) {
        return this.toClipRegion().subtract(other.toClipRegion());
    }

    addShape(other) {
        return this.toClipRegion().add(other.toClipRegion());
    }

    bisect(line, repel) {
        
    }
}

export class SymmetricCross extends Shape {
    constructor(x, y, width, shortSide = width/3) {
        let longSide = (width - shortSide) / 2;

        super(...SymmetricCross.calculatePoints(x, y, shortSide, longSide))
    }

    static calculatePoints(x, y, shortSide, longSide) {
        let points = [];
        let start = new point(x+longSide, y);

        /* start V
                 +  +   
              +  +  +  +
              +  +  +  +
                 +  + 
            rotate clockwise
        */
        let next = start.copy();
        points.push(next);
        next = next.copy(shortSide, 0);
        points.push(next);
        next = next.copy(0, longSide);
        points.push(next);
        next = next.copy(longSide, 0);
        points.push(next);
        next = next.copy(0, shortSide);
        points.push(next);
        next = next.copy(-longSide, 0);
        points.push(next);
        next = next.copy(0, longSide);
        points.push(next);
        next = next.copy(-shortSide, 0);
        points.push(next);
        next = next.copy(0, -longSide);
        points.push(next);
        next = next.copy(-longSide, 0);
        points.push(next);
        next = next.copy(0, -shortSide);
        points.push(next);
        next = next.copy(longSide, 0);
        points.push(next);

        return points;
    }


}

export class House extends Shape {
    constructor(x, y, width, height, roofHeight) {
        super(...House.calculatePoints(x, y, width, height, roofHeight))
    }

    static calculatePoints(x, y, width, height, roofHeight = width/2) {
        let points = [];
        let start = new point(x + width, y + roofHeight);

        /* start     |
                   + V
                 +   +
                 
                 +   +
            rotate clockwise
        */
        let next = start.copy();
        points.push(next);
        next = next.copy(0, height);
        points.push(next);
        next = next.copy(-width, 0);
        points.push(next);
        next = next.copy(0, -height);
        points.push(next);
        next = next.copy(width/2, -roofHeight);
        points.push(next);

        return points;
    }


}

export class DoubleCross extends Shape {
    constructor(center, width, height, thickness) {
        super(...DoubleCross.calculatePoints(center, width, height, thickness))
    }

    static calculatePoints(center, width, height, thickness = width/2) {
        let points = [];
        let start = new point(center[0] - thickness/2, center[1]);

        /* start (anti-clockwise)
                    + +
                 +  + +  +
                 +  + +  +  
                   >+ +
                  + + + +
                  + + + +
                    
                    + +
                 
                 
            rotate clockwise
        */
        let next = start.copy();
        points.push(next);

        next = next.copy(0, thickness);
        points.push(next);

        next = next.copy(-thickness*2, 0);
        points.push(next);

        next = next.copy(0, thickness);
        points.push(next);

        next = next.copy(thickness*2, 0);
        points.push(next);

        next = next.copy(0, thickness*4);
        points.push(next);

        next = next.copy(thickness, 0);
        points.push(next);

        next = next.copy(0, -thickness*4);
        points.push(next);

        next = next.copy(thickness*2, 0);
        points.push(next);

        next = next.copy(0, -thickness);
        points.push(next);

        next = next.copy(-thickness*2, 0);
        points.push(next);
        
        next = next.copy(0, -thickness * 2);
        points.push(next);

        next = next.copy(-thickness/2 + width/1.8, 0);
        points.push(next);

        next = next.copy(0, -thickness);
        points.push(next);

        next = next.copy(thickness/2 - width/1.8, 0);
        points.push(next);

        next = next.copy(0, -thickness*4);
        points.push(next);

        next = next.copy(-thickness, 0);
        points.push(next);

        next = next.copy(0, thickness*4);
        points.push(next);

        next = next.copy(thickness/2 - width/1.8, 0);
        points.push(next);

        next = next.copy(0, thickness);
        points.push(next);

        next = next.copy(-thickness/2 + width/1.8, 0);
        points.push(next);

        next = next.copy(0, thickness);
        points.push(next);

        return points;
    }


}

export class IndentedBorder {
    constructor(center, width, height, thickness) {
        this.regions_ = this.determineRegions(center, width, height);

    }

    regions_ = [];

    get regions() {
        return this.regions_;
    }

    determineRegions(center, width, height) {
        let p = width/20;
        let bb = boundingbox.fromWH(center, width-p, height-p);
        let pad = width/10

        let points = [];
        let start = new point(center[0] - width/2 + pad, center[1] - height/2 + pad);
        points.push(start);

        let next = start.copy(width/2 - pad, -pad/2);
        points.push(next);

        next = next.copy(width/2 - pad, pad/2);
        points.push(next);

        next = next.copy(0, height - pad*2);
        points.push(next);

        next = next.copy(-width/2 + pad,  pad/2);
        points.push(next);

        next = next.copy(-width/2 + pad,  -pad/2);
        points.push(next);


        let clip1 = bb.toClipRegion();
        let clip2 = new clipregion(points);

        let result = clip1.subtract(clip2);
        return result.regions;

    }


}

export class RectangularBorder {
    constructor(center, width, height, thickness = width/100, padding = 0) {
        this.regions_ = this.determineRegions(center, width, height, thickness, padding);

    }

    regions_ = [];

    get regions() {
        return this.regions_;
    }

    determineRegions(center, width, height, thickness, padding) {
        let p = padding;
        let bb = boundingbox.fromWH(center, width-p, height-p);
        let pad = thickness;

        let points = [];
        let start = new point(center[0] - width/2 + pad, center[1] - height/2 + pad);
        points.push(start);



        let next = start.copy(width - pad*2, 0);
        points.push(next);

        next = next.copy(0, height - pad*2);
        points.push(next);

        next = next.copy(-width +2*pad,  0);
        points.push(next);

        next = next.copy(0, -height + pad*2);
        points.push(next);


        let clip1 = bb.toClipRegion();
        let clip2 = new clipregion(points);

        let result = clip1.subtract(clip2);
        return result.regions;

    }


}