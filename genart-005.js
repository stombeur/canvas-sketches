const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
const poly = require('./utils/poly.js');

random.setSeed(7970);//random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);
// 469789
// 219376

const paths = [[],[],[]];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A3',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

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
        const radius = Math.abs(noise) * 0.035;
        const ix = Math.floor(Math.abs(noise)*paths.length);
        points.push({
          //color: random.pick(palette), //'black',
          radius: Math.abs(radius),
          position,
          rotation: noise,
          group: paths[ix]
        });
      }
    }
    return points;
  };

  let points = createGrid().filter(() => {
    return Math.random() > 0.7;
  });

  points = random.shuffle(points);

  return ({ context, width, height, units }) => {

    const margin = width * 0.15;

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

      const triangle = () => {
        let h = Math.abs(rotation*30),
            w1 = Math.abs(rotation*3),
            w2 = Math.abs(rotation);

        return {line1:[[x-w2/2,y+h/2],[x-w1/2,y-h/2]],
                line2:[[x+w2/2,y+h/2],[x+w1/2,y-h/2]],
                arc1:[x,y-h/2,w1/2,180,0],
                arc2:[x,y+h/2,w2/2,0,180]};
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
      const drawLineOnCanvas = (ctx, line) => {
        let x1 = line[0].x  || line[0][0],
            x2 = line[1].x || line[1][0],
            y1 = line[0].y || line[0][1],
            y2 = line[1].y || line[1][1];
      
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      const drawArcOnCanvas = (ctx, x, y, radius, startAngle, endAngle) => {
        let sAngle = (Math.PI / 180) * startAngle;
        let eAngle = (Math.PI / 180) * endAngle;

        ctx.arc(x, y, radius, sAngle, eAngle);
      }

      let t = triangle();
      let l1 = rotate(t.line1);
      let l2 = rotate(t.line2);
      let a1 = rotateArc(t.arc1);
      let a2 = rotateArc(t.arc2);

      const path = createPath(ctx => {
        drawLineOnCanvas(ctx, l1);
        drawArcOnCanvas(ctx, ...a1);
        drawLineOnCanvas(ctx, l2);
        drawArcOnCanvas(ctx, ...a2);
      });
      

      group.push(path);

    });

    // return [
    //   // Export PNG as first layer
    //   context.canvas,
    //   // Export SVG for pen plotter as second layer
    //   {
    //     data: pathsToSVG(paths, {
    //       width,
    //       height,
    //       units
    //     }),
    //     extension: '.svg',
    //   }
    // ];
    return renderGroups(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);