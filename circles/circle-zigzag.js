// grid with circular fans that overlap

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const poly = require('../utils/poly');

let svgFile = new penplot.SvgFile();

// grid settings
let margin = 0;
let elementWidth = 2;
let elementHeight = 2;
let columns = 6;
let rows = 9;

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
      let rotate = utils.getRandomInt(80,60);
      let steps = utils.getRandomInt(8, 12);
      o[r].push({rotate, steps});
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    const drawZigZag2 = (cx, cy, radius, steps, rotate) => {

      if (!Array.isArray(steps)) steps = [steps];

      let start = [cx, cy + radius];
      let center = [cx, cy];
      let angleSegment = 180 / steps.length;
      start = poly.rotatePoint(start, center, angleSegment / steps[0] / 2 + rotate);
      let result = [];
      let left = right = start;

      for (let k = 0; k < steps.length; k++) {
        const nr = steps[k];
        const angle = angleSegment / nr;

        for (let i = 0; i < nr; i++) {
          right = poly.rotatePoint(right, center, -angle);
          left = poly.rotatePoint(left, center, angle);
          result.push(right);
          result.push(left);
        }
      }
      
      let p = result[0];

      for (let i = 1; i < result.length; i++) {
        poly.drawLineOnCanvas([p,result[i]]);
        svgFile.addLine([p,result[i]]);
        p = result[i];
      }
    }

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    let overlap = 0;

    for (let r = 0; r < rows; r++) {
    	for (let c = 0; c < columns; c++) {
          //draw element here
          let center = {x:posX+elementWidth/2, y:posY+elementHeight/2};
          drawZigZag2(center.x, center.y, elementWidth/2, o[r][c].steps, o[r][c].rotate);
        
          //advance grid
    	    posX = posX + (elementWidth) + margin - overlap;
        }
      
      //advance 
    	posX = marginLeft;
    	posY = posY + elementHeight + margin - overlap;
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
