const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath } = require('../utils/paths.js');
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
      ctx.arc(cx, cy, radius, sAngle, eAngle);
    }

    const rotateArc = (arc, center, rot) => {
      let [x1,y1,r,s,e] = arc;
      let [rotx1,roty1] = poly.rotatePoint([x1,y1], center, rot);
      return [rotx1,roty1,r,s+rot,e+rot];
    }

    const triangle = (x,y, rotation) => {
      let h = Math.abs(rotation*30),
            w1 = Math.abs(rotation*3),
            w2 = Math.abs(rotation);

            return {line1:[[x-w1/2,y-h/2],[x-w2/2,y+h/2]],
              line2:[[x+w2/2,y+h/2],[x+w1/2,y-h/2]],
              arc1:[x,y-h/2,w1/2,180,0],
              arc2:[x,y+h/2,w2/2,0,180]};
    }

    const draw = (origin, w, h) => {
      const margin = w * 0.20;
      
      random.setSeed(random.getRandomSeed());

      let points = createGrid(count, w, h).filter(() => {
        return Math.random() > 0;
      });

      let center = postcards.reorigin([w/2, h/2], origin);

      const weewee = (size, center, paths, rotation = 0) => {
        let t1 = [[center[0]-size*2, center[1]-size*2], size, 0, 360];
        let t2 = [[center[0]+size*2, center[1]-size*2], size, 0, 360];
        let e = [[center[0], center[1]+size*2], size, 0, 180];
        let l1 = [[center[0]-size, center[1]-size*2],[center[0]-size, center[1]+size*2]];
        let l2 = [[center[0]+size, center[1]-size*2],[center[0]+size, center[1]+size*2]];

        if (rotation !== 0) {
          let c11 = poly.rotatePoint(t1[0], center, rotation);
          t1[0] = c11;
          let c22 = poly.rotatePoint(t2[0], center, rotation);
          t2[0] = c22;
          let ee = poly.rotatePoint(e[0], center, rotation);
          e = [ee, e[1], e[2] + rotation, e[3] + rotation];
          l1 = poly.rotatePolygon(l1, center, rotation);
          l2 = poly.rotatePolygon(l2, center, rotation);
        }
  
        paths.push(createArcPath(...t1));
        paths.push(createArcPath(...t2));
        paths.push(createArcPath(...e));
        paths.push(createLinePath(l1));
        paths.push(createLinePath(l2));
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
  
        let a = [0, 45, 90, 135, 180, 225, 270, 315];//[0, 90, 180, 270];
        let r = random.pick(a);
        let f = Math.ceil(rotation * a.length);
        r = a[f];
        let www = (w - (margin*2)) / count / 7;
        console.log(www)
        weewee(www, [x,y], paths, r);
        //weewee(Math.abs(rotation)*2.5, [x,y], paths, Math.abs(rotation)*60);
  
      });

    }

    
    postcards.drawQuad(draw, width, height);
    

    return renderPaths(paths, {
      context, width, height, units
    });
  }
};

canvasSketch(sketch, settings);