// test for circle-line intersection

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 0.2;
  let elementWidth = 2;
  let elementHeight = 2;
  let columns = 8;
  let rows = 14;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  // let o = [];
  // for (let r = 0; r < rows; r++) {
  //   o[r] = [];
  //   for (let i = 0; i < columns; i++) {
  //     let rot = utils.getRandomInt(4,0) * 90;//utils.random(0, 360);
  //     let size = utils.random(45, 270);
  //     let quarter = utils.getRandomInt(4,1);
  //     o[r].push([rot, size, quarter]);
  //   }
  // }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    const drawCircle = (cx, cy, radius) => {
  
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    
      svgFile.addCircle(cx, cy, radius);
    }
    
    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(cx, cy, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      context.stroke();
    
      svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    let posX = marginLeft;
    let posY = marginTop;

    let line = [[posX, posY],[posX + drawingWidth, posY + drawingHeight/2]];
    //poly.drawLineOnCanvas(context, line);

    let r = drawingWidth/3;
    let circleCenter = poly.point(posX + drawingWidth/2, posY + drawingHeight/4);
    drawCircle(circleCenter.x, circleCenter.y, r);

    let intersections = poly.findCircleLineIntersectionsP(r, circleCenter, line);
    console.log(intersections);

    // let angle = Math.atan(drawingWidth/drawingHeight);
    // let d1 = x[0];
    // let xd1 = Math.cos(angle)*d1;
    // let yd1 = Math.sin(angle)*d1;
    // let int1 = poly.point(posX + xd1, posY + yd1);
    // drawCircle(int1.x, int1.y, 0.5);

    // let z = poly.lineEquationFromPoints(line[0], line[1]);
    // console.log(z);
    // //let x1 = x[0] + r;
    // let y1 = z.m * x[0] + z.n;
    // let y2 = z.m * x[1] + z.n;
    // console.log(y1,y2);

    //drawCircle(x[0][0], x[0][1], 0.5);
    //drawCircle(x[1][0], x[1][1], 0.5);
    //poly.drawLineOnCanvas(context, [[x[0][0], x[0][1]], [x[1][0], x[1][1]]]);
    poly.drawLineOnCanvas(context, poly.toLine(intersections[0], intersections[1]))

    let circleCenter2 = poly.point(posX + drawingWidth/2, posY + drawingHeight/4*3);
    //drawCircle(circleCenter2.x, circleCenter2.y, r);
    //poly.hatchCircle(circleCenter2, r, 20, 0.2).forEach(l => poly.drawLineOnCanvas(context, l));

    
    poly.hatchCircle(circleCenter2, r, 20, 0.2).forEach(l => {
      let int2 = poly.findCircleLineIntersectionsP(r/5*4, circleCenter2, l);
      if (int2 && int2.length > 0 && int2[0] && int2[1]) {
        poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
        poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
      }
      else {
        poly.drawLineOnCanvas(context, l);
      }

    });

    poly.hatchCircle(circleCenter2, r/5*4, 31, 0.2).forEach(l => {
      let int2 = poly.findCircleLineIntersectionsP(r/5*3, circleCenter2, l);
      if (int2 && int2.length > 0 && int2[0] && int2[1]) {
        poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
        poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
      }
      else {
        poly.drawLineOnCanvas(context, l);
      }

    });

    poly.hatchCircle(circleCenter2, r/5*3, 12, 0.2).forEach(l => {
      let int2 = poly.findCircleLineIntersectionsP(r/5*2, circleCenter2, l);
      if (int2 && int2.length > 0 && int2[0] && int2[1]) {
        poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
        poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
      }
      else {
        poly.drawLineOnCanvas(context, l);
      }

    });

    poly.hatchCircle(circleCenter2, r/5*2, 87, 0.2).forEach(l => {
      let int2 = poly.findCircleLineIntersectionsP(r/5, circleCenter2, l);
      if (int2 && int2.length > 0 && int2[0] && int2[1]) {
        poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
        poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
      }
      else {
        poly.drawLineOnCanvas(context, l);
      }

    });

    poly.hatchCircle(circleCenter2, r/5, 120, 0.2).forEach(l => {
      let int2 = poly.findCircleLineIntersectionsP(r/10, circleCenter2, l);
      if (int2 && int2.length > 0 && int2[0] && int2[1]) {
        poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
        poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
      }
      else {
        poly.drawLineOnCanvas(context, l);
      }

    });

    poly.hatchCircle(circleCenter2, r/10, 145, 0.2).forEach(l => {
        poly.drawLineOnCanvas(context, l);
    });

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
      }
    ];
  };
};

canvasSketch(sketch, settings);
