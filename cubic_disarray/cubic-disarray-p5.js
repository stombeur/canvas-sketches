// cubic disarray
// plot does not work?

const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');
const utils = require('../utils/random');

// Grab P5.js from npm
const p5 = require('p5');
// Attach p5.js it to global scope
new p5()

const lines = [];

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

function rotate(cx, cy, x, y, angle) {
  if (angle === 0) return [x, y];

  var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) + (sin * (x - cx)) + cy;
  return [nx, ny];
}

function drawSquare(context, cx, cy, width, rotation){

  let x1 = cx - width/2;
  let y1 = cy - width/2;

  context.beginPath();

  context.strokeStyle = 'black';
  context.lineWidth = 0.02;
  // context.lineCap = 'square';
  // context.lineJoin = 'miter';

  context.moveTo(...rotate(cx, cy, x1, y1, rotation));

  let x2 = x1 + width;
  let y2 = y1;

  context.lineTo(...rotate(cx, cy, x2, y2, rotation));

  let x3 = x2;
  let y3 = y2 + width;

  context.lineTo(...rotate(cx, cy, x3, y3, rotation));

  let x4 = x3 - width;
  let y4 = y3;

  context.lineTo(...rotate(cx, cy, x4, y4, rotation));
  context.lineTo(...rotate(cx, cy, x1, y1, rotation));

  context.stroke();
}




function line(context, x1, y1, x2, y2) {
  //console.log({x1, y1, x2, y2});

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = 'black';
  context.lineWidth = 0.15;
  //context.lineCap = 'square';
  //context.lineJoin = 'miter';
  context.stroke();

  lines.push([[x1, y1], [x2, y2]]);
}


const sketch = (context) => {

  let margin = 0.05;
  let elementWidth = 1.5;
  let elementHeight = 1.5;
  let columns = 7;
  let rows = 16;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
        let rot = 0;
        let move = 0;
        if (r >= 2) {
          rot = utils.random(-r, r);
          move = utils.random(0, r*0.1)
        }
      o[r].push([rot, move]);
    }
  }



  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
        
    		drawSquare(context, posX - elementWidth /2, posY - elementHeight/2 + o[r][i][1], elementWidth, o[r][i][0]);
    		posX = posX + (elementWidth) + margin;
    	}
    	posX = marginLeft;
    	posY = posY + elementHeight + margin;
    }

    // drawSquare(context, 2, 2, 2, 0);
    // drawSquare(context, 5, 2, 2, 20);
    // drawSquare(context, 10, 2, 2, -20);


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
