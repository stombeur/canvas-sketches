const { createArcPath, createLinePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');

export const drawTile = (x, y, side, corner, divide, padding, cutends = false, specialcorner = false) => {
  //console.log('specialcorner - cutends', specialcorner, cutends)
    // corner
    // 0 1
    // 3 2

    // side
    //  0
    // 3 1
    //  2

   
    
    divide = divide / 2;

    let radius = side / 2;
    let step = radius / divide;


    let center = [x + side / 2 + step/2, y]; //side = 0
    let sAngle = 0;
    
    switch (corner) {
      case 1:
        center = [x + side, y + side / 2 + step/2];
        sAngle = 90;
        break;
      case 2:
        center = [x + side / 2 + step/2, y + side];
        sAngle = 180;
        break;
      case 3:
        center = [x, y + side / 2 + step/2];
        sAngle = 270;
        break;
      default:
        break;
    }
  
    let result = [];
  
    
    divide = Math.floor(divide);
  
    // starting point circles
    for (let s = 0; s <= divide; s++) {
        if (specialcorner && s === divide) {
          result.push(createArcPath(center, (s * step) +step, sAngle+18, sAngle+162));
        }
        else if (cutends && s === divide) {
          result.push(createArcPath(center, (s * step) +step, sAngle+35, sAngle+145));
        }
        else {
          result.push(createArcPath(center, (s * step) +step, sAngle, sAngle+180));
        }                                       
    }

    return result;
  };