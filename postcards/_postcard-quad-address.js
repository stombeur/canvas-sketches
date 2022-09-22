
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const { createLinePath } = require('../utils/paths');
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

    let originPath = createLinePath([[0,0], [0,1]])
    let endPath = createLinePath([[width,height], [width,height-1]])

    return renderPaths([[addressPath, endPath, originPath]], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);