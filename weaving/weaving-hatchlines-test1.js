// overlapping squares with hatching

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const poly = require('../utils/poly');

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

const drawRibbon = (start, end, width, nrOfLines = 3) => {
  let diff = width / (nrOfLines - 1);
  
  let vector = poly.point(end.x - start.x, end.y - start.y);
  let a = vector.x;
  let b = vector.y;

  let angle = Math.asin(a / (Math.sqrt((a*a)+(b*b))));
  let angleDegrees = angle * 180 / Math.PI;

  let diffY = diff * Math.sin(angle);
  let diffX = (diff * Math.cos(angle));

  if (vector.x > 0 && vector.y > 0) { diffY = 0-diffY; }
  if (vector.y < 0 && vector.x < 0) { diffX = 0-diffX; }

  let ribbon = {lines: null, left: null, right: null};

  ribbon.lines = drawRibbonSegment(start, end, diffX, diffY, nrOfLines);
  ribbon.left = ribbon.lines[0];
  ribbon.right = ribbon.lines[nrOfLines - 1]


  // for (let index = 0; index < nrOfLines; index++) {
  //   let diffVector = poly.point(diffX * index, diffY * index);
  //   let line = poly.toLine(poly.movePoint(start, diffVector), poly.movePoint(end, diffVector));

  //   poly.drawLineOnCanvas(mainContext, line);

  //   if (index === 0) { ribbon.left = line;  }
  //   if (index === nrOfLines - 1) { ribbon.right = line; }
  //   ribbon.lines.push(line);
  // }

  ribbons.forEach(r => {
    //console.log('testing intersection');
    //console.log(r.left);
    let int = poly.findSegmentIntersection(start, end, poly.point(...r.left[0]), poly.point(...r.left[1]));
    if (int) {
      // console.log('intersection found at ' + int);

      // mainContext.beginPath();
      // mainContext.arc(int.x, int.y, 0.3, 0, Math.PI * 2);
      // mainContext.stroke();
    
    }
  });

  ribbons.push(ribbon);

}

const sketch = (context) => {

  let margin = -0.2;
  let elementWidth = 3;
  let elementHeight = 3;
  let columns = 7;
  let rows = 12;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
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

    let posX = marginLeft;
    let posY = marginTop;

    let linesPerRibbon = 3

    drawRibbon(poly.point(posX, posY+5), poly.point(posX + drawingWidth, posY + drawingHeight-1), 1, 5);
    drawRibbon(poly.point(posX, posY + drawingHeight/2), poly.point(posX + drawingWidth, posY), 1, 5);
    drawRibbon(poly.point(posX + drawingWidth/2, posY), poly.point(posX+ drawingWidth/2 + 1, posY + drawingHeight), 1, 5);

    drawRibbon(poly.point(posX, posY+2), poly.point(posX + drawingWidth, posY + drawingHeight-4), 1, 5);

    // let int = poly.findSegmentIntersection(poly.point(posX, posY+5), 
    //                           poly.point(posX + drawingWidth, posY + drawingHeight-1), 
    //                           poly.point(posX, posY + drawingHeight/2), 
    //                           poly.point(posX + drawingWidth, posY)
    //                             );
    // console.log(int);

    // if (int) {
    //   mainContext.beginPath();
    //   mainContext.arc(int.x, int.y, 0.3, 0, Math.PI * 2);
    //   mainContext.stroke();
    // }
  
    //console.log(ribbons);

    // for (let r = 0; r < rows; r++) {
    // 	for (let i = 0; i < columns; i++) {
    //     let sposX = posX + o[r][i][2];
    //     let sposY = posY + o[r][i][3];
    //     let s =poly.createSquarePolygon(sposX, sposY, elementWidth, elementHeight);
    //     let lines = poly.hatchPolygon(s, o[r][i][0], o[r][i][1]);
    //     lines.map(l => {
    //       poly.drawLineOnCanvas(context, l);
    //       svgFile.addLine(l);
    //     });
    //     posX = posX + (elementWidth) + margin;
    //     svgFile.newPath();
    //   }

    // 	posX = marginLeft;
    // 	posY = posY + elementHeight + margin;
    // }

    // let bounds = poly.createSquarePolygon(marginLeft, marginTop, drawingWidth, drawingHeight);
    // let hatchLines = poly.hatchPolygon(bounds, 30, 0.5);
    // hatchLines.map(l => {
    //     poly.drawLineOnCanvas(context, l);
    //     svgFile.addLine(l);
    // });

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
