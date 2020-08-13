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

  const drawQuadCutLines = (ctx, width, height) => {
    let l1 = [[width/2,0],[width/2,height]];
    let l2 = [[0,height/2],[width, height/2]];
    ctx.moveTo(...l1[0]);
    ctx.lineTo(...l1[1]);
    ctx.moveTo(...l2[0]);
    ctx.lineTo(...l2[1]);
  }

  const drawQuadAddressLines = (ctx, width, height) => {
    // hor lijn dwars = 4/7
    // adreslijnen = 3/5 van deel 3/7

    let y1 = height/2 * 3/7;
    let y2 = height/2 + y1;
    let margin = width/30;

    ctx.moveTo(0+margin, y1);
    ctx.lineTo(width/2-margin, y1);
    ctx.moveTo(width/2+margin, y1);
    ctx.lineTo(width-margin, y1);

    ctx.moveTo(0+margin, y2);
    ctx.lineTo(width/2-margin, y2);
    ctx.moveTo(width/2+margin, y2);
    ctx.lineTo(width-margin, y2);

    let aX = width/2 * 3/5;
    let aXspace = (width/2-aX) / 4;

    const drawAddress = (x,y,xSpace, m, yOffset=0) => {
      ctx.moveTo(x, yOffset+m);
      ctx.lineTo(x, yOffset+y-m);
      ctx.moveTo(x+xSpace, yOffset+m);
      ctx.lineTo(x+xSpace, yOffset+y-m);
      ctx.moveTo(x+xSpace+xSpace, yOffset+m);
      ctx.lineTo(x+xSpace+xSpace, yOffset+y-m);
    }

    drawAddress(aX, y1, aXspace, margin);
    drawAddress(aX+width/2, y1, aXspace, margin);
    drawAddress(aX, y1, aXspace, margin, height/2);
    drawAddress(aX+width/2, y1, aXspace, margin, height/2);
    // drawAddress(aX+width/2, y2, aXspace, margin);

    aX = aX + width/2;

  }

module.exports.reorigin = reorigin;
module.exports.drawQuad = drawQuad;
module.exports.drawOct = drawOct;
module.exports.drawQuadCutLines = drawQuadCutLines;
module.exports.drawQuadAddressLines = drawQuadAddressLines;