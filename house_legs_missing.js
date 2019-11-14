// house shape
// random legs missing
// plotting

const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');
const utils = require('./utils/random');

// Grab P5.js from npm
const p5 = require('p5');
// Attach p5.js it to global scope
new p5()

let lines = [];

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

function drawHouseLegs(context, originX, originY, width, height, flags) {
	if ((flags & utils.flags.one) == utils.flags.one) line(context, originX, originY + height, originX, originY + height/3); //1
	if ((flags & utils.flags.two) == utils.flags.two) line(context, originX, originY + height/3, originX + width/2, originY); //2
	if ((flags & utils.flags.three) == utils.flags.three) line(context, originX + width/2, originY, originX + width, originY + height/3); //3
	if ((flags & utils.flags.four) == utils.flags.four) line(context, originX + width, originY + height/3, originX + width, originY + height); //4
	if ((flags & utils.flags.five) == utils.flags.five) line(context, originX + width, originY + height, originX, originY + height); //5
}

function line(context, x1, y1, x2, y2) {
  //console.log({x1, y1, x2, y2});
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = 'black';
  context.lineWidth = 0.15;
  context.lineCap = 'square';
  context.lineJoin = 'miter';
  context.stroke();

  lines.push([[x1, y1], [x2, y2]]);
}


const sketch = (context) => {


  let margin = 0.4;
  let houseWidth = 1;
  let houseHeight = 2;
  let columns = 14;
  let rows = 12;
  
  let drawingWidth = (columns * (houseWidth + margin)) - margin;
  let drawingHeight = (rows * (houseHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  function getRndBias(min, max, bias, influence) {
    var rnd = Math.random() * (max - min) + min,   // random in range
        mix = Math.random() * influence;           // random mixer
    return rnd * (1 - mix) + bias * mix;           // mix full range and bias
  }

  function getRndIntBias(min, max, bias, influence) {
    var rnd = Math.floor(Math.random() * (max - min)) + min,   // random in range
        mix = Math.random() * influence;           // random mixer
    return Math.floor(rnd * (1 - mix)) + Math.floor(bias * mix);          // mix full range and bias
  }
  
  function weightedRandom(prob) {
    let i, sum=0, r=Math.random();
    for (i in prob) {
      sum += prob[i];
      if (r <= sum) return i;
    }
} //weightedRandom({0:0.6, 1:0.1, 2:0.1, 3:0.2});
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      //o[r].push(utils.getRandomBitMask(5));
      o[r].push(utils.getBitMask(weightedRandom({0:0.15, 1:0.15, 2:0.15, 3:0.15, 4:0.15, 5:0.25})));
    }
  }

  return ({ context, width, height, units }) => {
    lines = [];
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
    		drawHouseLegs(context, posX, posY, houseWidth, houseHeight, o[r][i]);
    		posX = posX + (houseWidth) + margin;
    	}
    	posX = marginLeft;
    	posY = posY + houseHeight + margin;
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
