// hatched/skewed circles
// multi-page side-by-side

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();
let svgFile2 = new penplot.SvgFile();
let svgFile3 = new penplot.SvgFile();

const settings = {
  dimensions: [(29.7 * 3), 42.0],
  orientation: 'landscape',
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
  
  return ({ context, twidth, theight, units }) => {

    svgFile = new penplot.SvgFile();
    svgFile2 = new penplot.SvgFile();
    svgFile3 = new penplot.SvgFile();
    poly.init(context);

    let width = 29.7,
        height = 42.0;

    const drawBounds = (w, h, m, offsetX, options = {}) => {
      let result = [];

      let x = offsetX + m;
      let y = m;

      result.push([x, y]);
      result.push([x + w - 2*m, y]);
      result.push([x + w - 2*m, y + h - 2*m]);
      result.push([x, y + h - 2*m]);

      context.beginPath();
  
      context.strokeStyle = options.strokeStyle || 'black';
      context.lineWidth = options.lineWidth || 0.01;
      context.lineCap = options.lineCap || 'square';
      context.lineJoin = options.lineJoin || 'miter';
    
      context.moveTo(result[0][0], result[0][1]);
    
      result.map(function(point) {
        context.lineTo(point[0], point[1]);
      });
    
      context.lineTo(result[0][0], result[0][1]);
    
      context.stroke();
    }
    

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    drawBounds(width, height, margin, 0);
    drawBounds(width, height, margin, width);
    drawBounds(width, height, margin, width * 2);

    let bb = {xmin:margin, ymin:margin, xmax:width-margin, ymax:height-margin};
    let bb2 = {xmin:width + margin, ymin:margin, xmax:(2*width)-margin, ymax:height-margin};
    let bb3 = {xmin:(2*width) + margin, ymin:margin, xmax:(3*width)-margin, ymax:height-margin};


    let circles = [];
    circles.push({center: poly.point(width/3, height/3), r: width/2, hatchAngle: 20, hatchSpace: 0.17, innerOuter: 4/5, innerCenter: poly.point((width/3)+1.5, (height/3)+1.5)});
    //circles.push({center: poly.point(width/4, height/4), r: width/4, hatchAngle: 25, hatchSpace: 0.1, innerOuter: 0.5, innerCenter: poly.point((width/4)+0.8, (height/4)+1.2)});
    circles.push({center: poly.point(width/3*2, height/3*2), r: width/2, hatchAngle: 70, hatchSpace: 0.16, innerOuter: 3.5/5, innerCenter: poly.point((width/3*2)-1, (height/3*2)+0.8)});
    circles.push({center: poly.point(width-5, height/4*3), r: width/2+2, hatchAngle: 44, hatchSpace: 0.18, innerOuter: 3.5/5, innerCenter: poly.point(width-4, height/4*3+1)});

    circles.push({center: poly.point(-width/2, height/2+4), r: width, hatchAngle: 85, hatchSpace: 0.17, innerOuter: 0.77, innerCenter: poly.point((-width/2)+1.5, (height/2+4)-0.2)});

    circles.push({center: poly.point(width+2, height/3), r: width/2, hatchAngle: 20, hatchSpace: 0.15, innerOuter: 4/5, innerCenter: poly.point((width)+3.5, (height/3)+1.5)});
    circles.push({center: poly.point(width*2-8, width+5), r: width/2+2, hatchAngle: 41, hatchSpace: 0.14, innerOuter: 4.1/5, innerCenter:poly.point(width*2-10, width+6)});

    circles.push({center: poly.point(width*2+3, height/2+2), r: width/2+2, hatchAngle: 33, hatchSpace: 0.14, innerOuter: 4.1/5, innerCenter:poly.point(width*2+4, height/2+1)});
    circles.push({center: poly.point(width*3, height/2+2), r: height, hatchAngle: 12, hatchSpace: 0.14, innerOuter: 4.3/5, innerCenter:poly.point(width*3, height/2+6)});
    circles.push({center: poly.point(width*2.5-3, height*1.2), r: width/2+4, hatchAngle: 7, hatchSpace: 0.14, innerOuter: 4.1/5, innerCenter:poly.point(width*2.5-1.5, height*1.2-2)});


    circles.forEach(c => {

      let x = poly.hatchDonut(c.center, c.r, c.r * c.innerOuter, c.hatchAngle, c.hatchSpace, c.innerCenter);
      x.forEach(l => { 
        let clippedLine = poly.clipLineToBB(l, bb);
        if (clippedLine) { 
          poly.drawLineOnCanvas(clippedLine);
          let p1 = [clippedLine[0][0] || clippedLine[0].x, clippedLine[0][1] || clippedLine[0].y];
          let p2 = [clippedLine[1][0] || clippedLine[1].x, clippedLine[1][1] || clippedLine[1].y];
          svgFile.addLine([p1, p2]);
         }

         let clippedLine2 = poly.clipLineToBB(l, bb2);
        if (clippedLine2) { 
          poly.drawLineOnCanvas( clippedLine2);
          let p1 = [clippedLine2[0][0] - width || clippedLine2[0].x - width, clippedLine2[0][1] || clippedLine2[0].y];
          let p2 = [clippedLine2[1][0] - width || clippedLine2[1].x - width, clippedLine2[1][1] || clippedLine2[1].y];
          svgFile2.addLine([p1, p2]);
         }

          clippedLine = poly.clipLineToBB(l, bb3);
        if (clippedLine) { 
          poly.drawLineOnCanvas( clippedLine);
          let p1 = [clippedLine[0][0] - width*2 || clippedLine[0].x - width*2, clippedLine[0][1] || clippedLine[0].y];
          let p2 = [clippedLine[1][0] - width*2 || clippedLine[1].x - width*2, clippedLine[1][1] || clippedLine[1].y];
          svgFile3.addLine([p1, p2]);
         }
      });

      svgFile.newPath();
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
      },
      {
        data: svgFile2.toSvg({
          width,
          height,
          units
        }),
        extension: '.svg',
      },
      {
        data: svgFile3.toSvg({
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
