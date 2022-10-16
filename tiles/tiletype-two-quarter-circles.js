const { createArcPath, createLinePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');

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
  
    
    switch (corner) {
      case 1:
        c = oneCorner;
        oc = threeCorner;
  
        break;
      case 2:
        c = twoCorner;
        oc = zeroCorner;
  
        break;
      case 3:
        c = threeCorner;
        oc = oneCorner;
  
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

    // opposite point circles
    for (let s = 1; s < divide; s++) {
        let a = new arc(oc, s * step, sAngle, sAngle+90);
        let i = a.intersects([{r: radius, c: {x: c[0], y: c[1]}}])
        
        if (!i || i.length === 0) {
            result.push(createArcPath( oc, s * step, oAngle, oAngle+90));     
        }
        else {
        i.forEach(element => {
            result.push(createArcPath(oc, s* step, oAngle, element[1]))
            result.push(createArcPath(oc, s* step, element[0], oAngle-270))
            });
        }                                 
    }

    return result;
  };