// grid with circles of different sizes

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

// grid settings
let margin = 0;
let elementWidth = 3;
let elementHeight = 3;
let columns = 4;
let rows = 6;

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  // randomness
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let c = 0; c < columns; c++) {
      let rotate = utils.getRandomInt(360,0);
      let skip = utils.getRandomInt(100)>100;
      o[r].push({rotate, skip});
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);


    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    const drawCircle = (cx, cy, radius) => {
  
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.stroke();
      
        svgFile.addCircle(cx, cy, radius);
    }
    
    const drawCircleWithFan = (cx, cy, r, nrOfLines, rotate, overlap = 0) => {

      let radius = r + overlap;
      let step = 180 / nrOfLines;
      let fulcrum = [cx - radius, cy];

      let startLine = [...[fulcrum], [cx - radius, cy - 2*radius]];
      for (let i = 1; i < nrOfLines; i++) {
        let angle = step * i;
        let line = poly.rotatePolygon([...startLine], fulcrum, angle);
        let clippedLine = poly.clipLineToCircle(line, [cx,cy], radius);
 
        if (clippedLine[0]) {
          let rotatedLine = poly.rotatePolygon(clippedLine, [cx,cy], rotate);
          svgFile.addLine(rotatedLine, false);
          poly.drawLineOnCanvas(rotatedLine);
        }
      }
    }

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    let divide = 25;
    let step = elementHeight / divide;

    for (let r = 0; r < rows; r++) {
    	for (let c = 0; c < columns; c++) {
          //draw element here
          let center = {x:posX+elementWidth/2, y:posY+elementHeight/2};
          if (!o[r][c].skip){drawCircleWithFan(center.x, center.y, elementWidth/2, 40, o[r][c].rotate, 0.5); }

          //advance grid
    	    posX = posX + (elementWidth) + margin;
        }
      
      //advance 
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
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
