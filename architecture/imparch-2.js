
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
import {room} from './room';
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

const drawLineOnCanvas = (ctx, line) => {
  try {
  //if (!line || line.length === 0 || !line[0] || !line[1]) { return; }
  let x1 = line[0].x  || line[0][0],
      x2 = line[1].x || line[1][0],
      y1 = line[0].y || line[0][1],
      y2 = line[1].y || line[1][1];

  //console.log({line:[[x1,y1],[x2,y2]]})

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  } catch {
    console.error(line);
  }
};

const drawPlan = (paths, center, width) => {
  let rooms = [];
  let unit = width/12;
  let origin = room.from(center, unit);
  rooms.push(origin);

  for (let i = 0; i < 7; i++) {
    //debugger
    let r = random.pick(rooms);
    let s = random.pick(r.extrudableSides());
    let d = random.pick([unit/2, unit, unit*2]);
    let a = random.value() > 0.2 ? random.range(10, 30) : 0;
    try {
      let e = r.extrude(s, d, a);
      if (e) { rooms.push(e); } 
    }
    catch(e){
      console.log(r,s,d,a);
    }
  }  

  
  rooms.forEach(r => {
    if (!r) { return; }
    r.drawLines(l => {
      paths.push(createPath(ctx => {
        drawLineOnCanvas(ctx, l);
      }));
    });
  });
}

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {
    let paths = [];

    let margin = [6, 6];
    let columns = 6, rows = 8;

    let elementW = (width - margin[0]) / columns;
    let elementH = (height - margin[1]) / rows;

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          let center = [margin[0] + c*elementW + elementW/2, margin[1] + r*elementH + elementH/2];
          drawPlan(paths, center, elementW);
        }
    }

    return renderPaths([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);