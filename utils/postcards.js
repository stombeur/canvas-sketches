const poly = require('./poly');

const reorigin = (point, origin) => {
    x = point.x || point[0];
    y = point.y || point[1];
    hor = origin.x || origin[0];
    vert = origin.y || origin[1];

    let t = [x+hor, y+vert];

    if (point.x){
      return poly.point(...t);
    }
    else return t;
  }

  const drawQuad = (f, width, height) => {
    f([0,0], width/2, height/2);
    f([0,height/2], width/2, height/2);
    f([width/2,0], width/2, height/2);
    f([width/2,height/2], width/2, height/2);
  }

  const drawOct = (f, width, height) => {
    f([0,0], width/4, height/2);
    f([width/4,0], width/4, height/2);
    f([width/2,0], width/4, height/2);
    f([width/4*3,0], width/4, height/2);

    f([0,height/2], width/4, height/2);
    f([width/4,height/2], width/4, height/2);
    f([width/2,height/2], width/4, height/2);
    f([width/4*3,height/2], width/4, height/2);

  }

module.exports.reorigin = reorigin;
module.exports.drawQuad = drawQuad;
module.exports.drawOct = drawOct;