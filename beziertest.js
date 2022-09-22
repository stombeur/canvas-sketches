const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('./utils/postcards');
const { createArcPath, createLinePath, createCubicBezierPath, createQuadraticBezierPath, findTangentialControlPoint, createCirclePath } = require('./utils/paths');
const { point } = require('./utils/point');


const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  // do random stuff here

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];

    let s = new point(width/4, height/2);
    let e = new point(width*3/4, height/2);
    let c1 = new point(width/5, height/2.5);
    let c2 = new point(width*4/5, height/4);

    paths.push(createCubicBezierPath(s,e, c1, c2));

    //paths.push(createQuadraticBezierPath(s, e, c1))

    let p = findTangentialControlPoint(c2, e, 0.4);
    console.log(p)
    paths.push(createLinePath([c2, p]))

    let e2 = new point(width, height)
    let c3 = new point(width/2, height)

    paths.push(createCubicBezierPath(e, e2, p, c3))
    
    return renderGroups([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);