

  const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const { createArcPath, createLinePath } = require('../utils/paths');

import * as ln from "@lnjs/core";
import { BooleanShape } from "@lnjs/core";

const cube = (x, y, z) => {
    const a = new ln.Vector(x - 0.5, y-0.5, z-0.5);
    const b = new ln.Vector(x + 0.5, y + 0.5, z + 0.5);
    return new ln.Cube(a, b);
}

const lego = (x, y, z, u, v) => {
    const a = new ln.Vector(x - 2.5 * u, y - 2.5 * v , z);
    const b = new ln.Vector(x + 2.5*u, y +2.5*v, z + 6);
    const cu = new ln.Cube(a, b);
  
    const cyl = new ln.TransformedShape(new ln.Cylinder(1.5, z+6, z+7), ln.translate(new ln.Vector(0,0,6)));
    const cyl2 = new ln.TransformedShape(new ln.OutlineCylinder(new ln.Vector(1,1,1), new ln.Vector(0,0,1), 1.5, z+6, z+7), ln.translate(new ln.Vector(0,0,6)));
  
    return [cu, cyl, cyl2];
  }

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  // do random stuff here

  let up = new ln.Vector(0, 0, 1);

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];

    const draw = (origin, w, h, opts) => {
        const scene = new ln.Scene();
        let margin = 2;
        let ww = w - 2*margin;
        let hh = h - 2*margin;
        let oorigin = [origin[0]+margin, origin[1]+margin];

        let c1 = cube(1, 1, 1);
        let c2 = cube(0.4, 0.4, 1);

        let c3 = BooleanShape.create(ln.CSGOperation.Union, c1, c2);

        scene.add(c3);
        //scene.add(c2);

        

        let eye = new ln.Vector(0, 5, 5);
        let center = new ln.Vector(0, 0, 0);
        let lnpaths = scene.render(eye, center, up, ww, hh, 50, 0.1, 100, 0.1);
        //console.log(lnpaths)
        lnpaths.forEach(element => {
            let e = element[0];
            let e2 = element[element.length-1];
            let l = [postcards.reorigin([e.x, hh- e.y], oorigin),postcards.reorigin([e2.x, hh - e2.y], oorigin)];
            paths.push(createLinePath(l));

        });
    }

    


    postcards.drawSingle(draw, width, height);
   
    

    return renderGroups([ paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);