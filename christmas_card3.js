// grid with circular fans that overlap

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();

// grid settings
let margin = 0.1;
let elementWidth = 2.2;
let elementHeight = 2.2;
let columns = 6;
let rows = 9;

const settings = {
  dimensions: 'A6',
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
      let rotate = utils.getRandomInt(-20,20);
      let steps = utils.getRandomInt(40, 20);
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

    const drawballtop= (cx, cy, radius, rotate, width, height) => {
      let lefttop = [cx - width/2, cy - radius - height];
      
      let box = [lefttop, [lefttop[0]+width, lefttop[1]], [lefttop[0]+width, lefttop[1] + height], [lefttop[0], lefttop[1] + height]];
      box = poly.rotatePolygon(box, [cx, cy], rotate);
      poly.drawPolygonOnCanvas(context, box);
      svgFile.addLine(box, true);

      let lines = 4;
      for (let i = 1; i < lines; i++) {
        let line = poly.rotatePolygon([[lefttop[0], lefttop[1]+height/lines*i],[lefttop[0]+width, lefttop[1]+height/lines*i]], [cx, cy], rotate);
        poly.drawLineOnCanvas(line);
        svgFile.addLine(line);     
      }
      
      svgFile.newPath();
    }

    const drawZigZag2 = (cx, cy, radius, steps, rotate, boundingbox = null) => {

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

          // if (boundingbox) {
          //   right = poly.clipLineToBB(right, boundingbox);
          //   left = poly.clipLineToBB(left, boundingbox);
          // }
            if (right) { result.push(right); }
            if (left) { result.push(left); }
        }
      }
      
      let p = result[0];

      for (let i = 1; i < result.length; i++) {
        let line = [p,result[i]];
        if (boundingbox) {
          line = poly.clipLineToBB(line, boundingbox);
        }
        if (line) {
          poly.drawLineOnCanvas(line);
          svgFile.addLine(line);
        }
        p = result[i];
      }

      svgFile.newPath();
    }

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    let bb = {xmin:0, ymin:0, xmax:width, ymax:height};

    for (let r = 0; r < rows; r++) {
    	for (let c = 0; c < columns; c++) {
          //draw element here
          let center = {x:posX+elementWidth/2, y:posY+elementHeight/2};
          drawZigZag2(center.x, center.y, elementWidth/2, 16, o[r][c].rotate, bb);
          //drawballtop(center.x, center.y, elementWidth/2, o[r][c].rotate, elementWidth/6, elementWidth/14);
        
          //advance grid
    	    posX = posX + (elementWidth) + margin;
        }
      
      //advance 
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    svgFile.newPath();

    // let border = 0.5;
    // let box = [[border, border],[border, height-border],[width-border,height-border],[width-border,border]];
    // poly.drawPolygonOnCanvas(context, box);
    // svgFile.addLine(box, true);
    // border = 0.7;
    // box = [[border, border],[border, height-border],[width-border,height-border],[width-border,border]];
    // poly.drawPolygonOnCanvas(context, box);
    // svgFile.addLine(box, true);

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
