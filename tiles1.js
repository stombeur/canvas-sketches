// tiles with quarter-circle

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 0.2;
  let elementWidth = 2;
  let elementHeight = 2;
  let columns = 8;
  let rows = 14;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = utils.getRandomInt(4,0) * 90;//utils.random(0, 360);
      let size = utils.random(45, 270);
      let quarter = utils.getRandomInt(4,1);
      o[r].push([rot, size, quarter]);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    const drawTile = (x,y, side, corner) => {
        let s = poly.createSquarePolygon(x,y, side, side);
        poly.drawPolygonOnCanvas(context, s);

        let padding = 0.2;
        let cx = x + padding,
            cy = y + padding,
            startAngle = 0;
        
        // 0 1
        // 3 2
        switch (corner) {
          case 1:
            cx = x + side - padding;
            cy = y + side - padding;
            startAngle = 90;
            break;
          case 2:
            cx = x + side - padding;
            cy = y + side - padding;
            startAngle = 90;
            break;
          
          default:
            break;
        }
    }

    const drawCircle = (cx, cy, radius) => {
  
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    
      svgFile.addCircle(cx, cy, radius);
    }
    
    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(cx, cy, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      context.stroke();
    
      svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    let posX = marginLeft;
    let posY = marginTop;

    let radius = elementWidth / 2;
    let divide = 15
    let step = radius / divide;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
            for (let s = 0; s < (divide); s++) {
            drawArc(posX + radius, posY + radius, s * step, o[r][i][0], o[r][i][0] + 270);
            }
    		posX = posX + (elementWidth) + margin;
        }

        svgFile.newPath();
        
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    let bounds = poly.createSquarePolygon(marginLeft, marginTop, drawingWidth, drawingHeight);
    let hatchLines = poly.hatchPolygon(bounds, 30, 0.1);
    hatchLines.map(l => {
        poly.drawLineOnCanvas(context, l);
        svgFile.addLine(l);
    });

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
