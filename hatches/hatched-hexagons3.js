// hatched hexagons

const canvasSketch = require('canvas-sketch');
const penplot = require('../utils/penplot');
const utils = require('../utils/random');
const polygonBoolean = require('2d-polygon-boolean');
const noise = require('../utils/perlin').noise;

let svgFile = new penplot.SvgFile();


const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const rotate = (point, center, angle) => {
  if (angle === 0) return point;

  let radians = (Math.PI / 180) * angle,
    x = point[0],
    y = point[1],
    cx = center[0],
    cy = center[1],
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) - sin * (y - cy) + cx,
    ny = cos * (y - cy) + sin * (x - cx) + cy;
  return [nx, ny];
};

const rotatePoly = (polyLine, center, angle) => {
  return polyLine.map(p => {
    return rotate(p, center, angle);
  });
};

const createPolygon = (nrOfSides, sideLength, centerPoint) => {
  let centerAngle = Math.PI * 2 / nrOfSides;
  let b = Math.sin(centerAngle/2) * sideLength / 2 / Math.cos(centerAngle/2);
  let x1 = centerPoint[0] - sideLength / 2;
  let y1 = centerPoint[1] + b;

  let poly = [];
  poly.push([x1, y1]);
  for (let i = 1; i < nrOfSides; i++) {
    poly.push(rotate([x1, y1], centerPoint, 360 / nrOfSides * i))
  }
 
  return poly;
}

function drawPolygon(context, poly) {
  context.beginPath();

  context.strokeStyle = 'black';
  context.lineWidth = 0.01;
  context.lineCap = 'square';
  context.lineJoin = 'miter';

  context.moveTo(poly[0][0], poly[0][1]);

  poly.map(function(point) {
    context.lineTo(point[0], point[1]);
  });

  context.lineTo(poly[0][0], poly[0][1]);

  context.stroke();

  svgFile.addLine(poly);
}

function drawLine(context, poly) {
  context.beginPath();

  context.strokeStyle = 'black';
  context.lineWidth = 0.01;
  context.lineCap = 'square';
  context.lineJoin = 'miter';

  context.moveTo(poly[0][0], poly[0][1]);

  context.lineTo(poly[1][0], poly[1][1]);

  context.stroke();

  svgFile.addLine(poly);
}

const boundingBox = (polyLine, padding = 0) => {
  let left = Number.MAX_VALUE,
    top = Number.MAX_VALUE,
    right = 0,
    bottom = 0;

  polyLine.map(p => {
    left = Math.min(p[0], left);
    top = Math.min(p[1], top);
    right = Math.max(p[0], right);
    bottom = Math.max(p[1], bottom);
  });

  return [
    [left - padding, top - padding],
    [right + padding, top - padding],
    [right + padding, bottom + padding],
    [left - padding, bottom + padding]
  ];
};

const hatch2 = (poly, angle, spacing = 0.1) => {
  let rectangle = boundingBox(poly, 2);
  //console.log(rectangle);
  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  //console.log({x,y,height, width});
  let rotatedRectangle = rotatePoly(
    rectangle,
    [x + width / 2, y + width / 2],
    angle
  );
  //console.log(rotatedRectangle);
  let box = boundingBox(rotatedRectangle, 0);

  let x2 = box[0][0];
  let y2 = box[0][1];
  let height2 = box[2][1] - y2;
  let width2 = box[2][0] - x2;

  let numLines = Math.floor(height2 / spacing);
  let result = [];

  for (let i = 0; i <= numLines; i++) {
    let line = [[x2, y2 + i * spacing], [x2 + width2, y2 + i * spacing]];
    let rotatedLine = rotatePoly(line, [x + width / 2, y + width / 2], angle);
    result.push(rotatedLine);
  }
  return result;
};

const clip = (line, polyClip) => {
  let closedLine = [line[0], line[1], line[1], line[0]];
  //console.log(closedLine);
  return polygonBoolean(polyClip, closedLine, 'and');
};

const drawHatchedPoly = (context, posX, posY, angle, space, side) => {
  let rect = createPolygon(6, side, [posX, posY]);
  let hatched = hatch2(rect, angle, space);
  for (let i = 0; i < hatched.length; i++) {
    let x = null;
    try {
      x = clip(hatched[i], rect);
    } catch {}
    if (x) {
      x.map(l => {
        drawLine(context, [l[0], l[1]]);
      });
    }
  }
};

const sketch = (context) => {
  svgFile = new penplot.SvgFile();

  let margin = 0.2;
  let elementWidth = 2.8;
  let elementHeight = 2.4;
  let columns = 6;
  let rows = 11;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  noise.seed(Math.random());
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let pValue = Math.abs(noise.perlin2(i / 50, r / 50));
      let rot = utils.random(-89, 89);
      let space =  pValue+0.11; //utils.random(0.18,0.22);
      o[r].push([rot,space]);
    }
  }

  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft + elementWidth / 5;
    let posY = marginTop  + elementHeight / 2;

    for (let r = 0; r < rows; r++) {
      if (r%2==0) { posX = posX + margin/2 + elementWidth/2; }
    	for (let i = 0; i < columns; i++) {
        
        drawHatchedPoly(context, posX, posY, o[r][i][0], o[r][i][1], elementWidth);

    		posX = posX + (elementWidth) + margin;
    	}
    	posX = marginLeft + elementWidth / 4;
      posY = posY + elementHeight + margin;
      svgFile.newPath();
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
        //file: 'c:\\tmp\\saveme.svg'
      }
    ];
  };
};

canvasSketch(sketch, settings);
