const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { createArcPath } = require('../utils/paths.js');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');



const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  units: 'mm',
};

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

const sketch = ({ width, height }) => {
  

  return ({ context, width, height, units }) => {
    const count = 40;
    paths = [];

    const drawLineOnCanvas = (ctx, line) => {    
      ctx.moveTo(line[0][0], line[0][1]);
      ctx.lineTo(line[1][0], line[1][1]);
    }

    const drawArcOnCanvas = (ctx, cx, cy, radius, sAngle, eAngle) => {    
      ctx.arc(cx, cy, radius, (Math.PI / 180) *  sAngle, (Math.PI / 180) *  eAngle);
    }

    const rotateArc = (arc, center, rot) => {
      let [[x1,y1],r,s,e] = arc;
      let [rotx1,roty1] = poly.rotatePoint([x1,y1], center, rot);
      return [[rotx1,roty1],r,s+rot,e+rot];
    }

    const triangle = (x,y, rotation) => {
      let h = Math.abs(rotation*10),
            w1 = Math.abs(rotation*1.3),
            w2 = Math.abs(rotation);

            return {line1:[[x-w1/2,y-h/2],[x-w2/2,y+h/2]],
              line2:[[x+w2/2,y+h/2],[x+w1/2,y-h/2]],
              arc1:[[x,y-h/2],w1/2,180,0],
              arc2:[[x,y+h/2],w2/2,0,180]};
    }

    const draw = (origin, w, h) => {
      const margin = w * 0.10;
      
      random.setSeed(random.getRandomSeed());

      let points = createGrid(count, w, h).filter(() => {
        return Math.random() > 0.81;
      });
  
      points.forEach(data => {
        const {
          position,
          radius,
          rotation
        } = data;

        const x0 = lerp(margin, w - margin, position[0]);
        const y0 = lerp(margin, h - margin, position[1]);
        const [x,y] = postcards.reorigin([x0,y0], origin);
  
        const t = triangle(x,y,rotation);
  
        paths.push(createPath(ctx => {
          drawLineOnCanvas(ctx, poly.rotatePolygon(t.line1, [x,y], radius*w*10));
          drawLineOnCanvas(ctx, poly.rotatePolygon(t.line2, [x,y], radius*w*10));
        }));

        paths.push(createArcPath(...rotateArc(t.arc1, [x,y], radius*w*10)));
        paths.push(createArcPath(...rotateArc(t.arc2, [x,y], radius*w*10)));

      });

    }

    
    postcards.drawFourColumnsTwoRowsPortrait(draw, width, height);
    

    return renderPaths(paths, {
      context, width, height, units
    });
  }
};

canvasSketch(sketch, settings);