// overlapping squares with hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

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

    poly.drawLineOnCanvas(line);

    lines.push(line);
  }

  return lines;
}

const drawRibbon = (start,bounds,ribbonLength,ribbonWidth,angle,nrOfLines, slot) => {
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


  ribbons.push({slot, ribbon});
  ribbons.sort((a, b) => {
    return a.slot - b.slot;
  });

  linesToDraw.forEach(l => {
    let angle =  Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0]) * 180 / Math.PI;
    if ((44.8 < angle && angle < 45.2) || (134.8 < angle && angle < 135.2)) { poly.drawLineOnCanvas(l); }
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
    poly.init(context);

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
   


    let nrOfLines = 6;
    let nrOfRibbons = Math.floor(drawingHeight + drawingWidth) + 1;
    let ribbonWidth = 1;
    let ribbonWidthAngle = Math.sqrt(2 * Math.pow(ribbonWidth,2));
    let ribbonLength = Math.sqrt(2 * Math.pow(drawingWidth,2));

   
    let slotsLeft = utils.shuffle([...Array(nrOfRibbons).keys()]);//[23, 26, 32, 44, 17, 28, 41];//[...Array(nrOfRibbons).keys()];
    let slotsRight = utils.shuffle([...Array(nrOfRibbons).keys()]);//[17, 23, 15, 34, 12, 32, 10, 27];//[...Array(nrOfRibbons).keys()];

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

      drawRibbon(poly.point(x,y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionLeft);

      let positionRight = slotsRight[slot];
       y = posY + (ribbonWidthAngle * positionRight);
       x = posXRight;
       angle = 135;

      drawRibbon(poly.point(x,y), bounds, ribbonLength, ribbonWidthAngle, angle, nrOfLines, positionRight);

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
