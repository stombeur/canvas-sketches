import poly from './poly';
import { polyline } from './polyline';

const { createPath } = require('canvas-sketch-util/penplot');

export const asPoint = (input) => {
  if (input.x) { return { x: input.x, y: input.y } }
  else return { x: input[0], y: input[1] }
}

export const createArcPath = (center, radius, sAngle, eAngle) => {
    return createPath(ctx => {
      let c = {}
      if (center.x) { c.x = center.x; c.y = center.y; }
      else { c.x = center[0]; c.y = center[1]; }
      drawArcOnCanvas(ctx, c.x, c.y, radius, sAngle, eAngle);
    });
  };

  export const createCirclePath = (center, radius) => {
    return createPath(ctx => {
      let c = {}
      if (center.x) { c.x = center.x; c.y = center.y; }
      else { c.x = center[0]; c.y = center[1]; }
      drawArcOnCanvas(ctx, c.x, c.y, radius, 0, 360);
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

  const drawCubicBezierOnCanvas = (ctx, control1x, control1y, control2x, control2y, endX, endY) => {
    ctx.bezierCurveTo(control1x, control1y, control2x, control2y, endX, endY);
  }

  export const createCubicBezierPath = (start, end, control1, control2) => {
    let [s, e, cp1, cp2] = [asPoint(start), asPoint(end), asPoint(control1), asPoint(control2)];
    return createPath(ctx => {
      ctx.moveTo(s.x, s.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, e.x, e.y);
    });
  }


  export const findTangentialControlPoint = (control, end, factor) => {
    let d = poly.distanceBetween(control, end);
    let controlMirror = poly.rotatePoint(control, end, 180);
    let control2 = poly.findCircleLineIntersections2(Math.abs(d*factor), end, [control, controlMirror]);

    if (factor > 0) {
      if (poly.distanceBetween(control, control2[0]) > d) return control2[0];
      else return control2[1];
    }

    if (factor < 0) {
      if (poly.distanceBetween(control, control2[0]) < d) return control2[0];
      else return control2[1];
    }
  }

  const drawQuadraticBezierOnCanvas = (ctx, control1x, control1y, endX, endY) => {
    ctx.quadraticCurveTo(control1x, control1y, endX, endY);
  }

  export const createQuadraticBezierPath = (start, end, control) => {
    let [s, e, cp] = [asPoint(start), asPoint(end), asPoint(control)];
    return createPath(ctx => {
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(cp.x, cp.y, e.x, e.y);
    });
  }
  
  export const createLinePath = (l) => {
    return createPath(ctx => {
      drawLineOnCanvas(ctx, l);
    });
  }
  
  export const createPolylinePath = (pl) => {
    return createPath(ctx => {
      if (!(pl instanceof polyline)) {
        pl = new polyline(pl)
      }
      pl.toLines().forEach(l => {
        drawLineOnCanvas(ctx, l);
      });
    });
  }

  export const drawLineOnCanvas = (ctx, line) => {
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