
const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('./utils/postcards');
const random = require('canvas-sketch-util/random');
const { distanceBetween } = require('./utils/poly');
const poly = require('./utils/poly');


const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const drawArc = (center, radius, sAngle, eAngle) => {
  return createPath(ctx => {
    let c = {}
    if (center.x) { c.x = center.x; c.y = center.y; }
    else { c.x = center[0]; c.y = center[1]; }
    drawArcOnCanvas(ctx, c.x, c.y, radius, sAngle, eAngle);
  });
}

const drawArcOnCanvas = (ctx, cx, cy, radius, sAngle, eAngle) => {
  //ctx.beginPath();
  ctx.arc(
    cx,
    cy,
    radius,
    (Math.PI / 180) * sAngle,
    (Math.PI / 180) * eAngle
  );
  //ctx.stroke();
};

const drawLine = (l) => {
  return createPath(ctx => {
    drawLineOnCanvas(ctx, l);
  });
}

const drawLineOnCanvas = (ctx, line) => {
  let x1 = line[0].x  || line[0][0],
      x2 = line[1].x || line[1][0],
      y1 = line[0].y || line[0][1],
      y2 = line[1].y || line[1][1];

  //console.log({line:[[x1,y1],[x2,y2]]})

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
};


let paths = [];
let background = [];




const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    
    paths = [];
    background = [];

    const draw = (origin, w, h, options) => {
      // let type = options[options.index];
      // console.log(type)


      let margin = w * 0.09;
      //if (type === "single") { margin = w * 0.14; }
      let ww = w - (margin*2);
      let hh = h - (margin*2);

 

      // draw background
      let xmin = origin[0]+margin;
      let xmax = origin[0]+ww+margin;
      let ymin = origin[1]+margin;
      let ymax = origin[1]+hh+margin;
      let box = [[xmin,ymin],[xmax,ymin],[xmax,ymax],[xmin,ymax]];
      //debugger;
      let hatchlines = poly.hyperspacePolygon(box, 2);
      hatchlines.forEach(l => {
        let nr = random.rangeFloor(4, 17);
        let segments = [...new Array(nr)].map(()=> random.range(0.001, 10000));
        let dashes = poly.dashLine(l, segments);
        let blank = false;
        dashes.forEach(d => { 
          if (!blank) {paths.push(drawLine(d));}
          blank = !blank;
        });
        //paths.push(drawLine(l));
      });
      
    };

    let options = {1:"few", 2:"more", 3:"more", 4:"few"};

    postcards.drawSingle(draw, width, height, options);

    return renderGroups([paths, background], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);