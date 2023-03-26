const polygonBoolean = require('2d-polygon-boolean');
const lineclip = require('./lineclip');

let context;

/**
 * set this canvas as the one the rest of the functions work on
 * @param {Canvas2D} canvas 
 */
const init = (canvas) => context = canvas;

/**
 * create a regular polygon [[x1,y1],[x2,y2], ...]
 * @param {number} nrOfSides 
 * @param {number} sideLength 
 * @param {[x,y] | {x,y}} centerPoint 
 */
const createPolygon = (nrOfSides, sideLength, centerPoint) => {
    if (!centerPoint.x) { centerPoint = point(centerPoint[0], centerPoint[1]); }

    let centerAngle = Math.PI * 2 / nrOfSides;
    let b = Math.sin(centerAngle/2) * sideLength / 2 / Math.cos(centerAngle/2);
    let x1 = centerPoint.x - sideLength / 2;
    let y1 = centerPoint.y + b;

    let polygon = [];
    polygon.push([x1, y1]);
    for (let i = 1; i < nrOfSides; i++) {
      polygon.push(rotatePoint([x1, y1], centerPoint, 360 / nrOfSides * i))
    }

    return polygon;
}
/**
 * create a polygon with 4 sides [[],[],[],[]]
 * @param {number} originX 
 * @param {number} originY 
 * @param {number} width 
 * @param {number} height 
 */
const createSquarePolygon = (originX, originY, width, height = width) => {
    let result = [];
    result.push([originX, originY]);
    result.push([originX + width, originY]);
    result.push([originX + width, originY + height]);
    result.push([originX, originY + height]);

    return result;
}

const drawPolygonOnCanvas = (poly, options = {}) => {
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


/**
 * draw a line on the canvas
 * @param {array} line [[x1,y1],[x2,y2]] or [point, point] 
 * @param {any} options { strokestyle, lineWidth, lineCap, lineJoin }
 */
const drawLineOnCanvas = ( line, options = {}) => {

    if (!line[0] || !line[1]) {
      return;
    }
    
    let x1 = line[0].x  || line[0][0],
        x2 = line[1].x || line[1][0],
        y1 = line[0].y || line[0][1],
        y2 = line[1].y || line[1][1];


    context.beginPath();
  
    context.strokeStyle = options.strokeStyle || 'black';
    context.lineWidth = options.lineWidth || 0.01;
    context.lineCap = options.lineCap || 'square';
    context.lineJoin = options.lineJoin || 'miter';
  
    context.moveTo(x1, y1);
  
    context.lineTo(x2, y2);
  
    context.stroke();
}

const drawArcOnCanvas = ( x, y, radius, startAngle, endAngle, options = {}) => {
  //console.log({x,y,radius, startAngle, endAngle, options});
  context.beginPath();

  let sAngle = (Math.PI / 180) * startAngle;
  let eAngle = (Math.PI / 180) * endAngle;

  context.strokeStyle = options.strokeStyle || 'black';
  context.lineWidth = options.lineWidth || 0.01;
  context.lineCap = options.lineCap || 'square';
  context.lineJoin = options.lineJoin || 'miter';

  context.arc(x, y, radius, sAngle, eAngle);
  context.stroke();
}

const calculateBoundingBox = (polyLine, padding = 0) => {
    let left = Number.MAX_VALUE,
      top = Number.MAX_VALUE,
      right = 0,
      bottom = 0;
     // console.log(polyLine)
  
    polyLine.map(p => {
      left = Math.min(p[0], left);
      top = Math.min(p[1], top);
      right = Math.max(p[0], right);
      bottom = Math.max(p[1], bottom);

     //console.log({left,top, right, bottom})
    //  console.log({in:p[0], out:left})
    //  console.log({in:p[1], out:top})
    //  console.log({in:p[0], out:right})
    //  console.log({in:p[1], out:bottom})
    });


  
    let result = [
      [left - padding, top - padding],
      [right + padding, top - padding],
      [right + padding, bottom + padding],
      [left - padding, bottom + padding]
    ];
   // console.log({polyLine, result});
      return result;
};

const rotatePointXY = (p, c, angle) => {
    if (angle === 0) return p;

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

const rotatePoint = (p, center, angle) => {
  if (angle === 0) return p;

  if (!p.x) { p = point(p[0],p[1]); }
  if (!center.x) { center= point(center[0],center[1]); }

  let radians = (Math.PI / 180) * angle,
      x = p.x, // || p[0],
      y = p.y, // || p[1],
      cx = center.x, // || center[0],
      cy = center.y, // || center[1],
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = cos * (x - cx) - sin * (y - cy) + cx,
      ny = cos * (y - cy) + sin * (x - cx) + cy;

  //console.log(x,y,cx,cy, nx, ny)
  return [nx, ny];
};
  
const rotatePolygon = (polyLine, center, angle) => {
    return polyLine.map(p => {
        return rotatePoint(p, center, angle);
    });
};

const hatchDonut = (center, outerRadius, innerRadius, hatchAngle, hatchSpacing, innerCenter = null) => {
  if (!innerCenter) { innerCenter = center; }

  let lines = [];
  
  hatchCircle(center, outerRadius, hatchAngle, hatchSpacing).forEach(l => {
    let int2 = findCircleLineIntersectionsP(innerRadius, innerCenter, l);
    if (int2 && int2.length > 0 && int2[0] && int2[1]) {
      let l1 = toLine(l[0], int2[0]),
          l2 = toLine(int2[1], l[1]);

      lines.push(l1);
      lines.push(l2);
    }
    else {
      lines.push(l);
    }

  });

  return lines;
}

const hatchCircle = (center, radius, angle, spacing) => {
  let widthAndMargin = radius*2*1.1;
  let numLines = Math.floor(widthAndMargin/spacing);

  let x = center.x - widthAndMargin/2,
      y = center.y - widthAndMargin/2;
  let hatchlines = [];
  
  for (let i = 0; i <= numLines; i++) {
    let line = [[x, y + i * spacing], [x + widthAndMargin, y + i * spacing]];
    let rotatedLine = rotatePolygon(line, center, angle);
    let intersections = findCircleLineIntersectionsP(radius, center, rotatedLine);
    let clippedLine = [intersections[0], intersections[1]];
    if (clippedLine && clippedLine.length > 0 && clippedLine[0] && clippedLine[1]) hatchlines.push(clippedLine);
  }

  return hatchlines;
}

const hyperspacePolygon = (polygon, anglespacing = 1, padding = -1) => {
  let polygonNotP = polygon.map(p => {
    return [p.x || p[0], p.y || p[1]];
  });

  // todo: why is padding so important
  let rectangle = calculateBoundingBox(polygonNotP);
  if (padding === -1) { padding = Math.max(rectangle[2][1], rectangle[2][0]); }
  rectangle = calculateBoundingBox(polygonNotP, padding);

  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  
  let center = [x + width/2, y + height/2];

  let numLines = Math.ceil(360 / anglespacing);
  let radialLines = [];

  for (let i = 1; i <= numLines; i++) {
    let line = [[center[0], center[1]],[center[0], center[1] - height/2]];
    let rotatedLine = rotatePolygon(line, center, anglespacing * i);
    radialLines.push(rotatedLine);
  }

  let result = [];
  for (let i = 0; i < radialLines.length; i++) {
      let x = null;
      try {
        x = clip(radialLines[i], polygonNotP);
      } catch {}
      if (x) {
          x.map(l => {
              if (l.length === 2) {result.push([l[0], l[1]]); }
              else { result.push([l[l.length-2],l[l.length-1]]); }
              });
      }
    }

  return result;
};

const hyperspacePolygonDouble = (polygon, anglespacing = 1, padding = -1, offset = [0,0]) => {
  let polygonNotP = polygon.map(p => {
    return [p.x || p[0], p.y || p[1]];
  });

  // todo: why is padding so important
  let rectangle = calculateBoundingBox(polygonNotP);
  if (padding === -1) { padding = Math.max(rectangle[2][1], rectangle[2][0]); }
  rectangle = calculateBoundingBox(polygonNotP, padding);

  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  
  let center = [x + width/2 + offset[0], y + height/2 + offset[1]];

  let numLines = Math.ceil(180 / anglespacing);
  let radialLines = [];

  for (let i = 1; i <= numLines; i++) {
    let rotatedPoint1 = rotatePoint([center[0], center[1] - height/2], [center[0], center[1]], (anglespacing*i));
    let rotatedPoint2 = rotatePoint(rotatedPoint1, [center[0], center[1]], 180);
    let rotatedLine = ([rotatedPoint2, rotatedPoint1]);
    radialLines.push(rotatedLine);
  }

  let result = [];
  for (let i = 0; i < radialLines.length; i++) {
      let x = null;
      try {
        x = clip(radialLines[i], polygonNotP);
      } catch {}
      if (x) {
          x.map(l => {
              if (l.length === 2) {result.push([l[0], l[1]]); }
              else { result.push([l[l.length-2],l[l.length-1]]); }
              });
      }
    }

  return result;
};

const hatchPolygon = (polygon, angle, spacing = 0.1, padding = 0) => {
    let polygonNotP = polygon.map(p => {
      return [p.x || p[0], p.y || p[1]];
    });


    let rectangle = calculateBoundingBox(polygonNotP, padding);

    let x = rectangle[0][0];
    let y = rectangle[0][1];
    let height = rectangle[2][1] - y;
    let width = rectangle[2][0] - x;

    let rotatedRectangle = rotatePolygon(
      rectangle,
      [x + width / 2, y + height / 2],
      angle
    );
    

    let box = calculateBoundingBox(rotatedRectangle, 0); //Math.max(height, width));
    
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
          x = clip(hatchlines[i], polygonNotP);
        } catch {}
        if (x) {
            x.map(l => {
                result.push([l[0], l[1]]);
                });
        }
      }

    return result;
};

const hatch2 = (polygon, angle, spacing = 0.1) => {
  let rectangle = poly.calculateBoundingBox(polygon);//boundingBox(polygon);
  let x = rectangle[0][0];
  let y = rectangle[0][1];
  let height = rectangle[2][1] - y;
  let width = rectangle[2][0] - x;
  let rotatedRectangle = poly.rotatePolygon(
    rectangle,
    [x + width / 2, y + width / 2],
    angle
  );
  //console.log(rotatedRectangle);
  let box = poly.calculateBoundingBox(rotatedRectangle, 0);

  let x2 = box[0][0];
  let y2 = box[0][1];
  let height2 = box[2][1] - y2;
  let width2 = box[2][0] - x2;

  let numLines = Math.floor(height2 / spacing);
  let result = [];

  for (let i = 0; i <= numLines; i++) {
    let line = [[x2, y2 + i * spacing], [x2 + width2, y2 + i * spacing]];
    let rotatedLine = poly.rotatePolygon(line, [x + width / 2, y + width / 2], angle);
    result.push(rotatedLine);
  }
  return result;
};
  
const clip = (lineToClip, lineThatClips) => {
    let closedLine = [lineToClip[0], lineToClip[1], lineToClip[1], lineToClip[0]];
    return polygonBoolean(lineThatClips, closedLine, 'and');
};
  
const drawHatchedPolygonOnCanvas = (context, posX, posY, angle, space, sides, sideLength = 2, options = {}) => {
    let rect = createPolygon(sides, sideLength, [posX, posY]);
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

const drawHatchedPoly = (posX, posY, angle, space, sideLength = 2) => {
  let rect = poly.createPolygon(6, sideLength, [posX, posY]);
  let hatched = hatch2(rect, angle, space);
  for (let i = 0; i < hatched.length; i++) {
    let x = null;
    try {
      x = clip(hatched[i], rect);
    } catch {}
    if (x) {
      x.map(l => {
        drawLine([l[0], l[1]]);
      });
    }
  }
};

const point = (x, y) => {
  return {x, y};
}

const toLine = (point1, point2) => {
  let x1 = point1.x || point1[0],
      x2 = point2.x || point2[0],
      y1 = point1.y || point1[1],
      y2 = point2.y || point2[1];

  return [[x1, y1],[x2, y2]];
}

// const movePoint = (p, vector) => {
//   return point(p.x + vector.x, p.y + vector.y);
// } 

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

const lineEquationFromPoints = (p1, p2) => {
  if (!p1.x) { p1 = point(p1[0], p1[1]); }
  if (!p2.x) { p2 = point(p2[0], p2[1]); }

  // y = mx + n
  let m = (p1.y - p2.y) / (p1.x - p2.x); // gradient or slope
  let n = p1.y - m * p1.x; //y-intercept
  
  return {m,n};
}

const findCircleLineIntersectionsP = (r, c, line) => {
  let h = c.x || c[0],
      k = c.y || c[1],
      eq = lineEquationFromPoints(line[0], line[1]),
      m = eq.m,
      n = eq.n;

  return findCircleLineIntersections(r,h,k,m,n)
            .map(xInt => {return point(xInt[0], (m*xInt + n))});
}

const findCircleLineIntersections2 = (r, c, line) => {
  let h = c.x || c[0],
      k = c.y || c[1],
      eq = lineEquationFromPoints(line[0], line[1]),
      m = eq.m,
      n = eq.n;

  return findCircleLineIntersections(r,h,k,m,n)
            .map(xInt => {return [xInt[0], (m*xInt + n)]});
}


const findCircleLineIntersectionsWithY = (r, h, k, m, n) => {
  let x = findCircleLineIntersections(r, h, k, m, n);
  if (x.length === 0) { return x; }
  if (x.length === 1) { 
    let y = m * x[0][0] + n;
    return [[x[0][0],y]]
  }
  if (x.length === 2) { 

    let y1 = m * x[0][0] + n;
    let y2 = m * x[1][0] + n;

    return [[x[0][0],y1],[x[1][0],y2]]
   }
}

const findCircleLineIntersections = (r, h, k, m, n) => {
  // circle: (x - h)^2 + (y - k)^2 = r^2
  // line: y = m * x + n
  // r: circle radius
  // h: x value of circle centre
  // k: y value of circle centre
  // m: slope
  // n: y-intercept

  // get a, b, c values
  let a = 1 + (m*m);
  let b = -h * 2 + (m * (n - k)) * 2;
  let c = (h*h) + ((n - k)*(n-k)) - (r*r);

  // get discriminant
  let d = (b*b) - 4 * a * c;
  if (d >= 0) {
      // insert into quadratic formula
      let x1 = (-b + Math.sqrt((b*b) - 4 * a * c)) / (2 * a);
      let x2 = (-b - Math.sqrt((b*b) - 4 * a * c)) / (2 * a);
      let intersections = [
          [x1],
          [x2],
      ];
      
      if (d == 0) {
          // only 1 intersection
          return [intersections[0]];
      }
      return intersections;
  }
  // no intersection
  return [];
}

const pointIsInsideBB = (p, bb) => {
  // bb = {minx, miny, maxx, maxy}; 

  if (!p.x) { p = point(p[0], p[1]); } // check if point is {x,y}
  return ( p.x >= bb.minx && p.x <= bb.maxx && p.y <= bb.maxy && p.y >= bb.miny );
}

const clipLineToBB = (line, bb) => {
  // bb = {xmin, ymin, xmax, ymax}; 

  // check if line is completely out of the box
  if (line[0][0] <= bb.xmin && line[1][0] <= bb.xmin) { return false; } // line is left of box
  if (line[0][0] >= bb.xmax && line[1][0] >= bb.xmax) { return false; } // line is right of box
  if (line[0][1] >= bb.ymax && line[1][1] >= bb.ymax) { return false; } // line is higher than box
  if (line[0][1] <= bb.ymin && line[1][1] <= bb.ymin) { return false; } // line is lower than box

  if (pointIsInsideBB(line[0], bb) && pointIsInsideBB(line[1], bb)) { return line;}

  let p1 = [line[0][0] || line[0].x, line[0][1] || line[0].y];
  let p2 = [line[1][0] || line[1].x, line[1][1] || line[1].y];
  let clipped = lineclip.polyline([p1, p2], [bb.xmin, bb.ymin, bb.xmax, bb.ymax]);
  if (clipped.length>0) {
    return clipped[0];
  }

  return false;
}

const clipLineToCircle = (line, center, radius, padding = 0) => {
  let mn = lineEquationFromPoints(line[0], line[1]);
  // y = mx + n
  let xmin = Math.min(line[0][0], line[1][0]) - padding;
  let xmax = Math.max(line[0][0], line[1][0]) + padding;
  let ymin = mn.m * xmin + mn.n;
  let ymax = mn.m * xmax + mn.n;
  let paddedLine = [[xmin,ymin],[xmax,ymax]];

  let intersections = findCircleLineIntersectionsP(radius, center, paddedLine);
  return [intersections[0], intersections[1]];
}

const drawCircle = context => (cx, cy, radius) => {
  
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.stroke();
}

const drawArc = (cx, cy, radius, startAngle, endAngle) => {
  context.beginPath();
  context.arc(cx, cy, radius, 0, startAngle, endAngle);
  context.stroke();
}

const drawPolygon = context => (polygon) => {
  let polygonP = [];
  if (polygon[0].x) {
    polygonP = polygon;
  }
  else {
    polygon.forEach(element => {
      polygonP.push(point(element[0], element[1]));
    });
  }

  context.beginPath();

  context.moveTo(polygonP[0].x, polygonP[0].y);

  polygonP.slice(1,polygonP.length).forEach(e => {
    context.lineTo(e.x, e.y);
  });

  context.lineTo(polygonP[0].x, polygonP[0].y);

  context.stroke();
}

/**
 * returns the distance between two points
 * 
 * @param {any} p1  [x, y] or {x,y}
 * @param {any} p2  [x, y] or {x,y}
 */
const distanceBetween = (p1, p2) => {

  if (!p1.x) { p1 = point(p1[0], p1[1]); }
  if (!p2.x) { p2 = point(p2[0], p2[1]); }

  let dist = Math.hypot(p2.x-p1.x, p2.y-p1.y);
  return dist;
}

/**
 * returns if a point is inside the circle, exclusive
 * @param {{x,y}} point 
 * @param {any} center [x, y] or {x,y}
 * @param {number} radius 
 */
const pointIsInCircle = (point, center, radius) => {
  return distanceBetween(point, center) < radius;
}

const crossProduct = (p1, p2, p3) => {

  if (!p1.x) { p1 = point(p1[0], p1[1]); }
  if (!p2.x) { p2 = point(p2[0], p2[1]); }
  if (!p3.x) { p3 = point(p3[0], p3[1]); }


  var dx1 = p2.x - p1.x;
  var dy1 = p2.y - p1.y;
  var dx2 = p3.x - p2.x;
  var dy2 = p3.y - p2.y;

  var zcrossproduct = dx1 * dy2 - dy1 * dx2;
  return zcrossproduct;
}

const toPolygonP = (polygon) =>{
  let polygonP = [];
  if (polygon[0].x) {
    polygonP = polygon;
  }
  else {
    polygon.forEach(element => {
      polygonP.push(point(element[0], element[1]));
    });
  }
  return polygonP;
}

/**
 * returns if a polygon is convex
 * if nr of points > 2
 * and every angle is < 180degrees 
 * and every angle is oriented the same way
 * and the sum of all angles is 360degrees
 * @param {[[x1,y]1,[x2,y2,...]]} polygon 
 */
const isPolygonConvex = (polygon) => {
  //https://stackoverflow.com/questions/471962/how-do-i-efficiently-determine-if-a-polygon-is-convex-non-convex-or-complex/45372025#45372025
  if (polygon.length < 3) { return false; }

  var [old_x, old_y] = polygon[polygon.length-2];
  var [new_x, new_y] = polygon[polygon.length-1];
  let new_direction = Math.atan2(new_y - old_y, new_x - old_x);
  let old_direction = 0;
  let angle_sum = 0;
  let orientation = 1;

  for (let i = 0; i < polygon.length; i++) {
    old_x = new_x;
    old_y = new_y;
    old_direction = new_direction;
    [new_x, new_y] = polygon[i];
    new_direction = Math.atan2(new_y - old_y, new_x - old_x);
    let angle = new_direction - old_direction;
    if (angle <= - Math.PI) { angle += (Math.PI*2); }
    else if (angle > Math.PI){angle -= (Math.PI*2); }
    if (i == 0)  //# if first time through loop, initialize orientation
    { 
      if (angle === 0) { return false; }
      orientation = angle > 0 ? 1 : -1;
    } else {
      if (orientation * angle <= 0) { return false; }
    }
    angle_sum += angle;
  }
  return Math.abs(Math.round(angle_sum / (Math.PI*2))) == 1;
}

/***
 * does not work, to be checked
 */
const isPolygonConvexEx = (polygon) => {
  polygon = toPolygonP(polygon);
  let lastSign = null;

  for (let i = 2; i < polygon.length; i++) {
      //calculate crossproduct from 3 consecutive points
      let crossproduct = crossProduct(polygon[i - 2], polygon[i - 1], polygon[i]);
  console.log(i + ". crossproduct from ("+ polygon[i - 2].x +" "+polygon[i - 1].x +" "+polygon[i].x +"): " + crossproduct);
      let currentSign = Math.sign(crossproduct);
      if (lastSign == null) {
        //last sign init
        lastSign = currentSign;
      }

      if (lastSign !== currentSign) {
          //different sign in cross products,no need to check the remaining points --> concave polygon --> return function
          return false;
      }
      lastSign = currentSign;
  }

  //first point must check between second and last point, this is the last 3 points that can break convexity
  var crossproductFirstPoint = crossProduct(polygon[polygon.length - 2], polygon[0], polygon[1]);
  
  console.log("cross product first point: ", crossproductFirstPoint);
  
  return (lastSign === Math.sign(crossproductFirstPoint));
}

const dashLine = (line, segments, dashlength = 1) => {
  let lineNotP = line.map(p => {
    return [p.x || p[0], p.y || p[1]];
  });
  //debugger;
  let result = [];

  if (segments === null || segments.length === 0) {
    let l = distanceBetween(line[0], line[1]);
    let nrOfSegments = Math.floor(l / dashlength);
    segments = Array(nrOfSegments).fill(dashlength);
  }

  let sum = segments.reduce((a, c) => a + c, 0);

  
  let v = [lineNotP[1][0]-lineNotP[0][0],lineNotP[1][1]-lineNotP[0][1]];
  let dx = v[0] / sum;
  let dy = v[1] / sum;

  let last = lineNotP[0];
  for (let i = 0; i < segments.length; i++) {
    let p = [last[0]+dx*segments[i], last[1]+dy*segments[i]];
    result.push([last, p]);
    last = p;
  }

  return result;
}

const movePoint = (p, vector) => {
  let isArray = !p.x;
  let p1 = p;
  //let v1 = vector;

  if (isArray) { p1 = point(p[0], p[1]); }
  //if(!v1.x) { v1 = point(vector[0], vector[1]); }

  p1.x = p1.x + (vector.x ? vector.x : vector[0]);
  p1.y = p1.y + (vector.y ? vector.y : vector[1]);

  if (isArray) { return [p1.x, p1.y]; }
  return p1;
}

const movePoly = (p, vector) => {
  let result = p.map(e => movePoint(e, vector));
  return result;
}

const createVector = (from, to) => {
  let returnAsArray = !to.x;

  if (!to.x) { to = point(to[0], to[1]); }
  if (!from.x) { from = point(from[0], from[1]); }

  let result = [to.x - from.x, to.y - from.y ];

  if (returnAsArray) { return result; }
  return point(...result);
}

const intersection = (x0, y0, r0, x1, y1, r1) => {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;

  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  dx = x1 - x0;
  dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  d = Math.sqrt((dy*dy) + (dx*dx));

  /* Check for solvability. */
  if (d > (r0 + r1)) {
      /* no solution. circles do not intersect. */
      return false;
  }
  if (d < Math.abs(r0 - r1)) {
      /* no solution. one circle is contained in the other */
      return false;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.  
   */

  /* Determine the distance from point 0 to point 2. */
  a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) ;

  /* Determine the coordinates of point 2. */
  x2 = x0 + (dx * a/d);
  y2 = y0 + (dy * a/d);

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  h = Math.sqrt((r0*r0) - (a*a));

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  rx = -dy * (h/d);
  ry = dx * (h/d);

  /* Determine the absolute intersection points. */
  var xi = x2 + rx;
  var xi_prime = x2 - rx;
  var yi = y2 + ry;
  var yi_prime = y2 - ry;

  return [xi, xi_prime, yi, yi_prime];
}

//calculate the angle between three points
function calculateAngle(ax, ay, bx, by, cx, cy) {
  const angleA = Math.atan2(ay - cy, ax - cx);
  const angleB = Math.atan2(by - cy, bx - cx);
  let angle = angleB - angleA;
  // if (angle >= Math.PI) {
  //   return angle - 2 * Math.PI;
  // } else if (angle < -Math.PI) {
  //   return angle + 2 * Math.PI;
  // }

  if (angle < 0) angle = angle + 2 * Math.PI;
  return angle;
}

let poly = init;
module.exports = poly;
module.exports.default = poly;

poly.init = init;
poly.findIntersection = findIntersection;
poly.isPointBetween = isPointBetween;
poly.distanceBetween = distanceBetween;
poly.findSegmentIntersection = findSegmentIntersection;
poly.isSegmentIntersected = isSegmentIntersected;
poly.point = point;
poly.toLine = toLine;
poly.findIntersectionPolygon = findIntersectionPolygon;
poly.createPolygon = createPolygon;
poly.drawPolygonOnCanvas = drawPolygonOnCanvas;
poly.calculateBoundingBox = calculateBoundingBox;
poly.rotatePoint = rotatePoint;
poly.rotatePointXY = rotatePointXY;
poly.rotatePolygon = rotatePolygon;
poly.drawLineOnCanvas = drawLineOnCanvas;
poly.drawHatchedPolygonOnCanvas = drawHatchedPolygonOnCanvas;
poly.clip = clip;
poly.hatchPolygon = hatchPolygon;
poly.createSquarePolygon = createSquarePolygon;
poly.lineEquationFromPoints = lineEquationFromPoints;
poly.findCircleLineIntersections = findCircleLineIntersections;
poly.findCircleLineIntersectionsP = findCircleLineIntersectionsP;
poly.findCircleLineIntersections2 = findCircleLineIntersections2;
poly.findCircleLineIntersectionsWithY = findCircleLineIntersectionsWithY;
poly.hatchCircle = hatchCircle;
poly.hatchDonut = hatchDonut;
poly.pointIsInsideBB = pointIsInsideBB;
poly.clipLineToBB = clipLineToBB;
poly.clipLineToCircle = clipLineToCircle;
poly.pointIsInCircle = pointIsInCircle;
poly.drawCircle = drawCircle;
poly.drawPolygon = drawPolygon;
poly.drawArc = drawArc;
poly.drawArcOnCanvas = drawArcOnCanvas;
poly.crossProduct = crossProduct;
poly.isPolygonConvex = isPolygonConvex;
poly.hyperspacePolygon = hyperspacePolygon;
poly.hyperspacePolygonDouble = hyperspacePolygonDouble;
poly.dashLine = dashLine;
poly.movePoint = movePoint;
poly.movePoly = movePoly;
poly.createVector = createVector;
poly.intersection = intersection;
poly.calculateAngle = calculateAngle;