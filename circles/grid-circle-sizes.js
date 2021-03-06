// grid with concentric circles of different sizes

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
      let radius = utils.getRandom(elementHeight/2, 0);
      o[r].push(radius);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    const drawCircle = poly.drawCircle(context);

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    let divide = 12;
    let step = elementHeight / divide;

    for (let r = 0; r < rows; r++) {
    	for (let c = 0; c < columns; c++) {
          //draw element here
          let center = {x:posX+elementWidth/2, y:posY+elementHeight/2};
          let radius = o[r][c];
          while (radius > 0) {
            drawCircle(center.x, center.y, radius);
            svgFile.addCircle(center.x, center.y, radius);
            radius = radius - step;
          }
          
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
