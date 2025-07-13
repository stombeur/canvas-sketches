import { boundingbox } from '../utils/boundingbox';
import { clipregion } from '../utils/clipregion';
import { point } from '../utils/point';
import { polyline } from '../utils/polyline';
const poly = require('../utils/poly.js');

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

export class TurtleShape extends Shape {
    static Left = 'L';
    static Right = 'R';
    static Down = 'D';
    static Up = 'U'

    constructor(start, step, path) {
        super(...TurtleShape.WalkPath(start, step, path));
    }

    static WalkPath(start, step, path) {
        let points = [];
        let first = new point(start[0], start[1]);
        let next = first.copy();
        points.push(next);

        for (let i = 0; i < path.length; i++) {
            const element = path[i];
            
            switch (element) {
                case TurtleShape.Right:
                    next = next.copy(step, 0);
                    break;
                case TurtleShape.Left:
                    next = next.copy(-step, 0);
                    break;
                case TurtleShape.Down:
                    next = next.copy(0, step);
                    break;
                case TurtleShape.Up:
                    next = next.copy(0, -step);
                    break;
                default:
                    break;
            }
            
            points.push(next);

        }

        let bb = boundingbox.from(new polyline(points));
        let moveleft = bb.width/2;
        let moveup = bb.height/2;

        points.forEach(p => p.move(-moveleft, -moveup));
        return points;
    }

}


export class CompositeShape {
    regions = [];

    constructor() { 
    }

    addRegion(region) {
        this.regions.push(region);
    }

    bb(padding = 0) {
        return boundingbox.from(this.regions.flat(), padding);
    }

    toLines() {
        let lines = [];
        lines.push(...this.regions.map(r => new polyline(r).toLines()));
        return lines;
    }

    toClipRegion() {
        let c = new clipregion();
        this.regions.map(r => c.addRegion(r));
        return c;
    }


}

export class FloodfillShape extends CompositeShape {
    constructor(grid, elementHeight, elementWidth, center) {
        super();
        FloodfillShape.createRegions(grid, elementHeight, elementWidth, center).map(r => this.addRegion(r))
    }

    static createRegions(grid, elementHeight, elementWidth, center) {

        let rows = grid.length;
        let columns = grid[0].length;
        let xoffset = center[0] - (elementWidth * columns)/2 , yoffset = center[1] - (elementHeight * rows)/2;

        let regions = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                if (grid[r][c] < 1) continue;
                let y = yoffset + r * elementHeight;
                let x = xoffset + c * elementWidth;

                let points = [];
                let next = new point(x, y); points.push(next);
                next = next.copy(elementWidth, 0); points.push(next);
                next = next.copy(0, elementHeight); points.push(next);
                next = next.copy(-elementWidth, 0); points.push(next);
                //next = next.copy(0, -elementHeight); points.push(next);



                regions.push(points)
            }         
        }

        let c = new clipregion(regions[0]);
        for (let r = 1; r < regions.length; r++) {
            let d = new clipregion(regions[r]);
            c = c.add(d);
        }

        return c.regions;
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
        let w = width;

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

        next = next.copy(-thickness/2 + w, 0);
        points.push(next);

        next = next.copy(0, -thickness);
        points.push(next);

        next = next.copy(thickness/2 - w, 0);
        points.push(next);

        next = next.copy(0, -thickness*4);
        points.push(next);

        next = next.copy(-thickness, 0);
        points.push(next);

        next = next.copy(0, thickness*4);
        points.push(next);

        next = next.copy(thickness/2 - w, 0);
        points.push(next);

        next = next.copy(0, thickness);
        points.push(next);

        next = next.copy(-thickness/2 + w, 0);
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

export class HH extends CompositeShape {
    constructor(center, letter_width) {
        super();
        HH.createRegions(center,letter_width).map(r => this.addRegion(r))
    }

    static createRegions(center, letter_width) {
        let regions = [];

        let spacing = letter_width / 4;
        let h_width = letter_width;
        let h_thick = letter_width / 3;
        let h_height = letter_width * 2;
        let bracket_thick = letter_width / 4 / 1.6;
        let bracket_height = letter_width * 2.5;
        let bracket_width = letter_width / 2.6;

        let points = [];
        let p = new point(... center);

        // H right of center
        p = p.copy(spacing/2, 0); points.push(p);
        p = p.copy(0, -h_height/2); points.push(p);
        p = p.copy(h_thick, 0); points.push(p);
        p = p.copy(0, h_height/2 - h_thick/2); points.push(p);
        p = p.copy(h_width - 2* h_thick, 0); points.push(p);
        p = p.copy(0, -(h_height/2 - h_thick/2)); points.push(p);
        p = p.copy(h_thick, 0); points.push(p);
        p = p.copy(0, h_height); points.push(p);
        p = p.copy(-h_thick, 0); points.push(p);
        p = p.copy(0, -(h_height/2 - h_thick/2)); points.push(p);
        p = p.copy(-(h_width - 2* h_thick), 0); points.push(p);
        p = p.copy(0, h_height/2 - h_thick/2); points.push(p);
        p = p.copy(-h_thick, 0); points.push(p);
        p = p.copy(0, -h_height/2); points.push(p);

        // add h to regions
        regions.push(points);

        // mirror h and add to regions
        points = points.map(p => p.rotate(center, 180));
        regions.push(points);
        points = [];


        // ] right of center
        p = new point(... center);
        p = p.copy(spacing/2 + h_width + spacing/2 + bracket_width - bracket_thick, 0); points.push(p);
        p = p.copy(0, -bracket_height/2 + bracket_thick); points.push(p);
        p = p.copy(-bracket_width + bracket_thick, 0); points.push(p);
        p = p.copy(0, -bracket_thick); points.push(p);
        p = p.copy(bracket_width, 0); points.push(p);
        p = p.copy(0, bracket_height); points.push(p);
        p = p.copy(-bracket_width, 0); points.push(p);
        p = p.copy(0, -bracket_thick); points.push(p);
        p = p.copy(bracket_width - bracket_thick, 0); points.push(p);
        p = p.copy(0, -bracket_height/2 + bracket_thick); points.push(p);
        
        // add ] to regions
        regions.push(points);
        
        // mirror ] and add to regions
        points = points.map(p => p.rotate(center, 180));
        regions.push(points);
        points = [];

        return regions;
    }


}

export class ITPLogo extends CompositeShape {
    constructor(center, letter_width) {
        super();
        ITPLogo.createRegions(center,letter_width).map(r => this.addRegion(r))
    }

    static createRegions(center, letter_width) {
        let regions = [];

        let thick = letter_width / 3.2;
        let height = letter_width * 1.2;
        let offset_curve = thick /2;

        let cross_square = thick, cross_extra = thick * 2/3;
        

        let points = [];
        let p = new point(... center);

        // U
        p = p.copy(-letter_width/2, -height/2); points.push(p);
        p = p.copy(thick, 0); points.push(p);
        p = p.copy(0, height - thick + offset_curve); points.push(p);

        let lp = p.copy(0,0)
        let rp = p.copy(letter_width - thick*2, 0)
        let cp = new point(... center);
        cp = cp.copy(0, thick/2 )

        let aa = polyline.angle([[rp[0], rp[1]], [cp[0], cp[1]]]);
        let ab = polyline.angle([[lp[0], lp[1]], [cp[0], cp[1]]]);
        let a = Math.abs(aa - ab);

        let smallsegments = 10;
        for (let i = 1; i <= smallsegments; i++) {
            points.push(lp.rotate(cp, -a / smallsegments * i));
        }


        p = rp.copy(0, -height + thick - offset_curve + 3*thick); points.push(p);
        let cross_start = p.copy(0, thick - cross_extra);
        p = p.copy(0, -cross_extra/2); points.push(p);
        p = p.copy(thick, 0); points.push(p);
        p = p.copy(0, +cross_extra/2); points.push(p);
        p = p.copy(0, height - 3*thick); points.push(p);

        rp = p.copy(0,0);
        lp = p.copy(-letter_width, 0);
        cp = new point(... center);
        cp = cp.copy(0, thick/2)
        console.log(rp, lp, cp)

        aa = polyline.angle([[rp[0], rp[1]], [cp[0], cp[1]]]);
        ab = polyline.angle([[lp[0], lp[1]], [cp[0], cp[1]]]);
        a = Math.abs(aa - ab);

        let bigsegments = 30;
        for (let i = 1; i <= bigsegments; i++) {
            points.push(rp.rotate(cp, a / bigsegments * i));
        }

        p = lp.copy(0, -height); points.push(p);






        // add h to regions
        regions.push(points);


        // cross region
        let points2 = [];
        p = cross_start.copy(0,-thick); points2.push(p);
        p = p.copy(thick, 0); points2.push(p);
        p = p.copy(0, -cross_extra); points2.push(p);
        p = p.copy(cross_extra, 0); points2.push(p);
        p = p.copy(0, -thick); points2.push(p);
        p = p.copy(-cross_extra, 0); points2.push(p);
        p = p.copy(0, -cross_extra); points2.push(p);
        p = p.copy(-thick, 0); points2.push(p);
        p = p.copy(0, cross_extra); points2.push(p);
        p = p.copy(-cross_extra, 0); points2.push(p);
        p = p.copy(0, thick); points2.push(p);
        p = p.copy(cross_extra, 0); points2.push(p);
        p = p.copy(0, cross_extra); points2.push(p);
        

        regions.push(points2);

        return regions;
    }


}

export class ChristmasTree extends CompositeShape {
    constructor(center, width, height) {
        super();
        ChristmasTree.createRegions(center, width, height).map(r => this.addRegion(r))
    }

    static createRegions(center, width, height) {
        let regions = [];
              
        let points = [];
        let p = new point(center[0], center[1] - height/2); // top of the tree, middle
        points.push(p);
        
        let trunk_width = height * 1/10;
        let trunk_height = height * 1/8;
        let w = width/2 + trunk_width/2;
        
        let j = w/6;
        let d = j * 1/3;
        

        // sawtooth down right
        p = p.copy(w/3 +d, height * 5/6 * 1/3); points.push(p);
        p = p.copy(-j, 0); points.push(p);
        p = p.copy(w/3 +d, height * 5/6 * 1/3); points.push(p);
        p = p.copy(-j, 0); points.push(p);
        p = p.copy(w/3 +d, height * 5/6 * 1/3); points.push(p);

        // go back to the middle, 1/2 of width - 1/12 of height
        p = p.copy(-width/2 + trunk_width/2, 0); points.push(p);

        //
        // go down 1/6 of height
        p = p.copy(0, trunk_height); points.push(p);
        // go left 1/6 of height
        p = p.copy(-trunk_width, 0); points.push(p);
        // go up 1/6 of height
        p = p.copy(0, -trunk_height); points.push(p);

        // go left to 0
        p = p.copy(-width/2 + trunk_width/2, 0); points.push(p);

        p = p.copy(w/3 +d, -height * 5/6 * 1/3); points.push(p);
        p = p.copy(-j, 0); points.push(p);
        p = p.copy(w/3 +d, -height * 5/6 * 1/3); points.push(p);
        p = p.copy(-j, 0); points.push(p);


        regions.push(points);


        return regions;
    }


    
}

export class GradientLines extends CompositeShape {
    constructor(center, width, height, steps = 20) {
        super();
        GradientLines.createRegions(center, width, height, steps).map(r => this.addRegion(r))
    }

    static createRegions(center, width, height, steps) {
        let regions = [];
    
        let partwidths = [];
        let lastpartwidth = width / (steps *(steps+1)/2) /2;

        let gap = lastpartwidth*steps;

        for (let i = 0; i < steps; i++) {
            let partwidth = lastpartwidth * (steps - i);
            partwidths.push(partwidth);
        }

        let position = center[0] - width/2;

        partwidths.forEach((partwidth, i) => { 
            let points = [];
            
            let p = new point(position, center[1] - height/2);
            points.push(p);
            p = p.copy(partwidth, 0);
            points.push(p);
            p = p.copy(0, height);
            points.push(p);
            p = p.copy(-partwidth, 0);
            points.push(p);

            regions.push(points);

            position += partwidth + gap;
        });

        return regions;
    }
}