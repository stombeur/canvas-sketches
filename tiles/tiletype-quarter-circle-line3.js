const { createArcPath, createLinePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');
const poly = require('../utils/poly.js');

export const drawTile = (x, y, side, rnd, divide, padding = 0) => {
    // corner
    // 0 1
    // 3 2

    let corner = rnd.corner;
    let  [zeroCorner, oneCorner, twoCorner, threeCorner] = corners(x, y, side, padding);
    let sAngle = startAngle(corner);
    let oAngle = startAngleOpposing(corner);
  
    let c = zeroCorner;
    let oc = twoCorner;
    let line = [[x+side, y],[x,y]];
  
    
    switch (corner) {
      case 1:
        c = oneCorner;
        oc = threeCorner;
        line = [[x,y],[x+side, y]];
        break;
      case 2:
        c = twoCorner;
        oc = zeroCorner;
        line = [[x,y],[x+side, y]];
        break;
      case 3:
        c = threeCorner;
        oc = oneCorner;
        line = [[x+side, y],[x,y]];
        break;
      default:
        break;
    }
  
    let result = [];
  
    let radius = side;
    let step = radius / divide;
  
  
    // starting point circles
    for (let s = 1; s <= divide; s++) {
    result.push(createArcPath(c, s * step, sAngle, sAngle+90));                                       
    }

    let l =  [[x,y],[x+side, y]];
    let inham = step*2;
    let l2 = [[x,y],[x+inham, y]];

    for (let s = 0; s <= divide ; s++) {
      l = [[x,y + step * s],[x+side, y + step* s]];
      l2 = [[x, y+ step * s],[x+inham, y + step * s] ];
      let int = poly.findCircleLineIntersectionsP(side, oneCorner, l); 
      let il = [l[0], int[1] ?? l[1]];

      let int2 = poly.findCircleLineIntersectionsP(side, twoCorner, l2); 
      let il2 = [l2[0], int2[1] ?? l2[1]];
      let lenil2 = Math.abs(il2[0][0] - il2[1].x);
      if (lenil2 > inham) {
        il2 = [l2[0], l2[1]];
      }

      let angle = (corner - 1 ) * 90
      let rl = poly.rotatePolygon(il, [x+side/2, y+side/2], angle)
      let rl2 = poly.rotatePolygon(il2, [x+side/2, y+side/2], (corner +2) * 90)

      if (s !== divide && s!== divide-1) {
        result.push(createLinePath(rl));
      }
      result.push(createLinePath(rl2));
    }

    return result;
  };