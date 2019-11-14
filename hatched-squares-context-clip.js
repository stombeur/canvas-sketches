const canvasSketch = require('canvas-sketch');
const { polylinesToSVG } = require('canvas-sketch-util/penplot');

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


function createClipSquare(context, cx, cy, width) {
  let xy1 = [cx, cy];
  let xy2 = [cx + width, cy];
  let xy3 = [cx + width, cy + width];
  let xy4 = [cx, cy + width];

  context.save();
  context.beginPath();
  context.moveTo(...xy1);
  context.lineTo(...xy2);
  context.lineTo(...xy3);
  context.lineTo(...xy4);
  context.lineTo(...xy1);
  context.clip();
}

function drawHatch(context, cx, cy, width) {
  let length = width * 3;

  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 0.02;

  let y = cy;
  let x = cx - width;

  for (let i=0; i < 5; i++ ){
    context.moveTo(x, y);
    context.lineTo(x + length, y);
    y = y + width / 5;
  }
  context.stroke();
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
  
  // let o = [];
  // for (let r = 0; r < rows; r++) {
  //   o[r] = [];
  //   for (let i = 0; i < columns; i++) {
  //       let rot = 0;
  //       let move = 0;
  //       if (r >= 2) {
  //         rot = utils.random(-r, r);
  //         move = utils.random(0, r*0.1)
  //       }
  //     o[r].push([rot, move]);
  //   }
  // }



  return ({ context, width, height, units }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
    	for (let i = 0; i < columns; i++) {
        
        createClipSquare(context, posX, posY, elementWidth);
        drawHatch(context, posX, posY, elementWidth);
        context.restore();
        
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
