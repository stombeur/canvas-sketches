// square box with cross
// random legs missing
// plotting

const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');
const utils = require('./utils/random');

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

function drawSquareLegs(context, originX, originY, width, flags) {
	if ((flags & utils.flags.one) == utils.flags.one) line(context, originX, originY, originX + width/2, originY); //1
	if ((flags & utils.flags.two) == utils.flags.two) line(context, originX + width/2, originY, originX + width, originY); //2
	if ((flags & utils.flags.three) == utils.flags.three) line(context, originX + width, originY, originX + width, originY + width/2); //3
	if ((flags & utils.flags.four) == utils.flags.four) line(context, originX + width, originY + width/2, originX + width, originY + width); //4
	if ((flags & utils.flags.five) == utils.flags.five) line(context, originX + width, originY + width, originX + width/2, originY + width); //5
	if ((flags & utils.flags.six) == utils.flags.six) line(context, originX + width/2, originY + width, originX, originY + width); //6
	if ((flags & utils.flags.seven) == utils.flags.seven) line(context, originX, originY + width, originX, originY + width / 2); //7
	if ((flags & utils.flags.eight) == utils.flags.eight) line(context, originX, originY + width / 2, originX, originY); //8
	if ((flags & utils.flags.nine) == utils.flags.nine) line(context, originX + width/2, originY + width/2, originX + width/2, originY); //9
	if ((flags & utils.flags.ten) == utils.flags.ten) line(context, originX + width/2, originY + width/2, originX + width, originY + width/2); //10
	if ((flags & utils.flags.eleven) == utils.flags.eleven) line(context, originX + width/2, originY + width/2, originX + width/2, originY + width); //11
	if ((flags & utils.flags.twelve) == utils.flags.twelve) line(context, originX + width/2, originY + width/2, originX, originY + width/2); //12
}

function line(context, x1, y1, x2, y2) {
  //console.log({x1, y1, x2, y2});
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = 'black';
  context.lineWidth = 0.11;
  context.lineCap = 'square';
  context.stroke();

  lines.push([[x1, y1], [x2, y2]]);
}


const sketch = (context) => {


  let margin = 0.5;
  let asteriskWidth = 1;
  let columns = 12;
  let rows = 18;
  
  let drawingWidth = (columns * (asteriskWidth + margin)) - margin;
  let drawingHeight = (rows * (asteriskWidth + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      o[r].push(utils.getRandomBitMask(12));
    }
  }

  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
    		drawSquareLegs(context, posX, posY, asteriskWidth, o[r][i]);
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
