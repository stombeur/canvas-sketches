const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createLinePath, createArcPath, createCirclePath } = require('../utils/paths.js');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards.js');
const rnd2 = require('../utils/random.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
import { boundingbox } from '../utils/boundingbox.js';
import { clipregion } from '../utils/clipregion.js';
import { hatch } from '../utils/hatch.js';
import { createMeanderRegion, linesObject } from './lines.js';
import { polylineToBox } from './lines.js';

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
  postcardrows: 1,
  postcardcolumns: 1,
};

const splitLine = (p1, p2, divideBy) => {
  if (!p1.x) { p1 = new point(p1[0], p1[1]); }
  if (!p2.x) { p2 = new point(p2[0], p2[1]); }
  let {m,n} = poly.lineEquationFromPoints(p1, p2);

  let delta_x = p2.x - p1.x;
  let delta_y = p2.y - p1.y;

  let y_fixed = delta_y === 0;
  let x_fixed = delta_x === 0;

  let result = [p1];

  // horizontal line
  if (y_fixed) {
    let step = delta_x / divideBy;
    for (let i = 1; i < divideBy; i++) {
      let i_x = p1.x + step * i;
      let i_y = p1.y;
      result.push(new point(i_x, i_y));
    }
  }
  // vertical line
  else if (x_fixed) {
    let step = delta_y / divideBy;
    for (let i = 1; i < divideBy; i++) {
      let i_x = p1.x;
      let i_y = p1.y + step * i
      result.push(new point(i_x, i_y));
    }
  }
  // normal case
  else {
    let step = delta_x / divideBy;
    for (let i = 1; i < divideBy; i++) {
      let i_x = p1.x + step * i;
      let i_y = m * i_x + n;
      result.push(new point(i_x, i_y));
    }
  }


  result.push(p2);

  return result;
}

/** 
  * @param {array} lineToSplit = [point, point] 
  * @param {array} intersectingLines = [[point, point], [point, point], ...]
*/
const intersectToPolyline = (lineToSplit, intersectingLines) => {
  let start = lineToSplit[0];
  let end = lineToSplit[1];

  let resultPoints = [start];

  intersectingLines.forEach(l => {
    let intersection = poly.findIntersection(start, end, l[0], l[1]);
    if (intersection) {
      resultPoints.push(new point(intersection.x, intersection.y));
    }
  });

  resultPoints.push(end);

  return new polyline(resultPoints);
}

let thinLines = [];
let thickLines = [];
let constructionLines = [];

const drawShape = (coords, width, height, card, thinLines, thickLines, constructionLines) => {   
    let center = [coords[0]+width/2, coords[1]+ height/2];

    // parameters
    let outer_width = width * 0.8;
    let outer_height = height * 0.8;

    let inner_width = width * 0.7;
    let inner_height = height * 0.5;

    let divider = 14;
    let movePctMax = 1.5;
    let rotation_coeff = 35 / divider;
    // parameters

    // output object
    let lines = new linesObject();
    
    // add bounding boxes to drawing
    let page_bb = boundingbox.fromWH(center, width, height);
    let outer_bb = boundingbox.fromWH(center, outer_width, outer_height);
    let inner_bb = boundingbox.fromWH(center, inner_width, inner_height);
    constructionLines.push(inner_bb.toPolyline().toLines());
    constructionLines.push(outer_bb.toPolyline().toLines());


    // calculate vertical dividers between top and bottom horizontal lines
    let points_top = splitLine(inner_bb.points[0], inner_bb.points[1], divider);
    points_top.pop(); // remove last point
    points_top.shift(); // remove first point
    let points_bottom = splitLine(inner_bb.points[2], inner_bb.points[3], divider);
    points_bottom.pop();
    points_bottom.shift();
    points_bottom.reverse(); // reverse order of bottom points to more easily match top points

    points_top.forEach((p, i) => {
      // normal vertical divider
      let start_p = new point(p[0], 0);
      let end_p = new point(points_bottom[i][0], height);

      // move left/right by random pct
      let movePct = movePctMax * Math.random() / 100;
      let moveDir = Math.random() > 0.5 ? 1 : -1;
      let moveDelta = inner_width * movePct * moveDir;
      let moveVector = [moveDelta, 0];

      // create polyline to rotate more easily
      let pline = new polyline([poly.movePoint(start_p, moveVector), poly.movePoint(end_p, moveVector)]);

      // rotate polyline 50pct of the time by random amount
      if (Math.random() > 0.5) {
        let rotation = Math.random() * rotation_coeff;
        pline = pline.rotate(center, rotation);
      }
      
      // store line points
      lines.vertical.push(pline.points);
      //constructionLines.push(createLinePath(pline.points));
    });

    // calculate horizontal dividers between left and right vertical lines
    let points_left = splitLine(inner_bb.points[0], inner_bb.points[3], divider);
    let points_right = splitLine(inner_bb.points[2], inner_bb.points[1], divider);
    points_left.pop(); // see top/bottom points, same operations
    points_left.shift();
    points_right.pop();
    points_right.shift();
    points_right.reverse();

    // less rotation for the horizontal lines
    rotation_coeff = 30 / divider;

    points_left.forEach((p, i) => {
      let start_p = new point(0, p[1]);
      let end_p = new point(width, points_right[i][1]);

      // move up/down by random pct
      let movePct = movePctMax * Math.random() / 100;
      let moveDir = Math.random() > 0.5 ? 1 : -1;
      let moveDelta = inner_height * movePct * moveDir;
      let moveVector = [0, moveDelta];

      // create polyline to rotate more easily
      let pline = new polyline([poly.movePoint(start_p, moveVector), poly.movePoint(end_p, moveVector)]);

      // rotate polyline 50pct of the time by random amount
      if (Math.random() > 0.5) {
        let rotation = Math.random() * rotation_coeff;
        pline = pline.rotate(center, rotation);
      }
      
      // store line points
      lines.horizontal.push(pline.points);
      //constructionLines.push(createLinePath(pline.points));
    });

    // create vertical polylines from the points of the vertical lines
    // but split them at the intersection points with the horizontal lines
    lines.vertical.forEach(l => {
      lines.verticalPolylines.push(intersectToPolyline(l, lines.horizontal));
    });

    // create horizontal polylines from the points of the horizontal lines
    // but split them at the intersection points with the vertical lines
    lines.horizontal.forEach(l => {
      lines.horizontalPolylines.push(intersectToPolyline(l, lines.vertical));
    });

    lines.verticalPolylines.forEach(l => {
       // move a few random points
      let nrOfPointsToMove = l.points.length / 2;
      for (let i = 0; i < nrOfPointsToMove; i++) {
        let p = random.pick(l.points);
        let up = random.pick([1,-1]) * Math.random() * inner_height / divider /5;
        let side = random.pick([1,-1]) * Math.random() * inner_width / divider /5;
        lines.move_point(p, [side, up]);
      }

    });

    lines.horizontalPolylines.forEach(l => {
       // move a few random points 
      let nrOfPointsToMove = l.points.length / 2;
      for (let i = 0; i < nrOfPointsToMove; i++) {
        let p = random.pick(l.points);
         let up = random.pick([1,-1]) * Math.random() * inner_height / divider /5;
        let side = random.pick([1,-1]) * Math.random() * inner_width / divider /5;
        lines.move_point(p, [side, up]);
      }
    });

    // remove a few points from the vertical polylines
    let nrOfPointsToMove = random.rangeFloor(4, lines.verticalPolylines.length);
    for (let i = 0; i < nrOfPointsToMove; i++) {
      let l = lines.verticalPolylines.splice(random.rangeFloor(1, lines.verticalPolylines.length), 1);
      let e =  random.rangeFloor(1, l[0].points.length-1);
      let l1 = l[0].points.slice(0, e-1);
      let l2 = l[0].points.slice(e);
      lines.verticalPolylines.push(new polyline(l1));
      lines.verticalPolylines.push(new polyline(l2));
    }
   
    // remove a few points from the horizontal polylines
    nrOfPointsToMove = random.rangeFloor(4, lines.verticalPolylines.length);
    for (let i = 0; i < nrOfPointsToMove; i++) {
      let l = lines.horizontalPolylines.splice(Math.floor(Math.random()*lines.horizontalPolylines.length), 1);
      let e =  random.rangeFloor(1, l[0].points.length-1);
      let l1 = l[0].points.slice(0, e-1);
      let l2 = l[0].points.slice(e);
      lines.horizontalPolylines.push(new polyline(l1));
      lines.horizontalPolylines.push(new polyline(l2));
    }

    let vertical_box_width = inner_width / divider / 3;
    let horizontal_box_width = inner_height / divider / 3;
    lines.verticalPolylines.forEach(l => {
      // create box left right of the line
      let box = polylineToBox(l, vertical_box_width, false);
      lines.verticalBoxes.push(box);
      // box.toLines().forEach(l => {
      //   constructionLines.push(createLinePath(l));
      // });
    });
    lines.horizontalPolylines.forEach(l => {
      // create box left right of the line
      let box = polylineToBox(l, horizontal_box_width, true);
      lines.horizontalBoxes.push(box);
      // box.toLines().forEach(l => {
      //   constructionLines.push(createLinePath(l));
      // });
    });

    let cp;
    lines.verticalBoxes.forEach(vbox => {
      if (!cp) {
        cp = new clipregion(vbox.points);
      }
      else {
        cp = cp.union(new clipregion(vbox.points));
      }
    });
    lines.horizontalBoxes.forEach(hbox => {
      cp = cp.union(new clipregion(hbox.points));
    });

    let inner_bb_cp = new clipregion(inner_bb.toPolyline().points);
    let result_cp = inner_bb_cp.subtract(cp);

    let outer_river = createMeanderRegion([outer_bb.left,inner_bb.top], outer_width*1.4, outer_height/2, 16, 16);
    result_cp = result_cp.subtract(new clipregion(outer_river));
    let inner_river = createMeanderRegion([outer_bb.left,inner_bb.top], outer_width*1.4, outer_height/2, 16, 10);
    //result_cp = result_cp.union(new clipregion(inner_river));
    

    let sections = divideRandom(0, 360, 17, 0.95);
    let zeropoint = [center[0]  + inner_width/2, center[1]];
    let cityborderpoints = [zeropoint];

    for (let i = 0; i < sections.length -1; i++) {
      const rot = sections[i];
      let pt = new point(...cityborderpoints[i]);
      let rotpt = pt.rotate(center, rot);
      cityborderpoints.push(rotpt);
    }
    
    cityborderpoints.forEach((p, i) => {
      constructionLines.push(createCirclePath(p, 2));
    });

    let cityborder = new clipregion(cityborderpoints);
    result_cp = result_cp.intersect(cityborder);


    let rotate_end = 360 * Math.random();
    result_cp.toLines().forEach(l => {
      let l2 = l.map(p => new point(p[0], p[1]).rotate(center, rotate_end))
      thickLines.push(createLinePath(l2));
    });

    let page_bb_cp = new clipregion(page_bb.toPolyline().points);
    let river_cp = new clipregion(inner_river);
    river_cp = river_cp.intersect(page_bb_cp); ;
    river_cp.toLines().forEach(l => {
      let l2 = l.map(p => new point(p[0], p[1]).rotate(center, rotate_end))
      thickLines.push(createLinePath(l2));
    });
}

const divideRandom = (min, max, divideBy, factor = 0.2) => {
  let result = [];
  let step = (max - min) / divideBy;
  for (let i = 0; i < divideBy; i++) {
    let plusmin = Math.random() > 0.5 ? 1 : -1;
    let factor_random = Math.random() * factor;
    let factor_plusmin = (Math.random() > 0.5 ? 1 : -1) * factor_random;
    let value = step * (1 + factor_plusmin);
    result.push(value);
  }
  result[divideBy-1] = max - result.slice(0, divideBy - 1).reduce((a, b) => a + b, 0);

  return result;
}

const sketch = ({ width, height }) => {

    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.center = center;
      })

    
  return ({ context, width, height, units }) => {
    thinLines = [];
    thickLines = [];
    constructionLines = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let localOrigin = postcards.reorigin([0, 0], origin);

        let card = cards.find(c => c.index === opts.index);
        drawShape(localOrigin, w, h, card, thinLines, thickLines, constructionLines);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, settings.postcardcolumns, settings.postcardrows);
    let cutLines = postcards.drawCutlines(width, height, settings.postcardrows, settings.postcardcolumns);


    return renderGroups([thinLines, thickLines, cutLines], {
      context, width, height, units, groupnames: ['thin', 'normal', 'cutlines', 'construction']
    });
  };
};

canvasSketch(sketch, settings);