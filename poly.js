const polygonBoolean = require('2d-polygon-boolean');

const createPolygon = (nrOfSides, sideLength, centerPoint) => {
    let centerAngle = Math.PI * 2 / nrOfSides;
    let b = Math.sin(centerAngle/2) * sideLength / 2 / Math.cos(centerAngle/2);
    let x1 = centerPoint[0] - sideLength / 2;
    let y1 = centerPoint[1] + b;

    let poly = [];
    poly.push([x1, y1]);
    for (let i = 1; i < nrOfSides; i++) {
        poly.push(rotate([x1, y1], centerPoint, 360 / nrOfSides * i))
    }

    return poly;
}

const createSquarePolygon = (originX, originY, width, height) => {
    let result = [];
    result.push([originX, originY]);
    result.push([originX + width, originY]);
    result.push([originX + width, originY + height]);
    result.push([originX, originY + height]);

    return result;
}

const drawPolygonOnCanvas = (context, poly, options = {}) => {
    context.beginPath();
  
    context.strokeStyle = options.strokeStyle || 'black';
    context.lineWidth = options.lineWidth || 0.01;
    context.lineCap = options.lineCap || 'square';
    context.lineJoin = options.lineJoin || 'miter';
  
    context.moveTo(poly[0][0], poly[0][1]);
  
    poly.map(function(point) {
      context.lineTo(point[0], point[1]);
    });
  
    context.lineTo(poly[0][0], poly[0][1]);
  
    context.stroke();
}

const drawLineOnCanvas = (context, poly, options = {}) => {
    context.beginPath();
  
    context.strokeStyle = options.strokeStyle || 'black';
    context.lineWidth = options.lineWidth || 0.01;
    context.lineCap = options.lineCap || 'square';
    context.lineJoin = options.lineJoin || 'miter';
  
    context.moveTo(poly[0][0], poly[0][1]);
  
    context.lineTo(poly[1][0], poly[1][1]);
  
    context.stroke();
}

const calculateBoundingBox = (polyLine, padding = 0) => {
    let left = Number.MAX_VALUE,
      top = Number.MAX_VALUE,
      right = 0,
      bottom = 0;
  
    polyLine.map(p => {
      left = Math.min(p[0], left);
      top = Math.min(p[1], top);
      right = Math.max(p[0], right);
      bottom = Math.max(p[1], bottom);
    });
  
    return [
      [left - padding, top - padding],
      [right + padding, top - padding],
      [right + padding, bottom + padding],
      [left - padding, bottom + padding]
    ];
};

const rotatePointXY = (p, c, angle) => {
    if (angle === 0) return point;

    let radians = (Math.PI / 180) * angle,
        x = p.x,
        y = p.y,
        cx = c.x,
        cy = c.y,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = cos * (x - cx) - sin * (y - cy) + cx,
        ny = cos * (y - cy) + sin * (x - cx) + cy;
    return point(nx, ny);
};

const rotatePoint = (point, center, angle) => {
  if (angle === 0) return point;

  let radians = (Math.PI / 180) * angle,
      x = point[0],
      y = point[1],
      cx = center[0],
      cy = center[1],
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) - sin * (y - cy) + cx,
      ny = cos * (y - cy) + sin * (x - cx) + cy;
  return [nx, ny];
};
  
const rotatePolygon = (polyLine, center, angle) => {
    return polyLine.map(p => {
        return rotatePoint(p, center, angle);
    });
};

const hatchPolygon = (poly, angle, spacing = 0.1) => {
    let rectangle = calculateBoundingBox(poly);

    let x = rectangle[0][0];
    let y = rectangle[0][1];
    let height = rectangle[2][1] - y;
    let width = rectangle[2][0] - x;

    let rotatedRectangle = rotatePolygon(
      rectangle,
      [x + width / 2, y + height / 2],
      angle
    );
    

    let box = calculateBoundingBox(rotatedRectangle, Math.max(height, width));
    
    let x2 = box[0][0];
    let y2 = box[0][1];
    let height2 = box[2][1] - y2;
    let width2 = box[2][0] - x2;
  
    let numLines = Math.floor(height2 / spacing);
    let hatchlines = [];
  
    for (let i = 0; i <= numLines; i++) {
      let line = [[x2 - width2, y2 + i * spacing], [x2 + width2 * 2, y2 + i * spacing]];
      let rotatedLine = rotatePolygon(line, [x + width / 2, y + width / 2], angle);
      hatchlines.push(rotatedLine);
    }

    let result = [];
    for (let i = 0; i < hatchlines.length; i++) {
        let x = null;
        try {
          x = clip(hatchlines[i], poly);
        } catch {}
        if (x) {
            x.map(l => {
                result.push([l[0], l[1]]);
                });
          
        }
      }
    
    return result;
};
  
const clip = (lineToClip, lineThatClips) => {
    let closedLine = [lineToClip[0], lineToClip[1], lineToClip[1], lineToClip[0]];
    return polygonBoolean(lineThatClips, closedLine, 'and');
};
  
const drawHatchedPolygonOnCanvas = (context, posX, posY, angle, space, sideLength = 2, options = {}) => {
    let rect = createPolygon(6, sideLength, [posX, posY]);
    let hatched = hatchPolygon(rect, angle, space);
    hatched.map(l => {
        drawLineOnCanvas(context, l, options);
    });
    // for (let i = 0; i < hatched.length; i++) {
    //   let x = null;
    //   try {
    //     x = clip(hatched[i], rect);
    //   } catch {}
    //   if (x) {
    //     x.map(l => {
    //       drawLineOnCanvas(context, [l[0], l[1]], options);
    //     });
    //   }
    // }
};

const point = (x, y) => {
  return {x, y};
}

const toLine = (point1, point2) => {
  return [[point1.x, point1.y],[point2.x, point2.y]];
}

const movePoint = (p, vector) => {
  return point(p.x + vector.x, p.y + vector.y);
} 

const findIntersection = (P1, P2, P3, P4) => {
  if (!P1.x) { P1 = point(P1[0], P1[1]); }
  if (!P2.x) { P2 = point(P2[0], P2[1]); }
  if (!P3.x) { P3 = point(P3[0], P3[1]); }
  if (!P4.x) { P4 = point(P4[0], P4[1]); }

  var x =
    ((P1.x * P2.y - P2.x * P1.y) * (P3.x - P4.x) -
      (P1.x - P2.x) * (P3.x * P4.y - P3.y * P4.x)) /
    ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));
  var y =
    ((P1.x * P2.y - P2.x * P1.y) * (P3.y - P4.y) -
      (P1.y - P2.y) * (P3.x * P4.y - P3.y * P4.x)) /
    ((P1.x - P2.x) * (P3.y - P4.y) - (P1.y - P2.y) * (P3.x - P4.x));
  return { x, y };
}

function isPointBetween(p, a, b) {
  if (!a.x) { a = point(a[0], a[1]); }
  if (!b.x) { b = point(b[0], b[1]); }
  if (!p.x) { p = point(p[0], p[1]); }

  return ((a.x <= p.x && p.x <= b.x) || (a.x >= p.x && p.x >= b.x)) && ((a.y <= p.y && p.y <= b.y) || (a.y >= p.y && p.y >= b.y));
}

function findSegmentIntersection(P1, P2, P3, P4) {
  var i1 = findIntersection(P1, P2, P3, P4);
  const isIntersected = isPointBetween(i1, P1, P2) && isPointBetween(i1, P3, P4);
  return isIntersected ? i1 : false;
}

function isSegmentIntersected(P1, P2, P3, P4) {
  var i1 = findIntersection(P1, P2, P3, P4);
  return isPointBetween(i1, P1, P2) && isPointBetween(i1, P3, P4);
}

const findIntersectionPolygon = (line1, line2, line3, line4) => {
  let a = findSegmentIntersection(line1[0], line1[1], line3[0], line3[1]);
  let b = findSegmentIntersection(line1[0], line1[1], line4[0], line4[1]);
  let c = findSegmentIntersection(line2[0], line2[1], line3[0], line3[1]);
  let d = findSegmentIntersection(line2[0], line2[1], line4[0], line4[1]);

  if (a && b && c && d)  { return [a,b,c,d]; }
  return false;
}

module.exports.findIntersection = findIntersection;
module.exports.isPointBetween = isPointBetween;
module.exports.findSegmentIntersection = findSegmentIntersection;
module.exports.isSegmentIntersected = isSegmentIntersected;
module.exports.point = point;
module.exports.toLine = toLine;
module.exports.movePoint = movePoint;
module.exports.findIntersectionPolygon = findIntersectionPolygon;

module.exports.createPolygon = createPolygon;
module.exports.drawPolygonOnCanvas = drawPolygonOnCanvas;
module.exports.calculateBoundingBox = calculateBoundingBox;
module.exports.rotatePoint = rotatePoint;
module.exports.rotatePointXY = rotatePointXY;
module.exports.rotatePolygon = rotatePolygon;
module.exports.drawLineOnCanvas = drawLineOnCanvas;

module.exports.drawHatchedPolygonOnCanvas = drawHatchedPolygonOnCanvas;
module.exports.clip = clip;
module.exports.hatchPolygon = hatchPolygon;
module.exports.createSquarePolygon = createSquarePolygon;
