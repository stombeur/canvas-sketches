const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const { createArcPath, createLinePath } = require('../utils/paths');
const random = require('canvas-sketch-util/random');

import * as ln from "@lnjs/core";

const cube = (x, y, z) => {
    const a = new ln.Vector(x - 0.5, y-0.5, z-0.5);
    const b = new ln.Vector(x + 0.5, y + 0.5, z + 0.5);
    return new ln.Cube(a, b);
}

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const createGrid = (countX, countY) => {
  const grid = [];
  for (let x = 0; x < countX; x++) {
    let col = [];
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      const position = [ u, v ];
      // const radius = random.noise2D(u,v) * 0.035;
      // const ix = Math.floor(Math.abs(random.noise2D(u,v))*paths.length);
      col.push({
        position,
        noise: random.noise2D(u,v)
      });
    }
    grid.push(col)
  }
  console.log(grid);
  return grid;
};

const sketch = ({ width, height }) => {
  // do random stuff here
  let countX = 40, countY = 30;
 

  let up = new ln.Vector(0, 0, 1);

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];
    let pathscolor = [];

    const draw = (origin, w, h, opts) => {
        //random.permuteNoise()
        let points = createGrid(countX, countY);
        const scene = new ln.Scene();
        let margin = 10;
        let ww = w - 2*margin;
        let hh = h - 2*margin;
        let oorigin = [origin[0]+margin, origin[1]+margin];

        //scene.add(cube(1, 1, 1));

        for (let u = 0; u < countX; u++) {
          for (let v = 0; v < countY; v++) {
            let defaultsize = Math.min(ww, hh) / countY /10;
            let noise_size = Math.abs(Math.min(defaultsize, points[u][v].noise * 1.7 * defaultsize));
            let height = points[u][v].noise * 1.3;
            let x = u - (countX/2);
            let y = v - (countY/2);
            let p = noise_size /2;
            let z = noise_size /2;
            const shape = new ln.Cube(
              new ln.Vector(x - p, y - p, height -z),
              new ln.Vector(x + p, y + p, height +z)
            );
            scene.add(shape);
          }
        }

        for (let x = -countX; x <= countX; x++) {
          for (let y = -countY; y <= countY; y++) {
            //let height = points[countX][countY].height;
    
            const p = 0.4; //Math.random() * 0.25 + 0.2;
            const dx = Math.random() * 0.5 - 0.25;
            const dy = Math.random() * 0.5 + 0.25;
            const z =0.8;
            const fx = x;
            const fy = y;
            const fz = Math.random() * 5 + 3;
            if (x === 2 && y === 1) {
              continue
            }
            
          }
        }

        let eye = new ln.Vector(40, 0, 50);
        let center = new ln.Vector(0, 0, 0);
        let lnpaths = scene.render(eye, center, up, ww, hh, 50, 0.1, 100, 0.1);
        //console.log(lnpaths)
        lnpaths.forEach(element => {
            let e = element[0];
            let e2 = element[element.length-1];
            let l = [postcards.reorigin([e.x, hh- e.y], oorigin),postcards.reorigin([e2.x, hh - e2.y], oorigin)];

            if (Math.random() > 0.9) {
                pathscolor.push(createLinePath(l));
            }
            else {paths.push(createLinePath(l));}
            // for (let i = 0; i < element.length; i++) {
            //     let i2 = (i+1) % element.length;
            //     let e = element[i];
            //     let e2 = element[i2];
                
            //     let l = [postcards.reorigin([e.x, h- e.y], origin),postcards.reorigin([e2.x, h - e2.y], origin)];

            //     paths.push(createLinePath(l));
            // }
        });
    }

    


    postcards.drawSingle(draw, width, height);
   
    

    return renderGroups([pathscolor, paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);