const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');
const polygonBoolean = require('2d-polygon-boolean');


const lines = [];

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

// const rotate = (point, center, angle) => {
//   if (angle === 0) return point;

//   let radians = (Math.PI / 180) * angle,
//     x = point[0],
//     y = point[1],
//     cx = center[0],
//     cy = center[1],
//     cos = Math.cos(radians),
//     sin = Math.sin(radians),
//     nx = cos * (x - cx) - sin * (y - cy) + cx,
//     ny = cos * (y - cy) + sin * (x - cx) + cy;
//   return [nx, ny];
// };

const rotatePoly = (polyLine, center, angle) => {
  return polyLine.map(p => {
    return poly.rotatePoint(p, center, angle);
  });
};

// const createPolygon = (nrOfSides, sideLength, centerPoint) => {
//   let centerAngle = Math.PI * 2 / nrOfSides;
//   let b = Math.sin(centerAngle/2) * sideLength / 2 / Math.cos(centerAngle/2);
//   let x1 = centerPoint[0] - sideLength / 2;
//   let y1 = centerPoint[1] + b;

//   let polygon = [];
//   polygon.push([x1, y1]);
//   for (let i = 1; i < nrOfSides; i++) {
//     polygon.push(poly.rotatePoint([x1, y1], centerPoint, 360 / nrOfSides * i))
//   }
 
//   return polygon;
// }

// function drawPolygon(context, poly) {
//   context.beginPath();

//   context.strokeStyle = 'black';
//   context.lineWidth = 0.01;
//   context.lineCap = 'square';
//   context.lineJoin = 'miter';

//   context.moveTo(poly[0][0], poly[0][1]);

//   poly.map(function(point) {
//     context.lineTo(point[0], point[1]);
//   });

//   context.lineTo(poly[0][0], poly[0][1]);

//   context.stroke();

//   lines.push(poly);
// }

function drawLine(line) {
  poly.drawLineOnCanvas(line);
  lines.push(line);
}

// const boundingBox = (polyLine, padding = 0) => {
//   let left = Number.MAX_VALUE,
//     top = Number.MAX_VALUE,
//     right = 0,
//     bottom = 0;

//   polyLine.map(p => {
//     left = Math.min(p[0], left);
//     top = Math.min(p[1], top);
//     right = Math.max(p[0], right);
//     bottom = Math.max(p[1], bottom);
//   });

//   return [
//     [left - padding, top - padding],
//     [right + padding, top - padding],
//     [right + padding, bottom + padding],
//     [left - padding, bottom + padding]
//   ];
// };

const hatch2 = (polygon, angle, spacing = 0.1) => {
  let rectangle = poly.calculateBoundingBox(polygon);//boundingBox(polygon);
  //console.log(rectangle);
  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  //console.log({x,y,height, width});
  let rotatedRectangle = poly.rotatePolygon(
    rectangle,
    [x + width / 2, y + width / 2],
    angle
  );
  //console.log(rotatedRectangle);
  let box = poly.calculateBoundingBox(rotatedRectangle, 0);

  let x2 = box[0][0];
  let y2 = box[0][1];
  let height2 = box[2][1] - y2;
  let width2 = box[2][0] - x2;

  let numLines = Math.floor(height2 / spacing);
  let result = [];

  for (let i = 0; i <= numLines; i++) {
    let line = [[x2, y2 + i * spacing], [x2 + width2, y2 + i * spacing]];
    let rotatedLine = poly.rotatePolygon(line, [x + width / 2, y + width / 2], angle);
    result.push(rotatedLine);
  }
  return result;
};

const clip = (line, polyClip) => {
  let closedLine = [line[0], line[1], line[1], line[0]];
  //console.log(closedLine);
  return polygonBoolean(polyClip, closedLine, 'and');
};

const drawHatchedPoly = (posX, posY, angle, space, sideLength = 2) => {
  let rect = poly.createPolygon(6, sideLength, [posX, posY]);
  let hatched = poly.hatchPolygon(rect, angle, space);
  //console.dir(hatched);
  //hatched = hatch2(rect, angle, space);
  //console.dir(hatched);
  for (let i = 0; i < hatched.length; i++) {
    let x = null;
    try {
      x = clip(hatched[i], rect);
    } catch {}
    if (x) {
      x.map(l => {
        drawLine([l[0], l[1]]);
      });
    }
  }
};

const sketch = (context) => {

  let margin = 0.2;
  let elementWidth = 2;
  let elementHeight = 1.8;
  let columns = 6;
  let rows = 12;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let rot = utils.random(-89, 89);
      let space = utils.random(0.1,0.30);
      o[r].push([rot,space]);
    }
  }

  return ({ context, width, height, units }) => {
    poly(context);
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft + elementWidth / 4;
    let posY = marginTop  + elementHeight / 4;

    //poly.drawHatchedPolygonOnCanvas(context, 13,17, 12.3, 0.45, 14);
    drawHatchedPoly(13,17, 12.3, 0.45, 14);
    drawHatchedPoly(16,25, 54.8, 0.85, 14);

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
        extension: '.svg',
        //file: 'c:\\tmp\\saveme.svg'
      }
    ];
  };
};

canvasSketch(sketch, settings);
