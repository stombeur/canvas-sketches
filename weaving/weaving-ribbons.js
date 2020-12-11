const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const { createArcPath, createLinePath } = require('../utils/paths');
const poly = require('../utils/poly');
import { point } from '../utils/point'
import { polyline} from '../utils/polyline';
const utils = require('canvas-sketch-util/random');
import {ribbon} from './ribbon';

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const createRibbon = (start, bounds, ribbonLength, ribbonWidth, angle, nrOfLines, slot, ribbons) => {
    let result = {
        outsidelines: [],
        insidelines: []
    };

    let x = start.x;
    let y = start.y;
    let spacing = ribbonWidth / (nrOfLines - 1);
    let length = ribbonLength
    let ribbonLines = [];

    if (y >= bounds.bottom) {return result;}

    let topLine = [[bounds.left-10, bounds.top], [bounds.right+10, bounds.top]];
    let bottomLine = [[bounds.left-10, bounds.bottom], [bounds.right+10, bounds.bottom]];
    let leftline = [[bounds.left, bounds.top-10], [bounds.left, bounds.bottom+10]];
    let rightline = [[bounds.right, bounds.top-10], [bounds.right, bounds.bottom+10]];

    for (let i = 0; i < nrOfLines; i++) {
        y = start.y + i * spacing;
        if (y >= bounds.bottom) {return result;}

        let a = new point(x, y);
        let b = new point(x + length, y);
        b = b.rotate(a, angle);
        let line = [a, b];
        line = clipLine(topLine, line, true);
        line = clipLine(bottomLine, line, false);
         line = clipLine(leftline, line, true);
         line = clipLine(rightline, line, false);
        ribbonLines.push(line);

    }
    let rib = new ribbon(ribbonLines); //{ lines: ribbonLines, left: ribbonLines[0], right: ribbonLines[nrOfLines - 1] };

    let linesToDrawInside = [];
    let linesToDrawOutside = [];

    for (let i = 0; i < ribbonLines.length; i++) {
        let line = ribbonLines[i];
        let outside = (i === 0 || i === (ribbonLines.length-1));
        
        ribbons.forEach(rx => {
            let r = rx.rib;
            let firstPart = clipLine(r.left, line, false);
            firstPart = clipLine(r.right, firstPart, true);
            let secondPart = clipLine(r.right, line, true);
            secondPart = clipLine(r.left, secondPart, false);
            line = [...secondPart];

            if (!lineEquals(line, firstPart)) { outside ? linesToDrawOutside.push(firstPart) : linesToDrawInside.push(firstPart); }
            //if (!lineEquals(line, secondPart)) { linesToDraw.push(secondPart); }

        });
        //if (ribbons.length === 0) { linesToDraw.push(line); }
        outside ? linesToDrawOutside.push(line) : linesToDrawInside.push(line);

    }

    // ribbonLines.forEach(rl => {
    //     let line = rl;
    //     ribbons.forEach(rx => {
    //         let r = rx.rib;
    //         let firstPart = clipLine(r.left, line, false);
    //         firstPart = clipLine(r.right, firstPart, true);
    //         let secondPart = clipLine(r.right, line, true);
    //         secondPart = clipLine(r.left, secondPart, false);
    //         line = [...secondPart];

    //         if (!lineEquals(line, firstPart)) { linesToDraw.push(firstPart); }
    //         //if (!lineEquals(line, secondPart)) { linesToDraw.push(secondPart); }

    //     });
    //     //if (ribbons.length === 0) { linesToDraw.push(line); }
    //     linesToDraw.push(line);
    // });


    ribbons.push({ slot, rib });
    ribbons.sort((a, b) => {
        return a.slot - b.slot;
    });

    linesToDrawOutside.forEach(l => {
        let angle = Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0]) * 180 / Math.PI;
        if ((44.8 < angle && angle < 45.2) || (134.8 < angle && angle < 135.2)) { result.outsidelines.push(l); }
    });
    linesToDrawInside.forEach(l => {
        let angle = Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0]) * 180 / Math.PI;
        if ((44.8 < angle && angle < 45.2) || (134.8 < angle && angle < 135.2)) { result.insidelines.push(l); }
    });

    return result;
}

const lineEquals = (a, b) => {
    return (a[0][0] === b[0][0] && a[0][1] === b[0][1] && a[1][0] === b[1][0] && a[1][1] === b[1][1]);
}

const clipLine = (clip, lineToClip, clipStart = true) => {
    let int = poly.findSegmentIntersection(clip[0], clip[1], lineToClip[0], lineToClip[1]);
    if (!int) { return lineToClip; }

    if (clipStart) {
        return [[int.x, int.y],[lineToClip[1][0], lineToClip[1][1]]];
    }
    else {
        return [[lineToClip[0][0], lineToClip[0][1]],[int.x, int.y]];

    }
}



const sketch = ({ width, height }) => {
    // do random stuff here
   
    let alllines = [];
    
    const prepare = (origin, w, h, opts) => {
        let result = {
            insidelinesleft:  [],
            insidelinesright:  [],
            insidelinescolor: [],
            outsidelines: []
        }
        let ribbons = [];
        
        let horMargin = 0.1;
        let vertMargin = horMargin;
        let drawingHeight = h - (vertMargin * 2);
        let drawingWidth = w - (horMargin * 2);
        let posXLeft = horMargin + origin[0];
        let posXRight = drawingWidth + horMargin  + origin[0];
        let posY = vertMargin - drawingWidth + origin[1];
        
        let nrOfLines = 10;

        let ribbonWidth = w / 12;
        let ribbonWidthAngle = Math.sqrt(2 * Math.pow(ribbonWidth, 2));
        let ribbonLength = Math.sqrt(2 * Math.pow(drawingWidth, 2));

        let nrOfRibbons = Math.floor(drawingHeight/ribbonWidth) + Math.floor(drawingWidth/ribbonWidth) + 1;
        let slotsLeft = utils.shuffle([...Array(nrOfRibbons).keys()]);
        let slotsRight = utils.shuffle([...Array(nrOfRibbons).keys()]);

        let bounds = { left: posXLeft - ribbonWidth, top: vertMargin+origin[1]-ribbonWidth, right: posXRight+ribbonWidth, bottom: vertMargin + drawingHeight +origin[1]+ribbonWidth };
        let i = Math.floor(nrOfRibbons * utils.range(0.54, 0.63));
        let leftcolor =2;
        let rightcolor = 2;
        for (let slot = 0; slot <= i; slot++) {

            let positionLeft = slotsLeft[slot];

            let y = posY + (ribbonWidthAngle * positionLeft);
            let x = posXLeft;//ltr ? posXLeft : posXRight;
            let angle = 45;//ltr ? 45 : 135;

            let r1 = createRibbon(new point(x, y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionLeft, ribbons);
            result.outsidelines.push(...r1.outsidelines);
            if (leftcolor>0 && y > vertMargin && y < h-vertMargin) {  result.insidelinescolor.push(...r1.insidelines); leftcolor--; }
            else { result.insidelinesleft.push(...r1.insidelines); }

            let positionRight = slotsRight[slot];
            y = posY + (ribbonWidthAngle * positionRight);
            x = posXRight;
            angle = 135;

            let r2 = createRibbon(new point(x, y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionRight, ribbons)
            result.outsidelines.push(...r2.outsidelines);
            if (rightcolor>0 && y > vertMargin && y < h-vertMargin) {  result.insidelinescolor.push(...r2.insidelines); rightcolor--; }
            else { result.insidelinesright.push(...r2.insidelines); }
           
        }
        alllines.push(result);
    }

    postcards.drawQuad(prepare, width, height);
    //debugger;

    return ({ context, width, height, units }) => {
        // do drawing stuff here
        let outsidepaths = [];  
        let insidepaths1 = [];  
        let insidepaths2 = [];  
        let insidepathscolor = [];
        let borderpaths = [];

        let margin = 6;

        const draw = (origin, w, h, opts) => {
            let lines = opts.alllines[opts.index-1];
            let bb = { xmin: margin + origin[0], ymin: margin + origin[1], xmax: w - margin + origin[0], ymax: h - margin + origin[1] };

            lines.outsidelines.forEach(l => {
                let clippedLine = poly.clipLineToBB(l, bb);
                if (clippedLine && clippedLine[0]) {
                    outsidepaths.push(createLinePath(clippedLine));
                }
            });
            lines.insidelinesleft.forEach(l => {
                let clippedLine = poly.clipLineToBB(l, bb);
                if (clippedLine && clippedLine[0]) {
                    insidepaths1.push(createLinePath(clippedLine));
                }
            });
            lines.insidelinesright.forEach(l => {
                let clippedLine = poly.clipLineToBB(l, bb);
                if (clippedLine && clippedLine[0]) {
                    insidepaths2.push(createLinePath(clippedLine));
                }
            });
            lines.insidelinescolor.forEach(l => {
                let clippedLine = poly.clipLineToBB(l, bb);
                if (clippedLine && clippedLine[0]) {
                    insidepathscolor.push(createLinePath(clippedLine));
                }
            });

            let box = new polyline([[origin[0]+margin,origin[1]+margin],[origin[0]+margin, origin[1]+h-margin],[origin[0]+w-margin, origin[1]+h-margin],[origin[0]+w-margin, origin[1]+margin]]);
            box.tolines().forEach(l => {
                borderpaths.push(createLinePath(l));
            });
        }

        postcards.drawQuad(draw, width, height, {alllines});

        return renderGroups([borderpaths, outsidepaths, insidepaths1, insidepaths2, insidepathscolor], {
        context, width, height, units
        });
    };
};

canvasSketch(sketch, settings);