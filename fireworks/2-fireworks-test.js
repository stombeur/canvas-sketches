const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createArcPath, createLinePath, createCubicBezierPath, createQuadraticBezierPath, findTangentialControlPoint, createCirclePath } = require('../utils/paths');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');
const rnd2 = require('../utils/random');
const { point } = require('../utils/point');
const { polyline } = require('../utils/polyline.js');
const { boundingbox } = require('../utils/boundingbox.js');


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

let paths_thick = [];
let paths_medium = [];
let paths_thin = [];
let paths_construction = [];

const drawPetal = (_center, delta, factorSide, factorUp, factorDown, rotateCenter = _center, rotateAngle = 0) => {
    let result = [];

    let center = new point(..._center);

    let p1 = center.copy(-delta, 0);
    let p2 = center.copy(delta, 0);

    let d = point.distanceBetween(p1, p2);

    let c1 = p1.copy(-d*factorSide, -d*factorUp);
    let c2 = p2.copy(d*factorSide, -d*factorUp);

    let c3 = new point(...findTangentialControlPoint(c1, p1, d*factorDown));
    let c4 = new point(...findTangentialControlPoint(c2, p2, -d*factorDown));

    let dd = random.value() * 1.4;
    p1.move(0, dd);
    p2.move(0, dd);
    c1.move(0, dd);
    c2.move(0, dd);
    c3.move(0, dd);
    c4.move(0, dd);

    if (rotateAngle !== 0) {
        p1 = p1.rotate(rotateCenter, rotateAngle);
        p2 = p2.rotate(rotateCenter, rotateAngle);
        c1 = c1.rotate(rotateCenter, rotateAngle);
        c2 = c2.rotate(rotateCenter, rotateAngle);
        c3 = c3.rotate(rotateCenter, rotateAngle);
        c4 = c4.rotate(rotateCenter, rotateAngle);
    }


    result.push(createCubicBezierPath(p1, p2, c1, c2));
    result.push(createCubicBezierPath(p1, p2, c3, c4));

    return result;
}

const drawCircle = (center, radius, nrOfPetals, pad, factorSide, factorUp, factorDown, angleStart = 0) => {
    let result = [];
    let circumference = 2 * Math.PI * radius;
    let petalW = (circumference - nrOfPetals*pad) / nrOfPetals;

    for (let i = 0; i < nrOfPetals; i++) {
        result.push(...drawPetal(center.copy(0, -radius), petalW/2, factorSide, factorUp, factorDown, center, angleStart + i * 360 / nrOfPetals))
    }



    return result;
}


const sketch = ({ width, height }) => {
   
    let cards = postcards.prepareColumnsRowsPortrait(width, height, settings.postcardcolumns, settings.postcardrows);
    cards.forEach(card => {
       // do random stuff
    })

    
  return ({ context, width, height, units }) => {
    paths_thick = [];
    paths_medium = [];
    paths_thin = [];
    paths_construction = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
        let card = cards.find(c => c.index === opts.index);
        
        let center = new point(...[w/3, h/3]);
        let p = center.copy(0, -h/3);


        paths_thick.push(...drawCircle(center, w/2, 30, 9, 0.08, 1, 0.35));
        paths_medium.push(...drawCircle(center, w/3.55, 30, 7, 0.001, 1.5, 0.6, 6));
        paths_thin.push(...drawCircle(center, w/5.8, 30, 5, 0.1, 2.5, 1.5, 0));
        paths_thin.push(...drawCircle(center, w/13, 30, 4.4, 0.05, 2.5, 3, 6));

        let outsideborder = boundingbox.fromWH([w/2, h/2], w, h);
        paths_construction.push(...outsideborder.toPolyline().toLines().map(l => createLinePath(l)))
    
    }

    postcards.drawColumnsRowsPortrait(draw, width, height, settings.postcardcolumns, settings.postcardrows);

    return renderGroups([paths_thick, paths_medium, paths_thin, paths_construction], {
      context, width, height, units, groupnames: ['thick', 'medium', 'thin', 'CONSTRUCT']
    });
  };
};

canvasSketch(sketch, settings);