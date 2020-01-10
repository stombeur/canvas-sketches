const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
const poly = require('./utils/poly.js');
const {SvgFileWithGroups} = require('./utils/penplot');

let svgFile = new SvgFileWithGroups();

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);
// 469789

//let palette = random.pick(palettes);
let groups = ['1_group','2_group','3_group','4_group'];

// palette = random.shuffle(palette);
// palette = palette.slice(0, random.rangeFloor(2, palette.length + 1));

// const background = palette.shift();

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = () => {
  const countX = 50;
  const countY = Math.floor(countX / 21 * 29.7);

  const createGrid = () => {
    const points = [];
    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
        const radius = random.noise2D(u,v) * 0.035;
        points.push({
          //color: random.pick(palette), //'black',
          radius: Math.abs(radius),
          position,
          rotation: random.noise2D(u,v),
          group: random.pick(groups)
        });
      }
    }
    return points;
  };

  let points = createGrid().filter(() => {
    return Math.random() > 0.3;
  });

  points = random.shuffle(points);

  return ({ context, width, height, units }) => {
    poly.init(context);
    svgFile = new SvgFileWithGroups();

    const margin = width * 0.175;

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      const {
        position,
        radius,
        //color,
        rotation,
        group
      } = data;
      const x = lerp(margin, width - margin, position[0]);
      const y = lerp(margin, height - margin, position[1]);

      let options = {
        lineWidth: 0.1
      };

      const triangle = () => {
        let h = Math.abs(rotation*30),
            w = Math.abs(rotation*3);
        return {line1:[[x-w/2,y-h/2],[x,y+h/2]],
                line2:[[x,y+h/2],[x+w/2,y-h/2]],
                arc:[x,y-h/2,w/2,180,0]};
      }
      const rotate = (line) => {
        return poly.rotatePolygon(line, [x,y], radius*width*10);
      }
      const rotateArc = (arc) => {
        let rot = radius*width*10;
        let [x1,y1,r,s,e] = arc;
        let [rotx1,roty1] = poly.rotatePoint([x1,y1], [x,y], rot);
        return [rotx1,roty1,r,s+rot,e+rot];
      }

      let t = triangle();
      let l1 = rotate(t.line1);
      let l2 = rotate(t.line2);
      let a1 = rotateArc(t.arc);

      poly.drawLineOnCanvas(l1, options);
      poly.drawLineOnCanvas(l2, options);
      poly.drawArcOnCanvas(...a1, options);

      svgFile.addLineToGroup(l1, group);
      svgFile.addLineToGroup(l2, group);
      svgFile.addArcToGroup(...a1, group);

      

    });

    return [
      // Export PNG as first layer
      context.canvas,
      // Export SVG for pen plotter as second layer
      {
        data: svgFile.toSvg({
          width,
          height,
          units
        }),
        extension: '.svg',
      }
    ];
  };
};

canvasSketch(sketch, settings);