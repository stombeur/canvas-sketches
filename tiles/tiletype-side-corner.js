const { createArcPath, createLinePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');

export const drawTile = (x, y, side, corner, divide, padding = 0) => {
    // corner
    // 0 1
    // 3 2

    let  [zeroCorner, oneCorner, twoCorner, threeCorner] = corners(x, y, side, padding);
    
  
    let c = twoCorner;
    let sAngle = startAngleOpposing(corner);
    
    switch (corner) {
      case 1:
        c = threeCorner;
        sAngle = startAngleOpposing(corner);
        break;
      case 2:
        c = zeroCorner;
        sAngle = startAngleOpposing(corner);
        break;
      case 3:
        c = oneCorner;
        sAngle = startAngleOpposing(corner);
        break;
      default:
        break;
    }
  
    let result = [];
  
    let radius = side;
    let step = radius / divide;
  
  
    // starting point circles
    for (let s = 1; s <= divide/2; s++) {
        result.push(createArcPath(c, s * step, sAngle, sAngle+90));                                       
    }

    return result;
  };