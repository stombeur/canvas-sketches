
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
      let radiuses1 = [big_radius, big_radius - margin/4];//, big_radius - margin, big_radius - (1.5*margin)];
      let radiuses2 = [big_radius - margin/1.5, big_radius - margin/1];//, big_radius - (2.5*margin)];

      // for (let r = 0; r < radiuses.length; r++) {
      //   const rad = radiuses[r];
      //   drawLines.push(drawArc(center, rad, 0, 360));
      // }

      for (let j = 0; j < 1; j++) {
        
        let isConvex = false;
        let points = [];
        while (!isConvex) {
          let nr_of_sides = random.range(5, 7);
          let radius = 1;
          let start = postcards.reorigin([w/2, h/2-radiuses1[radius]], origin);
          let startAngle = random.pick([...Array(360).keys()]);
          start = poly.rotatePoint(start, center, startAngle);
          points = [start];
        //debugger;
          let templines = [];
          for (let i = 0; i < nr_of_sides; i++) {
            let last = points[points.length-1]
            radius = radius + (random.boolean() ? 1 : -1);
            if (radius < 0) { radius = 0; }
            if (radius === radiuses1.length) { radius = radiuses1.length - 1; }
    
            let close = i+1 > nr_of_sides;
            if (close) { 
              templines.push(drawLine([last, points[0]]));
            } else {
              let q2 = [center[0], center[1] - radiuses1[radius]];
              q2 = poly.rotatePoint(q2, center, startAngle + 360 / nr_of_sides * (i+1));

              templines.push(drawLine([last, q2]));
              points.push(q2);
            }
    
          }
          isConvex = poly.isPolygonConvex(points);
          if (isConvex) { drawLines.push(...templines)}
        }
        let points2 = [];
        let templines = [];
        let facetlines = [];
        let facetpoints = [];

        // facetlijnen
        let skip = 1;
        let skipIndex = -1;
        for (let i = 0; i < points.length; i+=1) {
          if (random.boolean() && skip>0) { skip--; skipIndex = i; continue; } 
          //debugger;
          let int = poly.findCircleLineIntersectionsP(random.pick(radiuses2), center, [points[i], center]);
          let intpoint = int[0];
          if (int.length > 1 && !poly.isPointBetween(int[0], center, points[i]))
          {intpoint = int[1];}
          intpoint = [intpoint.x, intpoint.y];
          facetlines.push([points[i], intpoint]); 
          points2.push(intpoint);       
        }

        if (skipIndex>-1) {
          //debugger;
          let inverseSkipIndex = Math.floor(points.length/2);
          let l1 = facetlines[inverseSkipIndex], l2 = facetlines[inverseSkipIndex+1];
          let v1 = [l1[1][0]-l1[0][0], l1[1][1]-l1[0][1]]; //vector1
          let v2 = [l2[1][0]-l2[0][0], l2[1][1]-l2[0][1]]; //vector2
          let vavg = [(v1[0]+v2[0])/2, (v1[1]+v2[1])/2];
          for (let f = 0; f < facetlines.length; f++) {
            let v = vavg;
            //debugger;
            if (f === inverseSkipIndex) { facetpoints.push(facetlines[f][0]);}
            else if (f === inverseSkipIndex+1) { facetpoints.push(facetlines[f][0]);}
            else {
            let l = facetlines[f];
            templines.push([l[0], [l[1][0]-v[0], l[1][1]-v[1]]]);
            facetpoints.push([l[1][0]-v[0], l[1][1]+-v[1]]);
            }
          }
        }

        // facetverbindingen
        let last = facetpoints[facetpoints.length-1];
        for (let i = 0; i < facetpoints.length; i++) {
         
          templines.push([last, facetpoints[i]]);
          last = facetpoints[i];
        }

        templines.forEach(l => {
          drawLines.push(drawLine(l));
        });
        
      }

      
      

    }

    //postcards.drawOct(draw, width, height);

    let rows = 6;
    let columns = 8;
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