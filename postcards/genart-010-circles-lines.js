
const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const poly = require('../utils/poly');
const random = require('canvas-sketch-util/random');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');

let paths = [];

const createGrid = (count, width, height) => {
  const points = [];

  const countX = count;
  const countY = Math.floor(countX / width * height);

  for (let x = 0; x < countX; x++) {
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      const position = [ u, v ];
      const noise = random.noise2D(u,v);
      const radius = Math.abs(noise) * 0.030;

      points.push({ radius: Math.abs(radius),
                    position,
                    rotation: random.noise2D(u+2,v)
                  });
    }
  }
  return points;
};

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

const drawLineOnCanvas = (ctx, line) => {
  let x1 = line[0].x  || line[0][0],
      x2 = line[1].x || line[1][0],
      y1 = line[0].y || line[0][1],
      y2 = line[1].y || line[1][1];

  //console.log({line:[[x1,y1],[x2,y2]]})

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
};



const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {
    const count = 14;
    
    paths = [];


    const draw = (origin, w, h) => {
      const margin = w * 0.20;
      
      random.setSeed(random.getRandomSeed());
      console.log(random.getSeed());

      let points = createGrid(count, w, h).filter(() => {
        return Math.random() > 0.85;
      });
      
      let m = new Map();
      let lines = new Map();

      const increase = (key) => {
        let k = JSON.stringify(key);
        if (!m.has(k)) { m.set(k, {p: key, r: 0.55}); }
        else {
          va = m.get(k);
          va.r = va.r + 0.55;
          m.set(k, va);
        }
      }

      const addLine = (p1, p2) => {
        //drawLineOnCanvas(ctx, [p1, p2]); 
        increase(p1);
        lines.set(JSON.stringify([p1,p2]), {p1, p2});
      }

      points.forEach(data => {
        const {
          position,
          radius,
          rotation
        } = data;

        const x0 = lerp(margin, w - margin, position[0]);
        const y0 = lerp(margin, h - margin, position[1]);
        const [x,y] = postcards.reorigin([x0,y0], origin);
  
        //find closest points
        let p = Array.from(points, x => {
          const xx = lerp(margin, w - margin, x.position[0]);
          const yy = lerp(margin, h - margin, x.position[1]);
          return postcards.reorigin([xx,yy], origin);
        });
        p.sort((a,b) => poly.distanceBetween([x,y], a) - poly.distanceBetween([x,y], b));

        paths.push(createPath(ctx => {
          addLine([x,y], p[1]); 
          addLine([x,y], p[2]);
          addLine([x,y], p[3]);
          // doLine(ctx, [x,y], p[4]);
          // doLine(ctx, [x,y], p[5]);
        }));

       
        
      });

      m.forEach((v, k) => {
        let [x,y] = v.p;
       // console.log([x,y])
        paths.push(createPath(ctx => {
          let maxr = v.r;
          let nrOfCircles = v.r;
          let step = maxr / nrOfCircles;
          // for (let i = 1; i <= nrOfCircles; i++) {
          //   drawArcOnCanvas(ctx, x, y, i * step, 0, 360);
          // }
          drawArcOnCanvas(ctx, x, y, v.r, 0, 360);
      }));
      });
     
      lines.forEach((v,k)=> {
         //todo: 
        // derive line equation
        // intersect line with circle
        // check which intersection is between the two endpoints of the segment

        let [p1,p2] = [v.p1, v.p2];
        let eq = poly.lineEquationFromPoints(p1,p2);

        let c1 = m.get(JSON.stringify(p1));
        let c2 = m.get(JSON.stringify(p2));
        let i1 = poly.findCircleLineIntersectionsWithY(c1.r, c1.p[0], c1.p[1], eq.m, eq.n);
        let i2 = poly.findCircleLineIntersectionsWithY(c2.r, c2.p[0], c2.p[1], eq.m, eq.n);

        let p1b, p2b;
        if (i1.length > 0) {
          p1b = i1[0];
          if (!poly.isPointBetween(i1[0], p1, p2)) {
            p1b = i1[1];
          }
        }
        if (i2.length > 0) {
          p2b = i2[0];
          if (!poly.isPointBetween(i2[0], p1, p2)) {
            p2b = i2[1];
          }
        }

        let ok = true;

        // todo iterate over m
        // check if there are intersections
        // split line
        m.forEach((v,k)=> {
          if (k === JSON.stringify(p1) || k === JSON.stringify(p2)) { return; }
          let int = poly.findCircleLineIntersectionsWithY(v.r, v.p[0], v.p[1], eq.m, eq.n);
          if (int.length > 1) {
            if (poly.isPointBetween(int[0], p1, p2) && poly.isPointBetween(int[1], p1, p2)) {
              ok = false;
              paths.push(createPath(ctx => {
                let d1 = poly.distanceBetween(p1b, int[0]);
                let d2 = poly.distanceBetween(p1b, int[1]);
                if (d1 < d2) {
                  drawLineOnCanvas(ctx, [p1b, int[0]]);
                  drawLineOnCanvas(ctx, [int[1], p2b]);
                }
                else {
                  drawLineOnCanvas(ctx, [p1b, int[1]]);
                  drawLineOnCanvas(ctx, [int[0], p2b]);
                }

              }));
            
            }
             
          }
        });

        if (ok && p1b && p2b) {
          paths.push(createPath(ctx => {
            drawLineOnCanvas(ctx, [p1b, p2b])
          }));
        }

      });

    }

    postcards.drawQuad(draw, width, height);

    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);