
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
import {room} from './room';

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

let paths = [];

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

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    let rooms = [];
    let origin = room.from([100,100], 30);
    rooms.push(origin);
    rooms.push(origin.extrude(1, 10));
    rooms.push(origin.extrude(2, 10));
    rooms.push(origin.extrude(3, 10, 30));
    rooms.push(origin.extrude(4, 10));
    
    //debugger;
    rooms.push(rooms[3].extrude(3, 30, 24));
    //rooms.push(rooms[1].extrude(1, 30));
    

    
    rooms.forEach(r => {
      if (!r) { return; }
      r.drawLines(l => {
        paths.push(createPath(ctx => {
          drawLineOnCanvas(ctx, l);
        }));
      });
    });
    

    return renderPaths([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);