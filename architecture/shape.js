import { boundingbox } from '../utils/boundingbox';
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