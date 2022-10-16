const { createArcPath, createLinePath } = require('../utils/paths.js');
const { corners, startAngle, startAngleOpposing } = require('./tiletype-common.js');
const { arc } = require('../utils/arc.js');
const poly = require('../utils/poly.js');

export const drawTile = (x, y, side, rnd, divide, padding = 0) => {
    // corner
    // 0 1
    // 3 2

    let corner = rnd.corner;

    let line = [[x+side, y],[x,y]];
  
    let result = [];
  
    let radius = side;
    let step = radius / divide;
    line = [[x,y],[x,y+side]];
  
    for (let s = 0; s <= divide; s++) {
        if (corner === 0 || corner === 2){
          line = [[x+(step*s),y],[x+(step*s), y+side]];
        }
        if (corner === 1 || corner ===3){
          line = [[x,y+(step*s)],[x+side, y+(step*s)]];
        }
        result.push(createLinePath(line));
    
    }

    return result;
  };