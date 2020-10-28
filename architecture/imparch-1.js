
const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const { createArcPath, createLinePath } = require('../utils/paths');
import { boundingbox } from '../utils/boundingbox';
import { polyline } from '../utils/polyline';
import {room} from './room';
const polybool = require('polybooljs');
import {hatch} from '../utils/hatch'

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

    // let l2 = new polyline([[width/2.4, 0],[width, 0],[width, height],[width/2,height]]);
    // let l3 = new polyline([[width/2.4, 0],[0, 0],[0, height],[width/2,height]]);
    // let l4 = new polyline([[0, height/3],[0, height],[width, height],[width,height/2]]);
    // let l5 = new polyline([[0, height/3],[0, 0],[width, 0],[width,height/2]]);

    let lines = [];

    let roomRegion = room.toClipRegion(rooms);
    let bb = boundingbox.from([[0, 0],[width, 0],[width, height],[0,height]]);
    let region2 = roomRegion.splitVertically([[width/2.4, 0],[width/2, height]], bb, [5, -2]);
    let region3 = region2.splitHorizontally([[0, height/2],[width, height/3]], bb, [2, 5]);
    let region4 = region3.splitVertically([[width/4, 0],[width, height]], bb, [5, -2]);

    region4.toLines().forEach(l => {
      lines.push(l);
    })

    let h = hatch.inside(room.linkroomlines(rooms).points, 10, 2);
    lines.push(...h);

    // let poly1 = l2.toClipRegion();
    // let poly3 = l3.toClipRegion();
    // let poly4 = l4.toClipRegion();
    // let poly5 = l5.toClipRegion();

    // let int = polybool.difference(poly2, poly1);
    // let lines = [];

    // for (let r = 0; r < int.regions.length; r++) {
    //     // new polyline(int.regions[r]).tolines().forEach(l => {
    //     //     lines.push(l);
    //     // })
    //     new polyline(int.regions[r]).move([-5, 0]).tolines().forEach(l => {
    //           lines.push(l);
    //       })
    // }
    // let int2 = polybool.difference(poly2, poly3);

    // // for (let r = 0; r < int2.regions.length; r++) {
    // //     // new polyline(int.regions[r]).tolines().forEach(l => {
    // //     //     lines.push(l);
    // //     // })
    // //     new polyline(int2.regions[r]).move([5, 0]).tolines().forEach(l => {
    // //           lines.push(l);
    // //       })
    // // }

    // let int3 = polybool.difference(int2, poly4);
    // for (let r = 0; r < int3.regions.length; r++) {
    //   // new polyline(int.regions[r]).tolines().forEach(l => {
    //   //     lines.push(l);
    //   // })
    //   new polyline(int3.regions[r]).move([0, -5]).tolines().forEach(l => {
    //         lines.push(l);
    //     })
    // }
    // let int4 = polybool.difference(int2, poly5);
    // for (let r = 0; r < int4.regions.length; r++) {
    //   // new polyline(int.regions[r]).tolines().forEach(l => {
    //   //     lines.push(l);
    //   // })
    //   new polyline(int4.regions[r]).move([0, 5]).tolines().forEach(l => {
    //         lines.push(l);
    //     })
    // }



    lines.forEach(l => {
      paths.push(createLinePath(l));
    })
    rooms.forEach(r => {
      if (!r) { return; }
      r.drawPlan(l => {
        //paths.push(createLinePath(l));
      });
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