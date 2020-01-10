// starter file with grid

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const poly = require('./utils/poly');
const random = require('./utils/random');


let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

let margin = 0.5; // from edge
let offset = 2; // from center

let papersize = canvasSketch.PaperSizes['a3'].dimensions;
let center = [papersize[0]/2, papersize[1]/2];

let segment = 10;
let circle_segments = 360 / segment; // circle divided by degree per segment

const sketch = (context) => {
  
  // randomness
  let o = [];
  for (let s = 0; s < circle_segments; s++) {
    let angle = s * segment;
    let maxlength = Math.min(center[0], center[1]) - offset - margin;
    let width = 2;
    let height = random.getRandom(maxlength, width);

    o.push({angle, width, height});
  }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    const drawSquare = (origin) => {
      //console.log(origin);
      let s = poly.createSquarePolygon(origin.x, origin.y, 5, 5);
      console.log(s)
      // let corner = random.getRandomInt(3);
      // let i = random.getRandomInt(1);
      // let pos = random.getRandomInt(1);
      // let d = 0.03;
      // let offset = pos ? d : -d;
      // s[corner][i] = s[corner][i] + offset;

      poly.drawPolygonOnCanvas(s);
      svgFile.addLine(s, true);
    }

    const drawElement = (origin, width, height, rotate) => {
      // let s = poly.createSquarePolygon(origin[0], origin[1], 3, 3);
      // let rectangle = [[origin[0] - width/2, origin[1]],
      //               [origin[0] + width/2, origin[1]],
      //               [origin[0] - width/2, origin[1] - height],
      //               [origin[0] + width/2, origin[1] - height]];
      //               console.log(rectangle)
      // let rotatedRectangle = poly.rotatePolygon(rectangle, center, rotate);
      // console.log(rotatedRectangle)
      // poly.drawPolygonOnCanvas(context, s);
      // poly.drawLineOnCanvas([s[0],s[1]])
      // svgFile.addLine(rectangle, true);
    };

    let origin = [center[0], center[1] - offset];
    console.log(origin)

    drawElement(origin, 3, 5, 0);
    drawSquare(origin)

    o.forEach(element => {
      //drawElement(origin, element.width, element.height, element.angle);
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
