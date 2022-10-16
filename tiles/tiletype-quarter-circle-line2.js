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
    let sAngle = startAngleOpposing(corner);

  
    let c = zeroCorner;
  
    
    switch (corner) {
      case 1:
        c = oneCorner;
        break;
      case 2:
        c = twoCorner;
        break;
      case 3:
        c = threeCorner;
        break;
      default:
        break;
    }
  
    let result = [];
  
    let radius = side;
    let step = radius / divide;
  
  
    // starting point circles
    for (let s = 1; s <= divide; s++) {
    result.push(createArcPath(c, s * step, sAngle+180, sAngle+270));                                       
    }

    // do everything with one corner arc
    let l =  [[x,y],[x+side, y]];

    for (let s = 0; s <= divide ; s++) {
      l = [[x,y + step * s],[x+side, y + step* s]];
      let int = poly.findCircleLineIntersectionsP(side, twoCorner, l); 
      let il = [l[0], int[1] ?? l[1]];

      let angle = (corner -2 ) * 90
      let rl = poly.rotatePolygon(il, [x+side/2, y+side/2], angle)

      result.push(createLinePath(rl));
    }

    return result;
  };