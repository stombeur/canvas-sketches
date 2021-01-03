
const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const postcards = require('./utils/postcards');
const random = require('canvas-sketch-util/random');
const { distanceBetween } = require('./utils/poly');
const poly = require('./utils/poly');
import { polyline } from './utils/polyline';

const settings = {
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const drawArc = (center, radius, sAngle, eAngle) => {
  return createPath(ctx => {
    let c = {}
    if (center.x) { c.x = center.x; c.y = center.y; }
    else { c.x = center[0]; c.y = center[1]; }
    drawArcOnCanvas(ctx, c.x, c.y, radius, sAngle, eAngle);
  });
}

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

const drawLine = (l) => {
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


let paths1 = [];
let paths2 = [];
let background1 = [];
let background2 = [];

const drawKerstbal = (circle) => {
  let radius = circle.r;
  let center = circle.c;

  let angle = -60; // 30 vanaf top naar rechts

  let top = [center[0], center[1] - radius];
  let pl = new polyline([[top[0], top[1] + radius/20],[top[0], top[1] - radius/20]]);
  let pl1 = pl.rotate(center, 25);
  let pl2 = pl.rotate(center, 35);

  let kerstbal = [];
  kerstbal.push(drawArc(center, radius, -55, -65));
  kerstbal.push(drawLine(pl1.points));
  kerstbal.push(drawLine(pl2.points));

  return kerstbal;
}

const drawSnowflake = (circle, nrOfArms) => {
  let radius = circle.r *0.9;
  let center = circle.c;

  //let nrOfArms = 7;
  let angle = 360 / nrOfArms;
  let division = [5/nrOfArms*6, 3/nrOfArms*2, 3];

  let segment = [];
  /*
    line = segment
    division = 0

    while division < division.length
      add line to array
      walk line division times 
        add new line, mirror along line
        if division+1 < division.length
          do again
  */
  

  const doIt = (line, divIndex) => {
    
    let divs = division[divIndex];
    // draw new arm and mirror
    let vector = poly.createVector(line[0], line[1]);
    let l = random.range(0.3,0.35);
    for (let i = 1; i <= divs; i++) {
      let d = i*(1/(divs+1));
      let vector1 = [vector[0]*d, vector[1]*d];
      let vector2 = [vector[0]*(d+l), vector[1]*(d+l)];
      let angle = random.boolean() ? 45 : 135;
      let arm = [poly.movePoint(line[0], vector1), poly.movePoint(line[0], vector2)];
      let arm1 = [arm[0], poly.rotatePoint(arm[1], arm[0], -angle)];
      let arm2 = [arm[0], poly.rotatePoint(arm[1], arm[0], angle)];
      segment.push(new polyline(arm1));
      segment.push(new polyline(arm2));
  
      if (divIndex+1<division.length) {
        doIt(arm1, divIndex+1);
        doIt(arm2, divIndex+1);
      }
    }

  }

  let line = [center, [center[0], center[1] - radius]];
  segment.push(new polyline(line));
  let divIndex = 0;
  doIt(line, 0);

  let lines = [];

  for (let j = 1; j <= 360/angle; j++) {
    segment.forEach(s => {
      lines.push(s.rotate(center, angle * j));
    });
   
  }

  let snowflake = lines.map(l => drawLine(l.points));

  return snowflake;
}

const drawSnowflakeOld = (circle) => {
  let radius = circle.r;
  let center = circle.c;

  let angle = 30; 

  let nrOfLines = 10;
  let segment = [];
  for (let i = 0; i < nrOfLines; i++) {
    let p1X = random.range(0, radius) + center[0];
    let p1Y = center[1];
    let p1 = poly.rotatePoint([p1X, p1Y], center, random.range(0, angle));
    let p2X = random.range(0, radius) + center[0];
    let p2Y = center[1];
    let p2 = poly.rotatePoint([p2X, p2Y], center, random.range(0, angle/2));
    segment.push(new polyline([p1,p2]));
  }

  let orig = segment[0];
  let lines = [];

  for (let j = 1; j <= 360/angle; j++) {
    segment.forEach(s => {
      lines.push(s.rotate(center, angle * j));
    });
   
  }

  let snowflake = lines.map(l => drawLine(l.points));

  return snowflake;
}

const drawGemstone = (circle) => {
  //debugger;
  let gemstone = [];

  let big_radius = circle.r;
  let center = circle.c;
  let step = big_radius/6;
  let margin = circle.m;
  let radiuses1 = [big_radius, big_radius - margin/10, big_radius - margin/8];//, big_radius - margin/3, big_radius - margin/2];//, big_radius - margin, big_radius - (1.5*margin)];
  let radiuses2 = [big_radius, big_radius - margin/8];//, big_radius - (2.5*margin)];

      for (let j = 0; j < 1; j++) {
        
        let isConvex = false;
        let points = [];
        while (!isConvex) {
          let nr_of_sides = random.range(6, 9);
          let radius = 0;
          let start = [circle.c[0], circle.c[1] - radiuses1[radius]];//postcards.reorigin([w/2, h/2-radiuses1[radius]], origin);
          let startAngle = random.pick([...Array(360).keys()]);
          start = poly.rotatePoint(start, center, startAngle);
          points = [start];
        //debugger;
          let templines = [];
          for (let i = 0; i < nr_of_sides; i++) {
            let last = points[points.length-1]
            radius = radius + (random.boolean() ? 1 : -1);
            if (radius < 0) { radius = 0; }
            if (radius === radiuses1.length) { radius = radiuses1.length - 1; }
    
            let close = i+1 > nr_of_sides;
            if (close) { 
              templines.push(drawLine([last, points[0]]));
            } else {
              let q2 = [center[0], center[1] - radiuses1[radius]];
              q2 = poly.rotatePoint(q2, center, startAngle + 360 / nr_of_sides * (i+1));

              templines.push(drawLine([last, q2]));
              points.push(q2);
            }
    
          }
          isConvex = poly.isPolygonConvex(points);
          if (isConvex) { gemstone.push(...templines)}
        }
        let points2 = [];
        let templines = [];
        let facetlines = [];
        let facetpoints = [];

        // facetlijnen
        let skip = 1;
        let skipIndex = -1;
        for (let i = 0; i < points.length; i+=1) {
          if (random.boolean() && skip>0) { skip--; skipIndex = i; continue; } 
          //debugger;
          let int = poly.findCircleLineIntersectionsP(random.pick(radiuses2), center, [points[i], center]);
          let intpoint = int[0];
          if (int.length > 1 && !poly.isPointBetween(int[0], center, points[i]))
          {intpoint = int[1];}
          if (!intpoint) { continue; }
          intpoint = [intpoint.x, intpoint.y];
          facetlines.push([points[i], intpoint]); 
          points2.push(intpoint);       
        }

        if (skipIndex>-1) {
          //debugger;
          let inverseSkipIndex = Math.floor(points.length/2);
          let l1 = facetlines[inverseSkipIndex], l2 = facetlines[inverseSkipIndex+1];
          let v1 = [l1[1][0]-l1[0][0], l1[1][1]-l1[0][1]]; //vector1
          let v2 = [l2[1][0]-l2[0][0], l2[1][1]-l2[0][1]]; //vector2
          let vavg = [(v1[0]+v2[0])/2, (v1[1]+v2[1])/2];
          for (let f = 0; f < facetlines.length; f++) {
            let v = vavg;
            //debugger;
            if (f === inverseSkipIndex) { facetpoints.push(facetlines[f][0]);}
            else if (f === inverseSkipIndex+1) { facetpoints.push(facetlines[f][0]);}
            else {
            let l = facetlines[f];
            templines.push([l[0], [l[1][0]-v[0], l[1][1]-v[1]]]);
            facetpoints.push([l[1][0]-v[0], l[1][1]+-v[1]]);
            }
          }
        }

        // facetverbindingen
        let last = facetpoints[facetpoints.length-1];
        for (let i = 0; i < facetpoints.length; i++) {
         
          templines.push([last, facetpoints[i]]);
          last = facetpoints[i];
        }

        templines.forEach(l => {
          gemstone.push(drawLine(l));
        });

        //console.log(templines);

       // let polygon = templines.map(l => l[0] );
       
        // let hatches = poly.hatchPolygon(facetpoints, random.range(5,85), 0.5, 100);
        //  //console.log(hatches)
        // hatches.forEach(h => {
        //   paths.push(drawLine(h));
        // });
      }
  return gemstone;
}

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    
    paths1 = [];
    paths2 = [];
    background1 = [];
    background2 = [];

    const draw = (origin, w, h, options) => {
      let type = options[options.index];
      console.log(type)
      let circles = [];

      let margin = w * 0.09;
      if (type === "single") { margin = w * 0.14; }
      let ww = w - (margin*2);
      let hh = h - (margin*2);

      let rmax = Math.min(hh,ww) / 5;
      if (type === "single") { rmax = Math.min(hh,ww) / 3; }
      let rmin = rmax / 2;
      let steps = 100;
      let triesBeforeNextStep = 1000;
      if (type === "few") { steps = 3; triesBeforeNextStep = 1;}
      if (type === "more") { steps = 4; triesBeforeNextStep = 10;}

      let rcurrent = rmax;
      let rincrease = (rmax - rmin) / steps;

      //always draw first circle
      let xmin = origin[0]+margin+rcurrent/2;
      let xmax = origin[0]+margin+ww-rcurrent/2;
      let ymin = origin[1]+margin+rcurrent/2;
      let ymax = origin[1]+margin+hh-rcurrent/2;
      let c = [random.range(xmin, xmax),random.range(ymin, ymax)];
      circles.push({c,r:rcurrent});
      //paths.push(drawArc(c, rcurrent, 0, 360));

       while (rcurrent >= rmin) {
        if (type === "single") { break; }
        //draw circles until no more room
        xmin = origin[0]+margin+rcurrent/2;
        xmax = origin[0]+margin+ww-rcurrent/2;
        ymin = origin[1]+margin+rcurrent/2;
        ymax = origin[1]+margin+hh-rcurrent/2;

        let exhausted = false;
        //debugger;
        while(!exhausted) {
          let nrOfCirclesAdded = 0;
          for (let j = 0; j < triesBeforeNextStep; j++) {
            c = [random.range(xmin, xmax),random.range(ymin, ymax)];
            let intersect = false;
            circles.forEach(circle => { 
              let d = distanceBetween(c, circle.c);
              if (d < rcurrent + circle.r){ intersect = true;}
            });
            if (!intersect){
              circles.push({c,r:rcurrent});
              //paths.push(drawArc(c, rcurrent, 0, 360));
              nrOfCirclesAdded++;
              break;
            }
          }
          if (nrOfCirclesAdded === 0) { exhausted = true;}
        }
        

        rcurrent -= rincrease;
      }

      // const margin = w * 0.15;
      // let center = postcards.reorigin([w/2, h/2], origin);

      circles.forEach(circle => {
        let lines = drawSnowflake({c:circle.c,r:circle.r,m:circle.r*2*0.15}, random.pick([5,7,9]));
        if (random.boolean()) { paths1.push(lines); }
        else { paths2.push(lines);}
      });

      let centerOffset = [random.range(-15, 15), random.range(-15, 10)];

      // draw background
      xmin = origin[0]+1;
      xmax = origin[0]+w-1;
      ymin = origin[1]+1;
      ymax = origin[1]+h-1;
      let box = [[xmin,ymin],[xmax,ymin],[xmax,ymax],[xmin,ymax]];
      let hatchlines = poly.hyperspacePolygonDouble(box, 2.6, -1, centerOffset);
      let linesFromDashes = [];
      hatchlines.forEach(l => {
        let nr = random.rangeFloor(4, 17);
        let segments = [...new Array(nr)].map(()=> random.range(0.001, 10000));
        let dashes = poly.dashLine(l, segments);
        let blank = false;
        
        // dashes.forEach(d => { 
        //   if (!blank) { linesFromDashes.push(d);}
        //   blank = !blank;
        // });
        linesFromDashes.push(l);
        
        //paths.push(drawLine(l));
      });
      //debugger;
      let linesAfterHatch = [];
      hatchlines.forEach(l => {
        // ints = start, intersections with circles, end
        let ints = [];
       // if (l[1][0] < l[0][0]) { ints.push(l[0]); }
        //else { ints.push(l[0]);}
        ints.push(l[0]); // add start
        let eq = poly.lineEquationFromPoints(l[0],l[1]);

        // find all intersections with circles
        circles.forEach((circle) => {
          //debugger;
          let int = poly.findCircleLineIntersectionsWithY(circle.r+1, circle.c[0], circle.c[1], eq.m, eq.n);
          // if (poly.pointIsInCircle(l[0], circle.c, circle.r)) {  
          //   ints.shift();
          // }
          // if (poly.pointIsInCircle(l[1], circle.c, circle.r)) {  
          //   ints.pop();
          // }
          if (int.length > 0) {
            ints.push(...int);
          }
        });
        //if (l[1][0] > l[0][0]) { ints.push(l[1]); }
        ints.push(l[1]); //add end
        ints.sort((a,b) => a[0] - b[0]); // sort left to right
        for (let index = 0; index < ints.length; index+=2) {
          let ll = [ints[index], ints[index+1]];
          if (!ll[1]) { continue; }
          //background.push(drawLine(ll));
          linesAfterHatch.push(ll);
        }
        //background.push(drawLine(l));
      });
      let center = [origin[0]+w/2 + centerOffset[0], origin[1]+h/2 + centerOffset[1]];
      let backLayer = false;
      linesAfterHatch.forEach(l => {
        

        let nr = random.rangeFloor(2, 20);
        let segments = [...new Array(nr)].map(()=> random.range(1, 25));
        let dashes = poly.dashLine(l, segments);
        let blank = false;
        
        
        dashes.forEach(d => { 
          if (poly.pointIsInCircle(d[0], center, 29)) { return;}
          if (poly.pointIsInCircle(d[1], center, 12)) { return;}
          if(d[0][1] === d[1][1]) { return; }
          if (!blank) { 
            if(backLayer){background1.push(drawLine(d));}
            else {background2.push(drawLine(d));}
          }
          blank = !blank;
        });
        backLayer = !backLayer;
      });
    };

    let options = {1:"few", 2:"few", 3:"few", 4:"few"};

    postcards.drawQuad(draw, width, height, options);

    return renderGroups([paths1, paths2, background1, background2], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);