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

  // if (y < bounds.top) {
  //   let h = bounds.top - y;
  //   x = h + bounds.left;
  //   y = bounds.top;
  //   length = ribbonLength - h;
  // }

  for(let i = 0;i<nrOfLines;i++) {
    y = y + i * spacing;
    
    let start = poly.point(x, y);
    let end = poly.point(x + length, y);
    end = poly.rotatePointXY(end, start, angle);
    let line = poly.toLine(start, end);
    ribbonLines.push(line);
    poly.drawLineOnCanvas(mainContext, line);
  }
  let ribbon = {lines: ribbonLines, left: ribbonLines[0], right: ribbonLines[nrOfLines - 1]};

  ribbons.forEach(r => {


  });

  ribbons.push(ribbon);
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
   


    let nrOfLines = 3;
    let nrOfRibbons = Math.floor(drawingHeight + drawingWidth) + 1;
    let ribbonWidth = 1;
    let ribbonLength = Math.sqrt(2 * Math.pow(drawingWidth,2));

   
    let slots = [...Array(nrOfRibbons).keys()];
   // slots = utils.shuffle(slots);

    console.log({horMargin,vertMargin,height,width,drawingHeight,drawingWidth,posXLeft,posXRight,posY, nrOfRibbons, ribbonWidth, ribbonLength});


    for(let slot = 0; slot<nrOfRibbons; slot++) {
      let ltr = true;
      if (slot%2 > 0) {ltr = false;}
      let position = slots[slot];

      let y = posY + (ribbonWidth * position);
      let x = ltr ? posXLeft : posXRight;
      let angle = ltr ? 45 : 135;

      console.log({position,x,y, angle})
   
      let bounds = {left: posXLeft, top: vertMargin, right: posXRight, bottom: vertMargin + drawingHeight};

      drawRibbon(poly.point(x,y), bounds, ribbonLength, ribbonWidth, angle, nrOfLines)
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
