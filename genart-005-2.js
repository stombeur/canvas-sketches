const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const poly = require('./utils/poly.js');

random.setSeed(random.getRandomSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  units: 'mm',
};

const paths = [];

const sketch = ({ width, height }) => {
  const countX = 100;
  const countY = Math.floor(countX / width * height);

  const createGrid = () => {
    const points = [];
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

  let points = createGrid().filter(() => {
    return Math.random() > 0.81;
  });

  return ({ context, width, height, units }) => {
    const margin = width * 0.15;

    points.forEach(data => {
      const {
        position,
        radius,
        rotation
      } = data;
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      const triangle = () => {
        let h = Math.abs(rotation*30),
            w1 = Math.abs(rotation*3),
            h2 = Math.abs(rotation*3);
        return {line1:[[x,y+h/2],[x-w1/2,y-h/2]],
                line2:[[x,y+h/2],[x+w1/2,y-h/2]],
                line3:[[x-w1/2,y-h/2],[x,y-h/2-h2]],
                line4:[[x,y-h/2-h2],[x+w1/2,y-h/2]]};
      }

      const rotate = (line) => { return poly.rotatePolygon(line, [x,y], radius*width*10); }

      const drawLineOnCanvas = (ctx, line) => {    
        ctx.moveTo(line[0][0], line[0][1]);
        ctx.lineTo(line[1][0], line[1][1]);
      }

      const t = triangle();

      paths.push(createPath(ctx => {
        drawLineOnCanvas(ctx, rotate(t.line1));
        drawLineOnCanvas(ctx, rotate(t.line2));
        drawLineOnCanvas(ctx, rotate(t.line3));
        drawLineOnCanvas(ctx, rotate(t.line4));
      }));
    });

    return renderPaths(paths, {
      context, width, height, units
    });
  }
};

canvasSketch(sketch, settings);