// tiles with quarter-circle

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

let squareGroup1 = [];
let linegroup1 = [];
let arcGroup1 = [];
let arcGroup2 = [];

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 0.15;
  let elementWidth = 3;
  let elementHeight = 3;
  let columns = 6;
  let rows = 10;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let corner = utils.getRandomInt(3,0);
      o[r].push(corner);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    const drawCircle = (cx, cy, radius) => {
  
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    
      //svgFile.addCircle(cx, cy, radius);
    }
    
    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(cx, cy, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      context.stroke();
    
      //svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    }

    const drawTile = (x,y, side, corner, padding = 0.2) => {
      //console.log({x, y, side, corner});
      let s = poly.createSquarePolygon(x,y, side, side);
      poly.drawPolygonOnCanvas(context, s);
      squareGroup1.push(s);

      let zeroCorner = [x + padding, y + padding],
          oneCorner = [x + side - padding, y + padding],
          twoCorner = [x + side - padding, y + side - padding],
          threeCorner = [x + padding, y + side -padding];
      
    

      let cx = x + padding, // case 0
          cy = y + padding,
          startAngle = 0,
          p0 = zeroCorner,
          p1 = oneCorner,
          p2 = threeCorner;

      // 0 1
      // 3 2
      switch (corner) {
        case 1:
          cx = x + side - padding;
          cy = y + padding;
          startAngle = 90;
          p0 = oneCorner;
          p1 = zeroCorner;
          p2 = twoCorner;
          break;
        case 2:
          cx = x + side - padding;
          cy = y + side - padding;
          startAngle = 180;
          p0 = twoCorner;
          p1 = oneCorner;
          p2 = threeCorner;
          break;
        case 3:
          cx = x + padding;
          cy = y + side - padding;
          startAngle = 270;
          p0 = threeCorner;
          p1 = twoCorner;
          p2 = zeroCorner;
          break;
        default:
          break;
      }

      let l1 = [p0,p1];
      poly.drawLineOnCanvas(context, l1);
      linegroup1.push(l1);
      let l2 = [p0,p2];
      poly.drawLineOnCanvas(context, l2);
      linegroup1.push(l2);

      let endAngle = startAngle + 90;

      let radius = side - (padding*2);
      let divide = 30;
      let step = radius / divide;

      for (let s = 0; s <= divide; s++) {
        drawArc(cx, cy, s * step, startAngle, endAngle);
        if (s < divide) {arcGroup2.push({cx, cy, radius: s* step, startAngle, endAngle});}
        else { arcGroup1.push({cx, cy, radius: s* step, startAngle, endAngle});}
      }
      
  }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
          drawTile(posX, posY, elementWidth, o[r][i], margin);
    		  posX = posX + (elementWidth) + margin;
        }
        
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }
    squareGroup1.forEach(s => {
      svgFile.addLine(s, true);
    });
    linegroup1.forEach(l => {
      svgFile.addLine(l, true);
    });
    arcGroup1.forEach(a => {
      svgFile.addArc(a.cx, a.cy, a.radius, a.startAngle, a.endAngle);
    });
    svgFile.newPath();
    arcGroup2.forEach(a => {
      svgFile.addArc(a.cx, a.cy, a.radius, a.startAngle, a.endAngle);
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
