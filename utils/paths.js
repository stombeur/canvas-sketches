const { createPath } = require('canvas-sketch-util/penplot');

export const createArcPath = (center, radius, sAngle, eAngle) => {
    return createPath(ctx => {
      let c = {}
      if (center.x) { c.x = center.x; c.y = center.y; }
      else { c.x = center[0]; c.y = center[1]; }
      drawArcOnCanvas(ctx, c.x, c.y, radius, sAngle, eAngle);
    });
  };
  
  const drawArcOnCanvas = (ctx, cx, cy, radius, sAngle, eAngle) => {
    //ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      radius,
      (Math.PI / 180) * sAngle,
      (Math.PI / 180) * eAngle
    );
    //ctx.stroke();
  };
  
  export const createLinePath = (l) => {
    return createPath(ctx => {
      drawLineOnCanvas(ctx, l);
    });
  }
  
  const drawLineOnCanvas = (ctx, line) => {
    try {
    //if (!line || line.length === 0 || !line[0] || !line[1]) { return; }
    let x1 = line[0].x  || line[0][0],
        x2 = line[1].x || line[1][0],
        y1 = line[0].y || line[0][1],
        y2 = line[1].y || line[1][1];
  
    //console.log({line:[[x1,y1],[x2,y2]]})
  
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    } catch {
      console.error(line);
    }
  };