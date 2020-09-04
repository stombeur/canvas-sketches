
const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const poly = require('../utils/poly');
const random = require('canvas-sketch-util/random');

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

      let points = createGrid(count, w, h).filter(() => {
        return Math.random() > 0.85;
      });

      let m = new Map();

      const increase = (key) => {
        let k = JSON.stringify(key);
        if (!m.has(k)) { m.set(k, 1); }
        else {
          m.set(k, m.get(k)+1);
        }
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
          drawLineOnCanvas(ctx, [[x,y], p[1]]); increase(p[1]); //m.set(p[1], (m.get(p[1]))+1);
          drawLineOnCanvas(ctx, [[x,y], p[2]]); increase(p[2]); // m.set(p[2], (m.get(p[2]))+1);
          drawLineOnCanvas(ctx, [[x,y], p[3]]); increase(p[3]); // m.set(p[3], (m.get(p[3]))+1);
          // drawLineOnCanvas(ctx, [[x,y], p[4]]); increase(p[4]); // m.set(p[4], (m.get(p[4]))+1);
          // drawLineOnCanvas(ctx, [[x,y], p[5]]); increase(p[5]); // m.set(p[4], (m.get(p[4]))+1);
        }));

        
      });

      m.forEach((v, k) => {
        let [x,y] = JSON.parse(k);
        console.log([x,y])
        paths.push(createPath(ctx => {
          let maxr = v;
          let nrOfCircles = v;
          let step = maxr / nrOfCircles;
          // for (let i = 1; i <= nrOfCircles; i++) {
          //   drawArcOnCanvas(ctx, x, y, i * step, 0, 360);
          // }
          drawArcOnCanvas(ctx, x, y, 2, 0, 360);
      }));
      });
      
    }

    postcards.drawQuad(draw, width, height);

    return renderPaths([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);