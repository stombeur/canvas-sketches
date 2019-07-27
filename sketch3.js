// asterisk in circle 
// p5.js
// no plotting

const canvasSketch = require('canvas-sketch');

// Grab P5.js from npm
const p5 = require('p5');
// Attach p5.js it to global scope
new p5()

const utils = require('./utils');

// Sketch parameters
const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
  // Tell canvas-sketch we're using p5.js
  p5: true,
  // Turn on a render loop (it's off by default in canvas-sketch)
  animate: false,
  // We can specify WebGL context if we want
  // context: 'webgl',
  // Optional loop duration
  //duration: 6,
  // Enable MSAA
  // attributes: {
  //   antialias: true
  // },
};

function drawAsteriskInCircle(originX, originY, width, flags) {
  let radius = width/2;
  let centerX = originX + width/2;
  let centerY = originY + width/2;

	if ((flags & utils.flags.one) == utils.flags.one) line(centerX, centerY, centerX, centerY - radius); //1
	if ((flags & utils.flags.five) == utils.flags.five) line(centerX, centerY, centerX, centerY + radius); //5

	if ((flags & utils.flags.seven) == utils.flags.seven) line(centerX, centerY, centerX - radius, centerY); //7
	if ((flags & utils.flags.three) == utils.flags.three) line(centerX, centerY, centerX + radius, centerY); //3

	if ((flags & utils.flags.eight) == utils.flags.eight) line(centerX, centerY, centerX - (cos(radians(45)) * radius), centerY - (sin(radians(45)) * radius)); //8
	if ((flags & utils.flags.four) == utils.flags.four) line(centerX, centerY, centerX + (cos(radians(45)) * radius), centerY + (sin(radians(45)) * radius)); //4

	if ((flags & utils.flags.two) == utils.flags.two) line(centerX, centerY, centerX + (cos(radians(45)) * radius), centerY - (sin(radians(45)) * radius)); //2
	if ((flags & utils.flags.six) == utils.flags.six) line(centerX, centerY, centerX - (cos(radians(45)) * radius), centerY + (sin(radians(45)) * radius)); //6
}


canvasSketch((context) => {
  // Inside this is a bit like p5.js 'setup' function
  // ...

  // let originX = 2;
  // let originY = 2;
  let margin = 0.5;
  let width = 1;
  let columns = 12;
  let rows = 18;
  
  console.log('width=' + context.width);
  console.log('height=' + context.height);

  let drawingWidth = (columns * (width + margin)) - margin;
  console.log('totaldrawingwidth=' + drawingWidth);

  let drawingHeight = (rows * (width + margin)) - margin;
  console.log('totaldrawingheight=' + drawingHeight);

  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  console.log('marginLeft=' + marginLeft);
  console.log('marginTop=' + marginTop);

  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      o[r].push(utils.getRandomBitMask(8));
    }
  }




  // Return a renderer to 'draw' the p5.js content
  return ({ context, w, h }) => {
    // Draw with p5.js things
    clear();
    background('#FFFFFF');
    strokeWeight(0.1);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
    		drawAsteriskInCircle(posX, posY, width, o[r][i]);
    		posX = posX + (width) + margin;
    	}
    	posX = marginLeft;
    	posY = posY + width + margin;
    }
  };
}, settings);

