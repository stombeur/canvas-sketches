
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const { createArcPath, createLinePath } = require('../utils/paths');
import {room} from './room';

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true, 
  units: 'mm',
};

let paths = [];

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    let rooms = [];
    let origin = room.from([100,100], 30);
    rooms.push(origin);
    rooms.push(origin.extrude(1, 10));
    rooms.push(origin.extrude(2, 10));
    rooms.push(origin.extrude(3, 10));
    rooms.push(origin.extrude(4, 10, 30));
    
    //debugger;
    rooms.push(rooms[4].extrude(4, 30,-20));
    //rooms.push(rooms[5].extrude(3, 30,-20));
    //rooms.push(rooms[5].extrude(4, 30));
    
    
    rooms[5].addStairs(4, 2, 15);
    rooms[4].addColumnade(1, 3, 5, 1);

    
    rooms.forEach(r => {
      if (!r) { return; }
      r.drawLines(l => {
        paths.push(createLinePath(l));
      });
      r.drawCircles((center, radius) => {
        paths.push(createArcPath(center, radius, 0, 360));
      });
    });
    

    return renderPaths([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);