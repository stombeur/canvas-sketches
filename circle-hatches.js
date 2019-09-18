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

  let margin = 0;
  let elementWidth = 1;
  let elementHeight = 1;
  let columns = 1;
  let rows = 1;
  
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

    let circles = [];
    circles.push({center: poly.point(width/3, height/3), r: width/2, hatchAngle: 20, hatchSpace: 0.2, innerOuter: 4/5});
    //circles.push({center: poly.point(width/4, height/4), r: width/4, hatchAngle: 25, hatchSpace: 0.1, innerOuter: 0.5});
    circles.push({center: poly.point(width/3*2, height/3*2), r: width/2, hatchAngle: 70, hatchSpace: 0.2, innerOuter: 3.5/5});
    circles.push({center: poly.point(width/2, height/2), r: width/2+2, hatchAngle: 12, hatchSpace: 0.2, innerOuter: 3.5/5});
    circles.push({center: poly.point(width/2*1.5, height/4*3), r: width/2+2, hatchAngle: 12, hatchSpace: 0.2, innerOuter: 3.5/5});

    circles.push({center: poly.point(width/3, height/2+4), r: width/4, hatchAngle: 10, hatchSpace: 0.2, innerOuter: 0.8});

    circles.forEach(c => {
      poly.hatchCircle(c.center, c.r, c.hatchAngle, c.hatchSpace).forEach(l => {
        let int2 = poly.findCircleLineIntersectionsP(c.r*c.innerOuter, c.center, l);
        if (int2 && int2.length > 0 && int2[0] && int2[1]) {
          let l1 = poly.toLine(l[0], int2[0]),
              l2 = poly.toLine(int2[1], l[1]);

          poly.drawLineOnCanvas(context, l1);
          poly.drawLineOnCanvas(context, l2);
          svgFile.addLine(l1);
          svgFile.addLine(l2);
        }
        else {
          poly.drawLineOnCanvas(context, l);
          svgFile.addLine(l);
        }
  
      });
      svgFile.newPath();
    });
    // poly.hatchCircle(circleCenter, r, 20, 0.2).forEach(l => {
    //   let int2 = poly.findCircleLineIntersectionsP(r/5*4, circleCenter, l);
    //   if (int2 && int2.length > 0 && int2[0] && int2[1]) {
    //     poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
    //     poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
    //   }
    //   else {
    //     poly.drawLineOnCanvas(context, l);
    //   }

    // });

    // poly.hatchCircle(circleCenter2, r/5*4, 31, 0.2).forEach(l => {
    //   let int2 = poly.findCircleLineIntersectionsP(r/5*3, circleCenter2, l);
    //   if (int2 && int2.length > 0 && int2[0] && int2[1]) {
    //     poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
    //     poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
    //   }
    //   else {
    //     poly.drawLineOnCanvas(context, l);
    //   }

    // });

    // poly.hatchCircle(circleCenter2, r/5*3, 12, 0.2).forEach(l => {
    //   let int2 = poly.findCircleLineIntersectionsP(r/5*2, circleCenter2, l);
    //   if (int2 && int2.length > 0 && int2[0] && int2[1]) {
    //     poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
    //     poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
    //   }
    //   else {
    //     poly.drawLineOnCanvas(context, l);
    //   }

    // });

    // poly.hatchCircle(circleCenter2, r/5*2, 87, 0.2).forEach(l => {
    //   let int2 = poly.findCircleLineIntersectionsP(r/5, circleCenter2, l);
    //   if (int2 && int2.length > 0 && int2[0] && int2[1]) {
    //     poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
    //     poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
    //   }
    //   else {
    //     poly.drawLineOnCanvas(context, l);
    //   }

    // });

    // poly.hatchCircle(circleCenter2, r/5, 120, 0.2).forEach(l => {
    //   let int2 = poly.findCircleLineIntersectionsP(r/10, circleCenter2, l);
    //   if (int2 && int2.length > 0 && int2[0] && int2[1]) {
    //     poly.drawLineOnCanvas(context, poly.toLine(l[0], int2[0]));
    //     poly.drawLineOnCanvas(context, poly.toLine(int2[1], l[1]));
    //   }
    //   else {
    //     poly.drawLineOnCanvas(context, l);
    //   }

    // });

    // poly.hatchCircle(circleCenter2, r/10, 145, 0.2).forEach(l => {
    //     poly.drawLineOnCanvas(context, l);
    // });

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
