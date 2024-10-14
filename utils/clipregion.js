import { boundingbox } from './boundingbox';
import { polyline } from './polyline';
import { point } from "./point";


const polybool = require('polybooljs');

export class clipregion {
    
    constructor(points) {
        if (points) {this.regions.push(points);}
    }

    addRegion(region) {
        // deep copy region array of arrays
        let regionCopy = JSON.parse(JSON.stringify(region));
        this.regions.push(regionCopy);
    }

    regions = [];
    inverted = false;

    diff(other) {
        let difference = polybool.difference(this, other);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    subtract(other) {
        let originalInverted = this.inverted;

        //this.inverted = true;
        let difference = polybool.difference(this, other);

        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;

        this.inverted = originalInverted;
        return result;
    }

    add(other) {
        let union = polybool.union(this, other);
        let result = new clipregion();
        result.regions = union.regions;
        result.inverted = union.inverted;
        return result;
    }

    union(other) {
        let difference = polybool.union(this, other);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    intersect(other) {
        let difference = polybool.intersect(this, other);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    // xor(regions) {
    //     let difference = polybool.xor(this, regions);
    //     let result = new clipregion();
    //     result.regions = difference.regions;
    //     result.inverted = difference.inverted;
    //     return result;
    // }

    // diffRev(regions) {
    //     let difference = polybool.differenceRev(this, regions);
    //     let result = new clipregion();
    //     result.regions = difference.regions;
    //     result.inverted = difference.inverted;
    //     return result;
    // }

    move(vector) {
        this.regions = this.regions.map(r => new polyline(r).move(vector).points);
        return this;
    }

    copy(vector) {
        
        let cl = new clipregion()
        this.regions.forEach(r => {
            let newr = r.map(p => new point(...p).copy(...vector));
            cl.addRegion(newr)
        })
        return cl;
    }

    static join(... clipRegions){
        let result = new clipregion();
        clipRegions.forEach(cr => { cr.regions.map(r => result.addRegion(r)); });
        return result;
    }

    splitHorizontally([left, right], bounds, vector) {
        let regionTop = new polyline([[bounds.left, bounds.top], left, right, [bounds.right, bounds.top]]).toClipRegion();
        let regionBottom = new polyline([[bounds.left, bounds.bottom], left, right, [bounds.right, bounds.bottom]]).toClipRegion();

        let resultTop = this.diff(regionBottom).move([-vector[0], -vector[1]]);
        let resultBottom = this.diff(regionTop).move([vector[0], vector[1]]);

        return clipregion.join(resultTop, resultBottom);
    }

    splitVertically([top, bottom], bounds, vector) {
        let regionLeft = new polyline([[bounds.left, bounds.top], top, bottom, [bounds.left, bounds.bottom]]).toClipRegion();
        let regionRight = new polyline([[bounds.right, bounds.top], top, bottom, [bounds.right, bounds.bottom]]).toClipRegion();

        let resultLeft = this.diff(regionRight).move([-vector[0], -vector[1]]);
        let resultRight = this.diff(regionLeft).move([vector[0], vector[1]]);

        return clipregion.join(resultLeft, resultRight);
    }

    split(line, bbox, moveMultiplier=1) {
        
        let pv = polyline.perpendicularVector(line);
        pv = [pv[0]*moveMultiplier, pv[1]*moveMultiplier];
       
        let [pline1, pline2] = bbox.bisect(line);

        if (pline1 && pline2) {
            let region1 = pline1.toClipRegion();
            let centroid1 = pline1.centroid();
            let sp1 = polyline.getSpPoint(centroid1, line[0], line[1]);
            let d1 = sp1.distanceTo(centroid1);
            let v1 = [moveMultiplier*(centroid1.x - sp1.x)/d1 , moveMultiplier*(centroid1.y-sp1.y)/d1];
            
            let region2 = pline2.toClipRegion();
            let centroid2 = pline2.centroid();
            let sp2 = polyline.getSpPoint(centroid2, line[0], line[1]);
            let d2 = sp2.distanceTo(centroid2);
            let v2 = [moveMultiplier*(centroid2.x-sp2.x)/d2 , moveMultiplier*(centroid2.y-sp2.y)/d2];


            
            // let result1 = this.diff(region2).move([-pv[0], -pv[1]]);
            // let result2 = this.diff(region1).move([pv[0], pv[1]]);
            let result1 = this.diff(region1).move(v1);
            let result2 = this.diff(region2).move(v2);
    
            //return result1.add(result2);
            return clipregion.join(result1, result2);
           // return result1.add(result2);
        }
        else {
            return this;
        }   
    }

    toLines() {
        let lines = [];
        let result = [...lines.concat(...this.regions.map(r => new polyline(r).toLines()))];
        return result;
    }

    deepCopy() {
        let result = new clipregion();
        result.inverted = this.inverted;

        result.regions = this.regions.map(r => structuredClone(r));

        return result;
    }

    bb(padding = 0) {
        return boundingbox.from(this.regions.flat(), padding);
    }

    toPoints() {
        return this.regions.flat();
    }
}

