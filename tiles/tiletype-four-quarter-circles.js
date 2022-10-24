const { createArcPath, createLinePath, createCirclePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing, startAngles } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');
const poly = require('../utils/poly.js');

export const drawTile = (x, y, side, rnd, divide, padding = 0) => {
    // corner
    // 0 1
    // 3 2

    let corner = rnd.corner;
    let cornerss = corners(x, y, side, padding);
    let  [zeroCorner, oneCorner, twoCorner, threeCorner] = corners(x, y, side, padding);
    let sAngle = startAngle(corner);
    let oAngle = startAngleOpposing(corner);
    let sAngles = startAngles();
    console.log(sAngles)
  
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

    cornerss.forEach((cor, index) => {
      for (let s = 1; s <= divide/2; s++) {
        let sa = sAngles[index];
        result.push(createArcPath(cor, s * step, sa, sa+90));                                       
      }
    });
    let rint = step * (divide/2);
    for (let s = divide/2 + 1; s < divide-2; s++) {
      let a = new arc(zeroCorner, s * step, 0, 90);
      let i = a.intersects([{r: rint, c: oneCorner}])
      result.push(createArcPath(zeroCorner, s * step, i[0][0], i[0][1] +90));

      a = new arc(twoCorner, s * step, 0, 90);
      i = a.intersects([{r: rint, c: threeCorner}])
      result.push(createArcPath(twoCorner, s * step, i[0][0], i[0][1]-270));                                     
    }
    return result;
  };