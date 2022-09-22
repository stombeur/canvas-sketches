
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

    let cutLinesPath = createPath(ctx => {
      postcards.drawQuadCutLines(ctx, width, height);
    });


    return renderPaths([[cutLinesPath]], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);