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
  
    let c = zeroCorner;
    let lc = oneCorner;
    let linev = [[x,y], [x+side, y]];
    let lineh = [[x,y], [x+side, y]];
  
    
    switch (corner) {
      case 1:
        c = oneCorner;
        lc = twoCorner;
        linev = [[x,y],[x+side, y]];
        break;
      case 2:
        c = twoCorner;
        lc = threeCorner;
        linev = [[x+side, y],[x,y]];
        break;
      case 3:
        c = threeCorner;
        lc = zeroCorner;
        linev = [[x+side, y],[x,y]];
        break;
      default:
        break;
    }
  
    let result = [];
  
    let radius = side;
    let step = radius / divide;
    let centeroftile = [x + side/2, y + side/2];
  
  
    // starting point circles
    for (let s = 1; s <= divide; s++) {
    result.push(createArcPath(c, s * step, sAngle, sAngle+90));                                       
    }


    for (let s = 1; s <= divide; s++) {
        if (corner === 0 && s === 0) continue;
        if (corner === 1 && s !== 5) continue;
        if (corner === 2 && s === 0) continue;
        if (corner === 3 && s === 0) continue;


        let int = poly.findCircleLineIntersectionsP(side, lc, linev);   
        let newlinev = [linev[0], int[0]];

        if(corner === 0) {let p = int[1] ?? linev[1]; newlinev = [linev[0], p];}
        if(corner === 2) {let p = int[0] ?? linev[1]; newlinev = [linev[0], p];}

        if(corner === 3) {let p = int[0] ?? linev[1]; newlinev = [linev[0], p];}
        if(corner === 1) {let p = int[1] ?? linev[1]; newlinev = [linev[0], p];}
  

        let rlinev = poly.rotatePolygon(newlinev, centeroftile, -90);
        result.push(createLinePath(rlinev));

        linev = [[linev[0][0], linev[0][1] + step],[linev[1][0], linev[1][1] + step]];
    }

    return result;
  };