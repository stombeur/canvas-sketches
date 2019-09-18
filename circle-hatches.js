// test for circle-line intersection

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');
const clip = require('./mapbox');

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

    let lines = [];

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

          lines.push(l1);
          lines.push(l2);
        }
        else {
          lines.push(l);
        }
  
      });
      //svgFile.newPath();
    });
    
    let bb = {left:margin, bottom:margin, right:width-margin, top: height-margin};
    let top = [[bb.left, bb.top], [bb.right, bb.top]];
    let left = [[bb.left, bb.top], [bb.left, bb.bottom]];
    let bottom = [[bb.left, bb.bottom], [bb.right, bb.bottom]];
    let right = [[bb.right, bb.top], [bb.right, bb.bottom]];

    //console.log({bb,top,left,right,bottom,nrOfLines:lines.length});
    
    let linesToDraw = [];
    let linesOutside = 0;
    linesInside = 0;
    lines.forEach(l => {
      if (l[0][0] <= bb.left && l[1][0] <= bb.left) { linesOutside++; return; }
      if (l[0][0] >= bb.right && l[1][0] >= bb.right) { linesOutside++; return; }
      if (l[0][1] >= bb.top && l[1][1] >= bb.top) { linesOutside++; return; }
      if (l[0][1] <= bb.bottom && l[1][1] <= bb.bottom) { linesOutside++; return; }

      if (poly.pointIsInsideBB(l[0], bb) && poly.pointIsInsideBB(l[1], bb)) { linesInside++; linesToDraw.push(l); return; }

      if (!poly.pointIsInsideBB(l[0], bb)) {
        // clip and take l[1];

      }
      let p1 = [l[0][0] || l[0].x, l[0][1] || l[0].y];
      let p2 = [l[1][0] || l[1].x, l[1][1] || l[1].y];
      let clipped = clip.polyline([p1, p2], [bb.bottom, bb.left, bb.right, bb.top]);
      if (clipped.length>0) {
        linesToDraw.push(clipped[0]);
      }
    });

    //console.log({linesOutside, linesInside});

    linesToDraw.forEach(l => {
      poly.drawLineOnCanvas(context, l);

      let p1 = [l[0][0] || l[0].x, l[0][1] || l[0].y];
      let p2 = [l[1][0] || l[1].x, l[1][1] || l[1].y];
      svgFile.addLine([p1, p2]);
    });

    console.log(svgFile);

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
