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

    // oppisite point circles
    for (let s = 0; s <= divide; s++) {
        let int = poly.findCircleLineIntersectionsP(side, c, line);   
        //result.push(createLinePath(line));
        
        if(corner === 0 || corner === 3) {let p = int[0] ?? line[1]; result.push(createLinePath([line[0], p]));}
        if(corner === 1 || corner === 2) {let p = int[1] ?? line[1]; result.push(createLinePath([line[0], p]));}

        line = [[line[0][0], line[0][1] + step],[line[1][0], line[1][1] + step]];
    }

    return result;
  };