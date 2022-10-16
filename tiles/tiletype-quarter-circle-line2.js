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
    let lc = oneCorner;
    let line = [[x,y], [x+side, y]];
  
    
    switch (corner) {
      case 1:
        c = oneCorner;
        lc = twoCorner;
        line = [[x,y],[x+side, y]];
        break;
      case 2:
        c = twoCorner;
        lc = threeCorner;
        line = [[x+side, y],[x,y]];
        break;
      case 3:
        c = threeCorner;
        lc = zeroCorner;
        line = [[x+side, y],[x,y]];
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

    for (let s = 0; s <= divide; s++) {
        let int = poly.findCircleLineIntersectionsP(side, lc, line);   
        let newline = [line[0], int[0]];

        if(corner === 0) {let p = int[1] ?? line[1]; newline = [line[0], p];}
        if(corner === 2) {let p = int[0] ?? line[1]; newline = [line[0], p];}

        if(corner === 3) {let p = int[0] ?? line[1]; newline = [line[0], p];}
        if(corner === 1) {let p = int[1] ?? line[1]; newline = [line[0], p];}
  

        let rline = poly.rotatePolygon(newline, centeroftile, -90);
        result.push(createLinePath(rline));

        line = [[line[0][0], line[0][1] + step],[line[1][0], line[1][1] + step]];
    }

    return result;
  };