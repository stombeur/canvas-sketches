const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);

let palette = random.pick(palettes);

palette = random.shuffle(palette);
palette = palette.slice(0, random.rangeFloor(2, palette.length + 1));

const background = palette.shift();

const settings = {
  suffix: random.getSeed(),
  dimensions: [ 2048, 2048 ]
};

const sketch = () => {
  const count = 30;

  const createGrid = () => {
    const points = [];
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);
        const position = [ u, v ];
        const radius = random.noise2D(u,v) * 0.035;
        points.push({
          color: random.pick(palette), //'black',
          radius: Math.abs(radius),
          position,
          rotation: random.noise2D(u,v)
        });
      }
    }
    return points;
  };

  let points = createGrid().filter(() => {
    return Math.random() > 0.75;
  });

  points = random.shuffle(points);

  return ({ context, width, height }) => {
    const margin = width * 0.175;

    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        position,
        radius,
        color,
        rotation
      } = data;
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      context.beginPath();
      context.arc(x, y, radius*width, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();

    // context.save();
    // context.fillStyle = color;
    // context.font = `${radius * width}px Helvetica`;
    // context.translate(x,y);
    // context.rotate(rotation);
    // context.fillText('=', 0,0);
    // context.restore();

    });
  };
};

canvasSketch(sketch, settings);