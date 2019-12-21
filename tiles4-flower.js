// tiles with flower

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const utils = require('./utils/random');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();

let lines = [];
let arcs = [];

const settings = {
  dimensions: [24,31.5],
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

const sketch = context => {
  let margin = 0;
  let elementWidth = 2;
  let elementHeight = 2;
  let columns = 1;
  let rows = 1;

  let drawingWidth = columns * (elementWidth + margin) - margin;
  let drawingHeight = rows * (elementHeight + margin) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;

  let o = [];
  for (let r = 0; r < rows; r++) {
    o[r] = [];
    for (let i = 0; i < columns; i++) {
      let corner = utils.getRandomInt(4, 0);
      //console.log(corner);
      o[r].push({
        corner,
        draw01: true,
        draw12: true,
        draw23: true,
        draw30: true
      });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      switch (o[r][c].corner) {
        // 0 1
        // 3 2
        case 0:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        case 1:
          if (r > 0 && (o[r - 1][c].corner === 2 || o[r - 1][c].corner === 3)) {
            o[r][c].draw01 = false;
          }
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          break;
        case 2:
          if (
            c < columns - 1 &&
            (o[r][c + 1].corner === 0 || o[r][c + 1].corner === 3)
          ) {
            o[r][c].draw12 = false;
          }
          if (
            r < rows - 1 &&
            (o[r + 1][c].corner === 1 || o[r + 1][c].corner === 0)
          ) {
            o[r][c].draw23 = false;
          }
          break;
        case 3:
          if (r < rows - 1 && (o[r + 1][c].corner === 0 || o[r + 1][c].corner === 1)) {
            o[r][c].draw23 = false;
          }
          if (c > 0 && (o[r][c - 1].corner === 1 || o[r][c - 1].corner === 2)) {
            o[r][c].draw30 = false;
          }
          break;
        default:
          break;
      }
    }
  }

  //console.dir(o);

  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    const drawCircle = (cx, cy, radius) => {
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();

    };

    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(
        cx,
        cy,
        radius,
        (Math.PI / 180) * sAngle,
        (Math.PI / 180) * eAngle
      );
      context.stroke();

      //svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    };

    const drawTile = (x, y, side, rnd, padding = 0) => {

      // draw square tile
      let s = poly.createSquarePolygon(x, y, side);
      poly.drawPolygonOnCanvas(context, s);

      // draw inner quarter circle
      let center1 = poly.point(x+padding, y+padding);
      drawArc(center1.x, center1.y, side/2 - padding, 0, 90);

      //draw 2 quarter circles as edge
      let center2 = poly.point(x+ side/2, y + padding);
      drawArc(center2.x, center2.y, side/2 - padding, 0, 90);
      let center3 = poly.point(x+ padding, y + side/2);
      drawArc(center3.x, center3.y, side/2 - padding, 0, 90);
      

    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    let posX = marginLeft;
    let posY = marginTop;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        drawTile(posX, posY, elementWidth, o[r][c], margin);
        posX = posX + elementWidth + margin;
      }

      posX = marginLeft;
      posY = posY + elementHeight + margin;
    }
    lines.forEach(l => {
      svgFile.addLine(l);
    });
    arcs.forEach(a => {
      svgFile.addArc(a.cx, a.cy, a.radius, a.startAngle, a.endAngle);
    });
    svgFile.newPath();

    // let box = [[marginLeft,marginTop],[marginLeft, height-marginTop+elementWidth/2],[width-marginLeft+elementWidth/2,height-marginTop+elementWidth/2],[width-marginLeft+elementWidth/2,marginTop]];
    // poly.drawPolygonOnCanvas(context, box);
    // svgFile.addLine(box, true);

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
