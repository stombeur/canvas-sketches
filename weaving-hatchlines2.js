// overlapping squares with hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();
let mainContext = null;
let ribbons = [];

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const splitRibbon = (toSplit, splitter) => {
  

}

const drawRibbonSegment = (start, end, diffX, diffY, nrOfLines) => {
  let lines = [];

  for (let index = 0; index < nrOfLines; index++) {
    let diffVector = poly.point(diffX * index, diffY * index);
    let line = poly.toLine(poly.movePoint(start, diffVector), poly.movePoint(end, diffVector));

    poly.drawLineOnCanvas(mainContext, line);

    lines.push(line);
  }

  return lines;
}

const drawRibbon = (start,bounds,ribbonLength,ribbonWidth,angle,nrOfLines) => {
  let x = start.x;
  let y = start.y;
  let spacing = ribbonWidth / (nrOfLines - 1);
  let length = ribbonLength
  let ribbonLines = [];

  if (y >= bounds.bottom) return;

  let topLine = poly.toLine(poly.point(-10, bounds.top), poly.point(100, bounds.top));
  let bottomLine = poly.toLine(poly.point(-10, bounds.bottom), poly.point(100, bounds.bottom));

  for(let i = 0;i<nrOfLines;i++) {
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
  let ribbon = {lines: ribbonLines, left: ribbonLines[0], right: ribbonLines[nrOfLines - 1]};

  let linesToDraw = [];

  ribbons.forEach(r => {
    ribbonLines.forEach(rl => {
      let lineSegment = clipLine(r.left, rl, false);
      
    });

  });

  ribbons.push(ribbon);

  linesToDraw.forEach(l => {
    poly.drawLineOnCanvas(mainContext, l);
  });
  
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

  
  
  // let o = [];
  // for (let r = 0; r < rows; r++) {
  //   o[r] = [];
  //   for (let i = 0; i < columns; i++) {
  //     let rot = utils.random(-90, 90);
  //     let space = utils.random(0.21,0.27);
  //     let skew1 = utils.random(-0.21,0.17);
  //     let skew2 = utils.random(-0.21,0.17);
  //     o[r].push([rot,space, skew1, skew2]);
  //   }
  // }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;
    mainContext = context;

    let horMargin = 4;
    let vertMargin = 4;
    let drawingHeight = height - (vertMargin *2);
    let drawingWidth = width - (horMargin * 2);
    let posXLeft = horMargin;
    let posXRight = drawingWidth + horMargin;
    let posY = vertMargin - drawingWidth;
   


    let nrOfLines = 4;
    let nrOfRibbons = Math.floor(drawingHeight + drawingWidth) + 1;
    let ribbonWidth = 1;
    let ribbonWidthAngle = Math.sqrt(2 * Math.pow(ribbonWidth,2));
    let ribbonLength = Math.sqrt(2 * Math.pow(drawingWidth,2));

   
    let slotsLeft = [23];//[...Array(nrOfRibbons).keys()];
    let slotsRight = [17];//[...Array(nrOfRibbons).keys()];

   // slots = utils.shuffle(slots);

    //console.log({horMargin,vertMargin,height,width,drawingHeight,drawingWidth,posXLeft,posXRight,posY, nrOfRibbons, ribbonWidthAngle, ribbonLength});

    let bounds = {left: posXLeft, top: vertMargin, right: posXRight, bottom: vertMargin + drawingHeight};

    for(let slot = 0; slot<nrOfRibbons; slot++) {
      let ltr = true;
      //if (slot%2 > 0) {ltr = false;}
      let positionLeft = slotsLeft[slot];

      let y = posY + (ribbonWidthAngle * positionLeft);
      let x = posXLeft;//ltr ? posXLeft : posXRight;
      let angle = 45;//ltr ? 45 : 135;

      drawRibbon(poly.point(x,y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines);

      let positionRight = slotsRight[slot];
       y = posY + (ribbonWidthAngle * positionRight);
       x = posXRight;
       angle = 135;

      drawRibbon(poly.point(x,y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines);

    }

   

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
