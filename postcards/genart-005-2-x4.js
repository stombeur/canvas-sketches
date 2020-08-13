const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');

random.setSeed(random.getRandomSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  units: 'mm',
};

const paths = [];

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


    const drawLineOnCanvas = (ctx, line) => {    
      ctx.moveTo(line[0][0], line[0][1]);
      ctx.lineTo(line[1][0], line[1][1]);
    }

    const triangle = (x,y, rotation) => {
      let h = Math.abs(rotation*30),
          w1 = Math.abs(rotation*3),
          h2 = Math.abs(rotation*3);
      return {line1:[[x,y+h/2],[x-w1/2,y-h/2]],
              line2:[[x,y+h/2],[x+w1/2,y-h/2]],
              line3:[[x-w1/2,y-h/2],[x,y-h/2-h2]],
              line4:[[x,y-h/2-h2],[x+w1/2,y-h/2]]};
    }

    const draw = (origin, w, h) => {
      const margin = w * 0.20;

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
          drawLineOnCanvas(ctx, poly.rotatePolygon(t.line3, [x,y], radius*w*10));
          drawLineOnCanvas(ctx, poly.rotatePolygon(t.line4, [x,y], radius*w*10));
        }));
      });

    }

    
    postcards.drawQuad(draw, width, height);
    

    return renderPaths(paths, {
      context, width, height, units
    });
  }
};

canvasSketch(sketch, settings);