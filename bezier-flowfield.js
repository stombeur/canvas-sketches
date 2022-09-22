const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { createArcPath, createLinePath, createCubicBezierPath } = require('./utils/paths.js');
const poly = require('./utils/poly.js');
const postcards = require('./utils/postcards');

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  units: 'mm',
};

let paths = [];

const createGrid = (count, width, height, margin = width * 0.12) => {
  const points = [];

  const countX = count;
  const countY = Math.floor(countX / width * height);
  for (let y = 0; y < countY; y++) {
  for (let x = 0; x < countX; x++) {
    
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      const position = [ u, v ];
      const noise = random.noise2D(u,v);
      const rotation = (noise+1)/2 * 360;
      const lerpu = lerp(margin, width - margin, u);
      const lerpv = lerp(margin, height - margin, v);
      const lerpPosition = [lerpu, lerpv];

      const distance = Math.max(width/countX, height/countY);

      points.push({ position,
                    rotation,
                    lerpPosition,
                    distance
                  });
    }
  }
  return points;
};

const sketch = ({ width, height }) => {
  

  return ({ context, width, height, units }) => {
    const count = 50;
    paths = [];

    const drawLineOnCanvas = (ctx, line) => {    
      ctx.moveTo(line[0][0], line[0][1]);
      ctx.lineTo(line[1][0], line[1][1]);
    }

    const startingPoint = (points, minDegrees, maxDegrees) => {
        for (let i = 0; i < points.length; i++) {
            const d = points[i].rotation;
            console.log(d, minDegrees, maxDegrees)
            if (minDegrees <= d && d <= maxDegrees) return {index: i, point: points[i]};
        }
        throw(new Error('no point found'));
    }

    const closestPoint = (point, pointIndex, points, columnCount, distance) => {
        // consider only the points immediately around the index
        let consider = [];
        let indices = [];

        if (pointIndex > columnCount)
        {
            /*
                x o x
                x   x
                x x x
            */
            indices.push(pointIndex - columnCount)
            if ((pointIndex % columnCount) > 0) {
                /*
                    o x x
                    o   x
                    x x x
                */
                indices.push(pointIndex - columnCount -1)
                indices.push(pointIndex - 1)
            }
            if ((pointIndex % columnCount) < columnCount - 1) {
                /*
                    x x o
                    x   o
                    x x x
                */
                indices.push(pointIndex - columnCount + 1)
                indices.push(pointIndex + 1)
            }
        }
        if (pointIndex < points.length - columnCount) {
            /*
                x x x
                x   x
                x o x
            */
            indices.push(pointIndex + columnCount)
            if ((pointIndex % columnCount) < (columnCount -1 )) {
                /*
                    x x x
                    x   o
                    x x o
                */
                indices.push(pointIndex + columnCount + 1)
                indices.push(pointIndex + 1)
            }
            if ((pointIndex % columnCount) > 0) {
                /*
                    x x x
                    o   x
                    o x x
                */
                indices.push(pointIndex + columnCount -1)
                indices.push(pointIndex -1)
            }
        }
        indices = [...new Set(indices)]
        //console.log(indices)

        let rotatedPoint = poly.rotatePoint([point.position[0], point.position[1] - (1/(count-1))], point.position, point.rotation);
        let closest = -1;
        let closestDistance = Number.MAX_VALUE;

        for (let i = 0; i < indices.length; i++) {
            const e = indices[i];
            let d = poly.distanceBetween(points[e].position, rotatedPoint)
            if (d < closestDistance) {closest = e; closestDistance = d}
        }
        
        console.log(indices, closest)
        return {indices, closest}
    }

    // const drawArcOnCanvas = (ctx, cx, cy, radius, sAngle, eAngle) => {    
    //   ctx.arc(cx, cy, radius, (Math.PI / 180) *  sAngle, (Math.PI / 180) *  eAngle);
    // }

    // const rotateArc = (arc, center, rot) => {
    //   let [[x1,y1],r,s,e] = arc;
    //   let [rotx1,roty1] = poly.rotatePoint([x1,y1], center, rot);
    //   return [[rotx1,roty1],r,s+rot,e+rot];
    // }

    // const triangle = (x,y, rotation) => {
    //   let h = Math.abs(rotation*10),
    //         w1 = Math.abs(rotation*1.3),
    //         w2 = Math.abs(rotation);

    //         return {line1:[[x-w1/2,y-h/2],[x-w2/2,y+h/2]],
    //           line2:[[x+w2/2,y+h/2],[x+w1/2,y-h/2]],
    //           arc1:[[x,y-h/2],w1/2,180,0],
    //           arc2:[[x,y+h/2],w2/2,0,180]};
    // }

    const draw = (origin, w, h) => {
      const margin = w * 0.08;
      
      random.setSeed(random.getRandomSeed());

      let points = createGrid(count, w, h, margin);
  
    //   points.forEach(data => {
    //     const {
    //       position,
    //       rotation,
    //       lerpPosition,
    //       distance
    //     } = data;

    //     const [x,y] = postcards.reorigin(lerpPosition, origin);
    //     const [x1, y1] = [x, y - distance];
    //     const [x2, y2] = poly.rotatePoint([x1, y1], [x, y], rotation)

    //     //paths.push(createArcPath([x,y], 0.2, 0, 360));
    //     paths.push(createLinePath([[x,y],[x2, y2]]));


    //   });

      let xx = random.rangeFloor(count/10, count - count/10)
      let yy = random.rangeFloor(count/10, count - count/10)
      let index = xx * yy// startingPoint(points, 90, 240);
    //   let index =count*30;
    //   s = {index: index, point: points[index]}

      let a = {index, point: points[index]};
      let b = {}
      let deletePointsAtIndex = []
      let curvePoints = []

      //paths.push(createArcPath(postcards.reorigin(a.point.lerpPosition, origin), 0.6, 0, 360));
      curvePoints.push(postcards.reorigin(a.point.lerpPosition, origin))
      for (let i = 0; i < 500; i++) {
        let {indices, closest} = closestPoint(a.point, a.index, points, count)
        deletePointsAtIndex.push(... indices)
        let b = {point: points[closest], index: closest}
        //paths.push(createArcPath(postcards.reorigin(b.point.lerpPosition, origin), 0.6, 0, 360));
        curvePoints.push(postcards.reorigin(b.point.lerpPosition, origin))
        a = b;
      }

      for (let i = 1; i < curvePoints.length - 2; i=i+3) {
        const element = curvePoints[i];
        paths.push(createCubicBezierPath(curvePoints[i-1], curvePoints[i+2], curvePoints[i], curvePoints[i+1]))
      }

      
      for (let i = 0; i < points.length; i++) {
        if (deletePointsAtIndex.indexOf(i) > -1) continue;
        const element = points[i];
        
        const {
            position,
            rotation,
            lerpPosition,
            distance
          } = element;
  
          const [x,y] = postcards.reorigin(lerpPosition, origin);
          const [x1, y1] = [x, y - distance];
          const [x2, y2] = poly.rotatePoint([x1, y1], [x, y], rotation)
  
          //paths.push(createArcPath([x,y], 0.2, 0, 360));
          paths.push(createLinePath([[x,y],[x2, y2]]));
      }
      

    //   console.log(s)
    //   let {indices, closest} = closestPoint(s.point, s.index, points, count)


    //   paths.push(createArcPath(s.point.lerpPosition, 0.6, 0, 360));
    //   indices.forEach(p => paths.push(createArcPath(points[p].lerpPosition, 0.3, 0, 360)));
    //   paths.push(createArcPath(points[closest].lerpPosition, 0.6, 0, 360));

    }

    
    postcards.drawSingle(draw, width, height);
    

    return renderPaths(paths, {
      context, width, height, units
    });
  }
};

canvasSketch(sketch, settings);