// hatched donuts

const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');

const penplot = require('../utils/penplot');
const poly = require('../utils/poly');
const random = require('canvas-sketch-util/random');
const random2 = require('../utils/random');

const postcards = require('../utils/postcards');

random.setSeed(random.getRandomSeed());//359079

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = ({ width, height }) => {
  let paths = [];
   
  return ({ context, width, height, units }) => {
    paths = [];
    let marginRatio = 0.09;

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const drawArc = (center, radius, sAngle, eAngle) => {
      const path = createPath(ctx => {
        ctx.arc(center.x, center.y, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      });
      paths.push(path);
    }

    const draw = (origin, w, h) => {
      let center = postcards.reorigin(poly.point(w/2,h/2), origin);
      
      let m = w*marginRatio;
      let rmax = (w-m*2) / 2;

      let nrOfBands = 30;
      
      for (let j = 1; j < nrOfBands; j++) {
        let rout = rmax / nrOfBands * (j+1);
        let n = Math.abs(random.noise2D(rmax, j))  * 360;
        let o = random2.getRandomInclusive(1,0.7) * 24;

        drawArc(center, rout, n+o, n)
      }

    }

    postcards.drawQuad(draw, width, height);
    //drawOct(draw, width, height)

    return renderGroups([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);
