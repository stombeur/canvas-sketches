// fill a moon/skewed donut with squares

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();

// grid settings
let margin = 0.6;
let elementWidth = 2;
let elementHeight = 2;
let columns = 4;
let rows = 4;

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

//297, 420
let w = 29.7;
let h = 42;

const sketch = (context) => {

  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  // nr of circles -> 5 to 7
  // center is on page
  // radius = width/3.5 tot width/2+2
  // inner center = displaced by 1 to 3 (or minus)
  // inner radius = outer * 0.7 tot 0.8

  let circles = [];
  let innercircles = [];
  let nrOfCircles = utils.getRandomInt(7, 5);
  for (let r = 0; r < nrOfCircles; r++) {
    circles[r] = {};
    circles[r].center = {x: utils.getRandom(w), y: utils.getRandomInt(h)};
    circles[r].r = utils.getRandom(Math.max(w/3.5, w/2+2), Math.min(w/3.5, w/2+2));
    let displaceSignX = utils.getRandomInt(1) == 1 ? 1 : -1;
    let displaceSignY = utils.getRandomInt(1) == 1 ? 1 : -1;
    let displaceX = utils.getRandom(2.5,1);
    let displaceY = utils.getRandom(2.5,1);
    innercircles[r] = {};
    innercircles[r].center = { x: circles[r].center.x + (displaceX * displaceSignX), y: circles[r].center.y + (displaceY * displaceSignY)  }
    innercircles[r].r = circles[r].r * utils.getRandom(0.85, 0.75);
  }

  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    const drawElement = (origin) => {
        let a = 0.1;
        let line  = [[origin.x - a, origin.y],[origin.x+ a, origin.y]];
        let rot = utils.getRandom(180);

        let rotLine = poly.rotatePolygon(line, origin, rot);

        poly.drawLineOnCanvas(rotLine);
        svgFile.addLine(rotLine);
           
    }

    const drawElement3 = (origin) => {
        let arc = utils.getRandom(Math.PI/2*3, Math.PI/2);
        let rot = utils.getRandom(Math.PI);

        context.beginPath();
        context.arc(origin.x, origin.y, 0.1, rot, rot+arc);
        context.stroke();

        svgFile.addArc(origin.x, origin.y, 0.1, rot*Math.PI/180, (rot+arc)*Math.PI/180) // /Math.PI*180        
    }

    const drawElement2 = (origin) => {
        //console.log(origin);
        let s = poly.createSquarePolygon(origin.x, origin.y, 0.2, 0.2);
        let corner = utils.getRandomInt(3);
        let i = utils.getRandomInt(1);
        let pos = utils.getRandomInt(1);
        let d = 0.03;
        let offset = pos ? d : -d;
        s[corner][i] = s[corner][i] + offset;

        poly.drawPolygonOnCanvas(context, s);
        svgFile.addLine(s, true);
      }

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    // circles = [];
    // innercircles = [];
    // circles.push({center: poly.point(width/3, height/3), r: width/2});
    // innercircles.push({center: poly.point((width/3)+1.5, (height/3)+1.5), r: width/2*4/5});
    // circles.push({center: poly.point(width/3*2, height/3*2), r: width/2});
    // innercircles.push({center: poly.point((width/3*2)-1, (height/3*2)+0.8), r: width/2*3.5/5});
    // circles.push({center: poly.point(width/2, height/2), r: width/2+2});
    // innercircles.push({center: poly.point(width/2, height/2), r: width/2+2*3.5/5});
    // circles.push({center: poly.point(width/2*1.5, height/4*3), r: width/2+2});
    // innercircles.push({center: poly.point(width/2*1.5, height/4*3), r: width/2+2*3.5/5});
    // circles.push({center: poly.point(width/10, height/2+4), r: width/3.5});
    // innercircles.push({center: poly.point((width/10)+1.5, (height/2+4)-0.2), r: width/3.5*0.73});


    for (let index = 0; index < 30000; index++) {
        let x = utils.getRandom(width);
        let y = utils.getRandom(height);
        
        let point = poly.point(x,y);
        //console.log(point);
     
        for (let i = 0; i < circles.length; i++) {
            const circle = circles[i];
            const innercircle = innercircles[i];
            if (poly.pointIsInCircle(point, circle.center, circle.r)) {
                if (!poly.pointIsInCircle(point, innercircle.center, innercircle.r))
                { drawElement(point); }
            }
        }
        
    }
    

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
