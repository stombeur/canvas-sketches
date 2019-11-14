// random-sized chevrons in line

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A4',
  orientation: 'landscape',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

const sketch = context => {
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    let rows = 8;
    let margin = 0.5;
    let ribbonHeight = ((height - (2 * margin)) / rows) - margin;

    let posY = margin;
    for (let r = 0; r < rows; r++) {
      let hatchAngle = utils.getRandom(89, 0);
      let hatchSpacing = utils.getRandom(0.2, 0.05);
      let posX = margin;
      let posYTop = posY;
      let posYBottom = posY + ribbonHeight;

      //let topLine = [[margin, height/2 - ribbonHeight/2],[width-margin, height/2 - ribbonHeight/2]];
      //let bottomLine = [[margin, height/2 + ribbonHeight/2],[width-margin, height/2 + ribbonHeight/2]];
      //poly.drawLineOnCanvas(context, topLine);
      //poly.drawLineOnCanvas(context, bottomLine);

      let randomSplit = utils.getRandom(
        ribbonHeight / 5 * 4,
        ribbonHeight / 5
      );
      // let centerLine = [[margin, height/2 - ribbonHeight/2 + randomSplit],[width-margin, height/2 - ribbonHeight/2 + randomSplit]];
      // poly.drawLineOnCanvas(context, centerLine);

      let repeat = utils.getRandomInt(8, 4);
      let chevronWidth = (width - 2 * margin) / repeat - margin;

      let inkeping = chevronWidth / 10;
      if (r%2 === 0) { inkeping = -inkeping;}

      for (let index = 0; index < repeat; index++) {
        /*
        1      2
          6      3
        5      4 
        */
        posX = margin + index * (chevronWidth + margin);
        let polyline = [];
        polyline.push([posX, posYTop]);
        polyline.push([posX + chevronWidth, posYTop]);
        polyline.push([posX + chevronWidth + inkeping, posYTop + randomSplit]);
        polyline.push([posX + chevronWidth, posYBottom]);
        polyline.push([posX, posYBottom]);
        polyline.push([posX + inkeping, posYTop + randomSplit]);
        poly.drawPolygonOnCanvas(context, polyline);

        let hatched = poly.hatchPolygon(polyline, hatchAngle, hatchSpacing);
        hatched.map(l => {
            poly.drawLineOnCanvas(context, l, {});
        });


        // let lines = [];
        // lines.push([[posX, posYTop], [posX + chevronWidth, posYTop]]);
        // lines.push([
        //   [posX + chevronWidth, posYTop],
        //   [posX + chevronWidth + inkeping, posYTop + randomSplit]
        // ]);
        // lines.push([
        //   [posX + chevronWidth + inkeping, posYTop + randomSplit],
        //   [posX + chevronWidth, posYBottom]
        // ]);
        // lines.push([[posX + chevronWidth, posYBottom], [posX, posYBottom]]);
        // lines.push([
        //   [posX, posYBottom],
        //   [posX + inkeping, posYTop + randomSplit]
        // ]);
        // lines.push([[posX + inkeping, posYTop + randomSplit], [posX, posYTop]]);
        // lines.map(l => poly.drawLineOnCanvas(context, l));
      }
      posY = posY + ribbonHeight + margin;
    }

    return [
      // Export PNG as first layer
      context.canvas,
      // Export SVG for pen plotter as second layer
      {
        data: svgFile.toSvg({
          width,
          height,
          units
        }),
        extension: '.svg'
      }
    ];
  };
};

canvasSketch(sketch, settings);
