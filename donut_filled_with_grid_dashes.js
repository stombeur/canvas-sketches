// fill a donut with squares

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');
const noise = require('./utils/perlin').noise;


let svgFile = new penplot.SvgFile();

// grid settings
let margin = 0.6;
let elementWidth = 2;
let elementHeight = 2;
let columns = 4;
let rows = 4;

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;


  
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    noise.seed(Math.random());
    let grid = [];
    let rows = Math.floor(height) * 4;
    let cols = Math.floor(width) * 4;
    for (let r = 1; r < rows; r++) {
      let row = []; 
      for (let c = 1; c < cols; c++) {
        let pValue = Math.abs(noise.perlin2(c / 100, r / 100));
        //console.log(pValue)
        let x = width / cols * c;
        let y = height / rows * r;
        let rot = pValue * 180; //utils.getRandomIntInclusive(180);
        if (rot < 1) { rot = 0.1;}
        row.push({p:poly.point(x, y), rot});
      }
      grid.push(row);
    }

    const drawSquare = (origin) => {
        //console.log(origin);
        let s = poly.createSquarePolygon(origin.x, origin.y, 0.3, 0.3);
        let corner = utils.getRandomInt(3);
        let i = utils.getRandomInt(1);
        let pos = utils.getRandomInt(1);
        let d = 0.03;
        let offset = pos ? d : -d;
        s[corner][i] = s[corner][i] + offset;

        poly.drawPolygonOnCanvas(context, s);
        svgFile.addLine(s, true);
      }

      const drawDash = (origin, rot, length = 0.2) => {
        //console.log(origin);
        let start = [origin.x - length/2, origin.y];
        let end = [origin.x + length/2, origin.y];
        let line = poly.rotatePolygon([start, end], origin, rot);

        poly.drawLineOnCanvas(line);
        // context.beginPath();
        // context.moveTo(line[0][0], line[0][1]);
        // context.lineTo(line[1][0], line[1][1]);
        // context.stroke();
        svgFile.addLine(line, false);
      }

      const drawArc = (origin, rotate, radius = 0.1) => {
        let arc = utils.getRandom(Math.PI/2, Math.PI/4);
        let rot = rotate / 180*Math.PI; //utils.getRandom(Math.PI);

        context.beginPath();
        context.arc(origin.x, origin.y, radius, rot, rot+arc);
        context.stroke();

        svgFile.addArc(origin.x, origin.y, radius, rotate, (rotate+(arc*180/Math.PI))) // /Math.PI*180        
    }

    // grid repeat starts here
    let posX = marginLeft;
    let posY = marginTop;

    let circle = { center: poly.point(width/2, height/2), radius: width/2 - 2 };
    let innercircle = { center: poly.point(width/2, height/2), radius: (width/2 - 2 ) / 1.8 }
    //poly.drawCircle(context)(circle.center.x, circle.center.y, circle.radius);


    for (let r = 0; r < rows-1; r++) {
      let row = grid[r];
     
      for (let c = 0; c < cols-1; c++) {
        let el = row[c];
        if (!poly.pointIsInCircle(el.p, circle.center, circle.radius)) {
          drawDash(el.p, el.rot, 0.2); 
          // drawArc(el.p, el.rot, 0.2); 
        }
        else if (poly.pointIsInCircle(el.p, innercircle.center, innercircle.radius))
        { 
         drawDash(el.p, el.rot, 0.2); 
        //  drawArc(el.p, el.rot, 0.2); 
        }
      }
      svgFile.newPath();
    }

    // grid.forEach(el => {
    //   if (!poly.pointIsInCircle(el.p, circle.center, circle.radius)) {
    //     drawDash(el.p, el.rot, 0.2); 
    //     // drawArc(el.p, el.rot, 0.2); 
    //   }
    //   else if (poly.pointIsInCircle(el.p, innercircle.center, innercircle.radius))
    //   { 
    //    drawDash(el.p, el.rot, 0.2); 
    //   //  drawArc(el.p, el.rot, 0.2); 
    //   }
    // });

    // for (let index = 0; index < 20000; index++) {
    //     let x = utils.getRandom(circle.radius*2) - circle.radius;
    //     let y = utils.getRandom(circle.radius* 2) - circle.radius;
        
    //     let point = poly.point(circle.center.x + x, circle.center.y + y);
    //     //console.log(point);
    //     if (poly.pointIsInCircle(point, circle.center, circle.radius)) {
    //         if (!poly.pointIsInCircle(point, innercircle.center, innercircle.radius))
    //         { drawElement(point); }
    //     }
        
    // }
    

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
