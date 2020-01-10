// fill a donut with squares

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');
const noise = require('./utils/perlin').noise;


let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

let margin = 1; // from edge
let offset = 5; // from center

let papersize = canvasSketch.PaperSizes['a3'].dimensions;
let center = [papersize[0]/10/2, papersize[1]/10/2];
let hypo = Math.sqrt(Math.pow(papersize[0]/10/2, 2) + Math.pow(papersize[1]/10/2, 2));
let maxL = center[1];
let minL = center[0];
// let quarterAngle = Math.atan(minL / maxL) / Math.PI * 180;
console.log({hypo, maxL, minL})

let segment = 30;
let circle_segments = 360 / segment; // circle divided by degree per segment

const sketch = (context) => {
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    // randomness
    let o = [];
    for (let s = 0; s <= circle_segments; s++) {
      let angle = s * segment;
      let maxlength = Math.min(center[0], center[1]) - offset - margin;
      let minlength = 2;
     // if (angle <= 45) { maxlength = Math.max(center[0], center[1]) - offset - margin; minlength = Math.min(center[0], center[1]) - offset - margin; }
     //if (angle === 0) { maxlength = maxL - offset - margin; minlength = offset;  }
     if (angle <= 35) { maxlength = maxL + angle/35*(hypo-maxL) - offset - margin; minlength = offset; } //
     if (angle > 35 && angle <= 90) { maxlength = hypo - (angle-35)/55*(hypo-minL) - offset - margin; minlength = offset; } //
     if (90 < angle && angle <= 145 ) { maxlength = minL + (angle-90)/55*(hypo-minL) - offset - margin; minlength = offset; } //
     if (145 < angle && angle <= 180 ) { maxlength = hypo - (angle-145)/35*(hypo-maxL) - offset - margin; minlength = offset; } //
     if (180 < angle && angle <= 215 ) { maxlength = maxL + (angle-180)/35*(hypo-maxL) - offset - margin; minlength = offset; } //
     if (215 < angle && angle <= 270 ) { maxlength = hypo - (angle-215)/55*(hypo-minL) - offset - margin; minlength = offset; } //
     if (270 < angle && angle <= 325 ) { maxlength = minL + (angle-270)/55*(hypo-minL) - offset - margin; minlength = offset; } //
     if (325 < angle && angle <= 360 ) { maxlength = hypo - (angle-325)/35*(hypo-maxL) - offset - margin; minlength = offset; } //

     console.log([angle, maxlength, minlength])



      let height = maxlength; //utils.getRandom(maxlength, minlength);

      o.push({angle, width:2, height});
    }

    const drawSquare = (origin) => {
        //console.log(origin);
        let s = poly.createSquarePolygon(origin.x, origin.y, 5, 5);
        // let corner = utils.getRandomInt(3);
        // let i = utils.getRandomInt(1);
        // let pos = utils.getRandomInt(1);
        // let d = 0.03;
        // let offset = pos ? d : -d;
        // s[corner][i] = s[corner][i] + offset;

        poly.drawPolygonOnCanvas(s);
        svgFile.addLine(s, true);
      }

      const drawElement = (origin, width, height, rotate) => {
        let rectangle = [[origin.x - width/2, origin.y],
                      [origin.x + width/2, origin.y],
                      [origin.x + width/2, origin.y - height],
                      [origin.x - width/2, origin.y - height]];
        let rotatedRectangle = poly.rotatePolygon(rectangle, center, rotate);
        poly.drawPolygonOnCanvas(rotatedRectangle);
        svgFile.addLine(rotatedRectangle, true);
      };
  

      const drawDash = (origin, rot, length = 0.2) => {
        //console.log(origin);
        let start = [origin.x - length/2, origin.y];
        let end = [origin.x + length/2, origin.y];
        let line = poly.rotatePolygon([start, end], origin, rot);

        poly.drawLineOnCanvas(line);
        svgFile.addLine(line, false);
      }

      let origin = poly.point(center[0], center[1] - offset);
      console.log(origin)
  
      //drawElement(origin, 3, 5, 0);
      //drawDash(origin, 0, 3)
      //drawSquare(origin)
      //drawElement(origin, 3, 5, 0)
      //poly.drawPolygonOnCanvas([[0,0],[5,5], [20,20], [1,1]])
  
      o.forEach(element => {
        drawElement(origin, element.width, element.height, element.angle);
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
