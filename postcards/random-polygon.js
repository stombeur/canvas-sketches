
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const random = require('canvas-sketch-util/random');
const poly = require('../utils/poly');

let drawLines = [];

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'landscape',
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


const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    drawLines = [];

    // binnen cirkel blijven
    // aantal segmenten random onder en bovengrens
    // lengte per segment bepalen 
    // hoe convex blijven?
    // naar binnen springen (kleinere cirkels)

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h) => {
      this.paths = [];
      const margin = w * 0.15;
      let center = postcards.reorigin([w/2, h/2], origin);

      let big_radius = (w - margin)/2;
      let radiuses = [big_radius, big_radius - margin/2, big_radius - margin, big_radius - (1.5*margin), big_radius - (2*margin), big_radius - (2.5*margin)];

      // for (let r = 0; r < radiuses.length; r++) {
      //   const rad = radiuses[r];
      //   drawLines.push(drawArc(center, rad, 0, 360));
      // }

      for (let j = 0; j < 5; j++) {
        
        let isConvex = false;
        let points = [];
        while (!isConvex) {
          let nr_of_sides = random.range(5, 9);
          let radius = 1;
          let start = postcards.reorigin([w/2, h/2-radiuses[radius]], origin);
          let startAngle = random.pick([...Array(30).keys()]);
          start = poly.rotatePoint(start, center, startAngle);
          points = [start];
        //debugger;
        for (let i = 0; i < nr_of_sides; i++) {
          let last = points[points.length-1]
          radius = radius + (random.boolean() ? 1 : -1);
          if (radius < 0) { radius = 0; }
          if (radius === radiuses.length) { radius = radiuses.length - 1; }
  
          let close = i+1 > nr_of_sides;
          if (close) { 
            drawLines.push(drawLine([last, points[0]]));
          } else {
            let q2 = [center[0], center[1] - radiuses[radius]];
            q2 = poly.rotatePoint(q2, center, 360 / nr_of_sides * (i+1));
    
            
            drawLines.push(drawLine([last, q2]));
            points.push(q2);
          }
  
        }
          isConvex = poly.isPolygonConvex(points);
        }
      }

     
      

    }

    //postcards.drawOct(draw, width, height);

    let rows = 3;
    let columns = 4;
    let margin = 8;

    let ww = width - (margin*2);
    let hh = height - (margin*2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        let x = ww/columns*c + margin;
        let y = hh/rows*r + margin;
        draw([x,y], ww/columns, hh/rows);
      }
      
    }

    return renderPaths(drawLines, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);