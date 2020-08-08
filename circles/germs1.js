// squares on grid filled with circles of varying sizes

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const poly = require('../utils/poly');

let svgFile = new penplot.SvgFile();
let mainContext = null;

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const generatePoints = (nr, side, maxR, overlap = true) => {
  let result = [];

  for (let index = 0; index < nr; index++) {
    let retry = true;

    while (retry) {
      let x = utils.random(0.05, side);
      let y = utils.random(0.05, side);
      let maxRadius = Math.min(x, side-x, y, side-y, maxR);
      let radius = utils.random(0.05, maxRadius);

      let overlapping = false;

      result.forEach(element => {
        let hypo = Math.hypot(element.x-x, element.y-y) < (element.radius + radius);
        if (hypo) { overlapping = true; }
      });

      if (overlap || !overlapping) { result.push({x,y,radius}); retry = false; }
    }

    
  }

  return result;
}

const drawGermSquare = (x, y, side, points) => {
  points.forEach(p => {
    mainContext.beginPath();
    mainContext.arc(p.x + x, p.y + y, p.radius, 0, Math.PI * 2);
    mainContext.stroke();
  
    svgFile.addCircle(p.x + x, p.y + y, p.radius);
  });

}

const sketch = (context) => {
  let margin = 0.3;
  let elementWidth = 4;
  let elementHeight = 4;
  let columns = 4;
  let rows = 6;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let points = generatePoints(250, elementWidth, elementWidth/1.8, false);
      o[r].push(points);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;
    mainContext = context;

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
        drawGermSquare(posX, posY, elementWidth, o[r][i]);
    		posX = posX + (elementWidth) + margin;
        }

        svgFile.newPath();
        
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
