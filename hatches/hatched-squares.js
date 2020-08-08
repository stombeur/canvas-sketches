// directional hatching in squares

const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');
const utils = require('../utils/random');
const polygonBoolean = require('2d-polygon-boolean');

const lines = [];

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
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

const hatch = (rectangle, spacing = 0.1) => {
  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  console.log({ x, y, width, height });

  let numLines = Math.floor(height / spacing);
  let result = [];

  for (let i = 0; i <= numLines; i++) {
    let line = [[x, y + i * spacing], [x + width, y + i * spacing]];
    result.push(line);
  }
  return result;
};

const hatch2 = (rectangle, angle, spacing = 0.1) => {
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

function createPolygon(originX, originY, width, height) {
  let result = [];
  result.push([originX, originY]);
  result.push([originX + width, originY]);
  result.push([originX + width, originY + height]);
  result.push([originX, originY + height]);

  return result;
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

  lines.push(poly);
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

  lines.push(poly);
}

const drawHatchedPoly = (context, posX, posY, angle) => {
  let rect = createPolygon(posX, posY, 1.5, 1.5);
  let hatched = hatch2(rect, angle);
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

const sketch = context => {
  let margin = 0.05;
  let elementWidth = 1.5;
  let elementHeight = 1.5;
  let columns = 6;
  let rows = 10;

  let drawingWidth = columns * (elementWidth + margin) - margin;
  let drawingHeight = rows * (elementHeight + margin) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = utils.random(-89, 89);
      o[r].push(rot);
    }
  }

  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    //drawHatchedPoly(context, posX, posY, 15);

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
    		drawHatchedPoly(context, posX, posY, o[r][i]);
    		posX = posX + (elementWidth) + margin;
    	}
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    


    return [
      // Export PNG as first layer
      context.canvas,
      // Export SVG for pen plotter as second layer
      {
        data: polylinesToSVG(lines, {
          width,
          height,
          units
        }),
        extension: '.svg'
      }
    ];
  };
};

canvasSketch(sketch, settings);
