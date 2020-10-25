const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');
const { createArcPath, createLinePath } = require('../utils/paths');


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
    
    return renderGroups([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);