
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('../utils/postcards');



const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    let addressPath = createPath(ctx => {
      postcards.drawQuadAddressLines(ctx, width, height);
    });

    return renderPaths([[addressPath]], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);