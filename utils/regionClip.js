import { polyline } from './polyline';

const polybool = require('polybooljs');

export class clipregion {
    
    constructor(points) {
        if (points) {this.regions.push(points);}
    }

    addRegion(region) {
        this.regions.push(region);
    }

    regions = [];
    inverted = false;

    diff(regions) {
        let difference = polybool.difference(this, regions);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    intersect(regions) {
        let difference = polybool.intersect(this, regions);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    xor(regions) {
        let difference = polybool.xor(this, regions);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    diffRev(regions) {
        let difference = polybool.differenceRev(this, regions);
        let result = new clipregion();
        result.regions = difference.regions;
        result.inverted = difference.inverted;
        return result;
    }

    move(vector) {
        this.regions = this.regions.map(r => new polyline(r).move(vector).points);
        return this;
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

    toLines() {
        let lines = [];
        let result = [...lines.concat(...this.regions.map(r => new polyline(r).tolines()))];
        return result;
    }
}

