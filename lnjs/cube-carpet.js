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

const createGrid = (countX, countY, countZ) => {
  const grid = [];
  for (let x = 0; x < countX; x++) {
    let col = [];
    for (let y = 0; y < countY; y++) {
      let row = []
      for (let z = 0; z < countZ; z++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const w = z / (countZ - 1);
        const position = [ u, v, w ];
        // const radius = random.noise2D(u,v) * 0.035;
        // const ix = Math.floor(Math.abs(random.noise2D(u,v))*paths.length);
        let noiseFactor = 0.4;
        row.push({
          position,
          noise1: random.noise3D(u, v, w) * noiseFactor,
          noise2: random.noise3D(w, u, v) * noiseFactor,
          noise3: random.noise3D(v, w, u) * noiseFactor,

        });
      }
      col.push(row);
    }
    grid.push(col)
  }
  return grid;
};

const sketch = ({ width, height }) => {
  // do random stuff here
  let randos = [];
  for (let i = 0; i < 4; i++) {
    randos.push(random.getRandomSeed());
  }

  let up = new ln.Vector(0, 0, 1);

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];
    let pathscolor = [];

    const draw = (origin, w, h, opts) => {
      random.setSeed(randos[opts.index-1])
      let size = 8;
      let countX = size, countY = size, countZ = size;
      let points = createGrid(countX, countY, countZ);

        const scene = new ln.Scene();
        let margin = 2;
        let ww = w - 2*margin;
        let hh = h - 2*margin;
        let oorigin = [origin[0]+margin, origin[1]+margin];

        //scene.add(cube(1, 1, 1));

        for (let u = 0; u < countX; u++) {
          for (let v = 0; v < countY; v++) {
            for (let w= 0; w < countZ; w++) {
              let noisex = points[u][v][w].noise1;
              let noisey = points[u][v][w].noise2;
              let noisez = points[u][v][w].noise3;
              let x = u - (countX/2);
              let y = v - (countY/2);
              let z = w - (countZ/2);
              let p = 0.3;
              let max = p*1.1;
              let fx = Math.max(max, p+noisex);
              let fy = Math.max(max, p+noisey);
              let fz = Math.max(max, p+noisez);
              if (noisex > 0) { noisex = Math.max(0.0005, noisex); }
              const shape = new ln.Cube(
                new ln.Vector(x - p - noisex, y - p - noisex, z - p - noisex),
                new ln.Vector(x + p + noisex, y + p +noisex, z + p+noisex)
              );
              scene.add(shape);
            }
          }
        }

        // for (let x = -countX; x <= countX; x++) {
        //   for (let y = -countY; y <= countY; y++) {
        //     //let height = points[countX][countY].height;
    
        //     const p = 0.4; //Math.random() * 0.25 + 0.2;
        //     const dx = Math.random() * 0.5 - 0.25;
        //     const dy = Math.random() * 0.5 + 0.25;
        //     const z =0.8;
        //     const fx = x;
        //     const fy = y;
        //     const fz = Math.random() * 5 + 3;
        //     if (x === 2 && y === 1) {
        //       continue
        //     }
            
        //   }
        // }

        let eye = new ln.Vector(6, 16, 10);
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

    


    postcards.drawQuad(draw, width, height);
   
    

    return renderGroups([pathscolor, paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);