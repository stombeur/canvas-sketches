// overlapping squares with hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();
let mainContext = null;
let ribbons = [];
let lines = [];

const settings = {
    dimensions: 'A4',
    orientation: 'portrait',
    pixelsPerInch: 300,
    scaleToView: true,
    units: 'cm',
};



const drawRibbon = (start, bounds, ribbonLength, ribbonWidth, angle, nrOfLines, slot) => {
    let x = start.x;
    let y = start.y;
    let spacing = ribbonWidth / (nrOfLines - 1);
    let length = ribbonLength
    let ribbonLines = [];

    if (y >= bounds.bottom) return;

    let topLine = poly.toLine(poly.point(-10, bounds.top), poly.point(100, bounds.top));
    let bottomLine = poly.toLine(poly.point(-10, bounds.bottom), poly.point(100, bounds.bottom));

    for (let i = 0; i < nrOfLines; i++) {
        y = start.y + i * spacing;
        if (y >= bounds.bottom) return;

        let a = poly.point(x, y);
        let b = poly.point(x + length, y);
        b = poly.rotatePointXY(b, a, angle);
        let line = poly.toLine(a, b);
        line = clipLine(topLine, line, true);
        line = clipLine(bottomLine, line, false);
        ribbonLines.push(line);

    }
    let ribbon = { lines: ribbonLines, left: ribbonLines[0], right: ribbonLines[nrOfLines - 1] };

    let linesToDraw = [];

    ribbonLines.forEach(rl => {
        let line = rl;
        ribbons.forEach(rx => {
            let r = rx.ribbon;
            let firstPart = clipLine(r.left, line, false);
            firstPart = clipLine(r.right, firstPart, true);
            let secondPart = clipLine(r.right, line, true);
            secondPart = clipLine(r.left, secondPart, false);
            line = [...secondPart];

            if (!lineEquals(line, firstPart)) { linesToDraw.push(firstPart); }
            //if (!lineEquals(line, secondPart)) { linesToDraw.push(secondPart); }

        });
        //if (ribbons.length === 0) { linesToDraw.push(line); }
        linesToDraw.push(line);
    });


    ribbons.push({ slot, ribbon });
    ribbons.sort((a, b) => {
        return a.slot - b.slot;
    });

    linesToDraw.forEach(l => {
        let angle = Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0]) * 180 / Math.PI;
        if ((44.8 < angle && angle < 45.2) || (134.8 < angle && angle < 135.2)) { lines.push(l); }
    });

}

const lineEquals = (a, b) => {
    return (a[0][0] === b[0][0] && a[0][1] === b[0][1] && a[1][0] === b[1][0] && a[1][1] === b[1][1]);
}

const clipLine = (clip, lineToClip, clipStart = true) => {
    let int = poly.findSegmentIntersection(clip[0], clip[1], lineToClip[0], lineToClip[1]);
    if (!int) { return lineToClip; }

    if (clipStart) {
        return poly.toLine(poly.point(int.x, int.y), poly.point(lineToClip[1][0], lineToClip[1][1]));
    }
    else {
        return poly.toLine(poly.point(lineToClip[0][0], lineToClip[0][1]), poly.point(int.x, int.y));

    }
}


const sketch = (context) => {



    return ({ context, width, height, units }) => {
        svgFile = new penplot.SvgFile();
        lines = [];
        ribbons = [];
        poly.init(context);

        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = 'black';
        context.lineWidth = 0.01;
        mainContext = context;

        
        let horMargin = 3.5;
        let vertMargin = 3.5;
        let drawingHeight = height - (vertMargin * 2);
        let drawingWidth = width - (horMargin * 2);
        let posXLeft = horMargin;
        let posXRight = drawingWidth + horMargin;
        let posY = vertMargin - drawingWidth;
        let bb = { xmin: 4, ymin: 4, xmax: width - 4, ymax: height - 4 };
        let nrOfRibbons = Math.floor(drawingHeight + drawingWidth) + 1;
    
        let slotsLeft = utils.shuffle([...Array(nrOfRibbons).keys()]);//[23, 26, 32, 44, 17, 28, 41];//[...Array(nrOfRibbons).keys()];
        let slotsRight = utils.shuffle([...Array(nrOfRibbons).keys()]);//[17, 23, 15, 34, 12, 32, 10, 27];//[...Array(nrOfRibbons).keys()];


        let nrOfLines = 4;
       
        let ribbonWidth = 1;
        let ribbonWidthAngle = Math.sqrt(2 * Math.pow(ribbonWidth, 2));
        let ribbonLength = Math.sqrt(2 * Math.pow(drawingWidth, 2));

        // slots = utils.shuffle(slots);

        //console.log({horMargin,vertMargin,height,width,drawingHeight,drawingWidth,posXLeft,posXRight,posY, nrOfRibbons, ribbonWidthAngle, ribbonLength});

        let bounds = { left: posXLeft, top: vertMargin, right: posXRight, bottom: vertMargin + drawingHeight };

        let i = Math.floor(nrOfRibbons  * 0.75);
        for (let slot = 0; slot <= i; slot++) {
            let ltr = true;
            //if (slot%2 > 0) {ltr = false;}
            let positionLeft = slotsLeft[slot];

            let y = posY + (ribbonWidthAngle * positionLeft);
            let x = posXLeft;//ltr ? posXLeft : posXRight;
            let angle = 45;//ltr ? 45 : 135;

            drawRibbon(poly.point(x, y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionLeft);

            let positionRight = slotsRight[slot];
            y = posY + (ribbonWidthAngle * positionRight);
            x = posXRight;
            angle = 135;

            drawRibbon(poly.point(x, y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionRight);

        }

        lines.forEach(l => {
            let clippedLine = poly.clipLineToBB(l, bb);
            if (clippedLine && clippedLine[0]) {
                poly.drawLineOnCanvas(clippedLine);
                svgFile.addLine(clippedLine);
            }
        });

        let box = [[4,4],[4, height-4],[width-4,height-4],[width-4,4]];
        poly.drawPolygonOnCanvas(box);
        svgFile.addLine([[4,4],[4, height-4],[width-4,height-4],[width-4,4]], true);


        return [
            // Export PNG as first layer
            context.canvas,
            // Export SVG for pen plotter as second layer
            {
                data: svgFile.toSvg({
                    width,
                    height,
                    units
                }),
                extension: '.svg',
            }
        ];
    };
};

canvasSketch(sketch, settings);
