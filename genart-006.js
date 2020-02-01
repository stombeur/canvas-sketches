const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');

// use either one depending on groups or not
const groups = [[],[],[]]; 
const paths = []; 

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  const countX = 50;
  const countY = Math.floor(countX / width * height);

  const createGrid = () => {
    const points = [];
    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
        points.push({
          position,
          group: random.pick(groups)
        });
      }
    }
    return points;
  };

  let points = createGrid().filter(() => {
    return Math.random() > 0.8;
  });
  points = random.shuffle(points);

  return ({ context, width, height, units }) => {

    const margin = width * 0.175;

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        position,
        group
      } = data;
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      const path = createPath(ctx => {
        ctx.arc(x, y, 1, Math.PI/4, Math.PI);
      });
      
      group.push(path);
      paths.push(path); 

    });

    // use either one depending on groups or not
    return renderGroups(groups, {
      context, width, height, units
    });
    // return renderPaths(paths, {     //uncomment to not use groups
    //   context, width, height, units
    // });
  };
};

canvasSketch(sketch, settings);