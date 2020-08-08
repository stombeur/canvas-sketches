// asterisk in circle
// p5, but only for sin and radians
// plotting, yay!

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

function drawAsteriskInCircle(context, originX, originY, width, flags) {
  let radius = width/2;
  let centerX = originX + width/2;
  let centerY = originY + width/2;

	if ((flags & utils.flags.one) == utils.flags.one) line(context, centerX, centerY, centerX, centerY - radius); //1
	if ((flags & utils.flags.five) == utils.flags.five) line(context, centerX, centerY, centerX, centerY + radius); //5

	if ((flags & utils.flags.seven) == utils.flags.seven) line(context, centerX, centerY, centerX - radius, centerY); //7
	if ((flags & utils.flags.three) == utils.flags.three) line(context, centerX, centerY, centerX + radius, centerY); //3

	if ((flags & utils.flags.eight) == utils.flags.eight) line(context, centerX, centerY, centerX - (cos(radians(45)) * radius), centerY - (sin(radians(45)) * radius)); //8
	if ((flags & utils.flags.four) == utils.flags.four) line(context, centerX, centerY, centerX + (cos(radians(45)) * radius), centerY + (sin(radians(45)) * radius)); //4

	if ((flags & utils.flags.two) == utils.flags.two) line(context, centerX, centerY, centerX + (cos(radians(45)) * radius), centerY - (sin(radians(45)) * radius)); //2
	if ((flags & utils.flags.six) == utils.flags.six) line(context, centerX, centerY, centerX - (cos(radians(45)) * radius), centerY + (sin(radians(45)) * radius)); //6
}

function line(context, x1, y1, x2, y2) {
 // console.log({x1, y1, x2, y2});
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = 'black';
  context.lineWidth = 0.11;
  context.stroke();

  lines.push([[x1, y1], [x2, y2]]);
}


const sketch = (context) => {


  let margin = 0.4;
  let asteriskWidth = 1;
  let columns = 14;
  let rows = 20;
  
  let drawingWidth = (columns * (asteriskWidth + margin)) - margin;
  let drawingHeight = (rows * (asteriskWidth + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      o[r].push(utils.getRandomBitMask(8));
    }
  }

  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
    		drawAsteriskInCircle(context, posX, posY, asteriskWidth, o[r][i]);
    		posX = posX + (asteriskWidth) + margin;
    	}
    	posX = marginLeft;
    	posY = posY + asteriskWidth + margin;
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
