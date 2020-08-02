// variant of the same name

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();
let mainContext = null;

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const createRandomDashedLine = (x, y, angle, length, segments, clip) => {
  // let q = [[x, y], poly.rotatePoint([x+length, y], [x,y], angle)];
  // // console.log(q);
  // // console.log(clip);
  // let clippedLine;
  // try {
  //   clippedLine = poly.clip(q, clip);
  //   console.log(clippedLine);
  // }
  // catch {}
  // if (!clippedLine) return;

  let polyline = [];
  let currentX = x;//clippedLine[0][0],
      currentY = y;//clippedLine[0][1];
  polyline.push([currentX, currentY]);

  for (let index = 0; index < segments; index++) {
    let len = utils.random(0.5, (length / segments) * 2);
    let point = [currentX + len, currentY];
    let rotPoint = poly.rotatePoint(point, [currentX, currentY], angle);
    polyline.push(rotPoint);
    currentX = rotPoint[0];
    currentY = rotPoint[1];
  }

  //console.log(polyline);

  let result = [];
  for (let index = 0; index < polyline.length -1; index++) {
    let seg = [polyline[index], polyline[index+1]];
    if (index % 2 === 0) {
      result.push(seg);
    }
  }
  return result;
}

const drawSquare = (origX, origY, side, height = side) => {
  let squarePoly = poly.createSquarePolygon(origX, origY, side, height);
  poly.drawPolygonOnCanvas(mainContext, squarePoly);
  svgFile.addLine(squarePoly, true);
}

const drawTopLeft = (origX, origY, side, options) => {
  let x = origX,
      y = origY,
      invertX = false,
      invertY = false;

  drawCorner(x, y, side, invertX, invertY, options);
}

const drawTopRight = (origX, origY, side, options) => {
  let x = origX + side,
      y = origY,
      invertX = true,
      invertY = false;

  drawCorner(x, y, side, invertX, invertY, options);
}

const drawBottomLeft = (origX, origY, side, options) => {
  let x = origX,
      y = origY + side,
      invertX = false,
      invertY = true;

  drawCorner(x, y, side, invertX, invertY, options);
}

const drawBottomRight = (origX, origY, side, options) => {
  let x = origX + side,
      y = origY + side,
      invertX = true,
      invertY = true;

  drawCorner(x, y, side, invertX, invertY, options);
}

const drawCorner = (origX, origY, side, invertX, invertY, options) =>  {
  let width = invertX ? -side : side;
  let height = invertY ? -side : side;

  let levels = 9; // smaller and smaller square
  for (let level = 2; level < levels+1; level++) {
    let div = Math.pow(2,level);
    let w = width / div;
    let h = height / div;

    let repeatX = div;//utils.getRandomInt(div, 0);
    let repeatY = div; //utils.getRandomInt(div, 0);
    let totalWeight = 1;
    for (let itemX = 1; itemX < repeatX+1; itemX++) {
      for (let itemY = 1; itemY < repeatY+1; itemY++) {
        totalWeight = totalWeight + (itemX * itemY);
      }
    }
    for (let itemX = 1; itemX < repeatX+1; itemX++) {
      for (let itemY = 1; itemY < repeatY+1; itemY++) {
        //drawSquare(origX + (w * itemX), origY + (h * itemY), w, h);
        let rnd = utils.random(0, totalWeight);
        if ((itemX*itemY) - (rnd/(Math.pow(10, level-1))) <= 0)  {drawSquare(origX + (w * itemX), origY + (h * itemY), w, h); }
      }
    } 
  }
  svgFile.newPath();
}

const sketch = (context) => {
  poly.init(context);
  
  let margin = 0;
  let elementWidth = 14;
  let elementHeight = 14;
  let columns = 1;
  let rows = 2;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let corners = [utils.getRandomInt(2),utils.getRandomInt(2),utils.getRandomInt(2),utils.getRandomInt(2)];//utils.getRandomBitMask(4);
      let space = utils.random(0.21,0.27);
      let skew1 = utils.random(-0.21,0.17);
      let skew2 = utils.random(-0.21,0.17);
      o[r].push([corners, space, skew1, skew2]);
    }
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;
    mainContext = context;

    let posX = marginLeft;
    let posY = marginTop;
    // let clip = [[posX, posY],[posX+drawingWidth, posY],[posX+drawingWidth, posY+drawingHeight],[posX, posY+drawingHeight]];

    // let a = drawingHeight / 20;
    // for (let index = 0; index < 60; index++) {
    //     let x = 0;
    //     let y = -drawingHeight + (index * a);

    //     let dash = createRandomDashedLine(x, y, 50, 40, 20, poly.createSquarePolygon(posX, posY, drawingWidth, drawingHeight));

    //     dash.forEach(element => {
    //       try {
    //         x = poly.clip(element, clip);
    //       } catch {}
    //       if (x) {
    //         x.map(l => {
    //           poly.drawLineOnCanvas(mainContext, [l[0], l[1]]);
    //           svgFile.addLine([l[0], l[1]]);
    //           });
           
    //       }
          
    //     });
    // }
    // svgFile.newPath();

    for (let row = 0; row < rows-1; row++) {
    	for (let col = 0; col < columns; col++) {
        //drawSquare(posX, posY, elementWidth);
        let corners = o[row][col][0];
        //corners = [1,0,1,0];//o[row][col][0];


        // if (row === 0) { corners[0] = 0; corners[1] = 0; }
        // if (row === rows - 1) { corners[2] = 0; corners[3] = 0; }
        // if (col === 0) { corners[0] = 0; corners[3] = 0; }
        // if (col === columns - 1) { corners[1] = 0; corners[2] = 0; }

        if (corners[0]) { drawTopLeft(posX, posY, elementWidth, {}); }
        if (corners[1]) { drawTopRight(posX, posY, elementWidth, {}); }
        if (corners[2]) { drawBottomRight(posX, posY + elementHeight, elementWidth, {}); }
        if (corners[3]) { drawBottomLeft(posX, posY + elementHeight, elementWidth, {}); }

        posX = posX + elementWidth + margin;
    	}
    	posX = marginLeft;
    	posY = posY + elementWidth + margin;
    }



    return [
      // Export PNG as first layer
      mainContext.canvas,
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
