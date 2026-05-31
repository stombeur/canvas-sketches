const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath, renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../utils/arc.js');
const { createLinePath, createArcPath, createPolylinePath, createCirclePath, createFilledCirclePath } = require('../utils/paths.js');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards.js');
const rnd2 = require('../utils/random.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
const { lerp } = require('canvas-sketch-util/math');

// TEMPLATE: canvas-sketch settings
let canvas_sketch_settings = {
  dimensions: 'A4', //[ 2048, 2048 ]
  orientation: 'portrait', //portrait, landscape
  pixelsPerInch: 300,
  units: 'mm',
};

// CHANGE BELOW: this drawing's settings
const mysettings = {
  //seedvalues: ["253602","324723","491265","993640"], // set fixed seedvalues here
  postcardrows: 1,
  postcardcolumns: 1,
  nrofsplitlines: 5,
  spreaddivider: 57,
  inset: true,
  insetamount: 0.09,
  splitpathspercard: true,
  paths: {
    normal: [],
    shadow: [],
  }
}

const createGrid = (countX, countY, noiseFactor = 0.030) => {
    const points = [];
    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
        const noise = random.noise2D(u,v, 1.5, 1);
        const radius = Math.abs(noise) * noiseFactor;

        points.push({ radius: Math.abs(radius),
                      position,
                      rotation: random.noise2D(u,v)
                    });
      }
    }
    return points;
};

// TEMPLATE: prepare the cards and their random seeds
let cards = postcards.prepareCards(mysettings.postcardcolumns, mysettings.postcardrows, {"seedvalues":mysettings.seedvalues});
// TEMPLATE: add a suffix to the exported file name based on the seeds used for this drawing
canvas_sketch_settings.suffix = cards.map(c => c.seed).join('-');

const drawShape = (card, paths, pathsDropShadow) => {  
    // CHANGE BELOW
    // draw per card and push lines into paths

    let origin = card.origin;
    let width = card.width;
    let height = card.height;

    let margin = 25;
    let marginLeft = margin;
    let marginRight = margin;
    let marginTop = margin;
    let marginBottom = margin;
  
    let j = 30;
    let points = createGrid(j,j, 1);
    let rightTopcorner = points[j-1];
    let rotationPoint = [lerp(width - marginRight, marginLeft, rightTopcorner.position[0]), lerp(width, marginTop,  rightTopcorner.position[1])];
    let angle = -1;

    points.forEach(data => {
      const {
        position,
        radius,
        rotation
      } = data;
      const x = lerp(marginLeft, width - marginRight, position[0]);
      const y = lerp(marginTop, width, position[1]);

      let circleRadius = 2 * radius;
      let penWidth = 0.8;
      let altPoint = new point(x,y).rotate(rotationPoint, angle);

      for (let r = circleRadius; r > 0; r -= penWidth) {
        paths.push(createCirclePath([x,y], r, true));
        pathsDropShadow.push(createCirclePath(altPoint, r, true));
      } 
      
  });
}

const sketch = ({ width, height }) => {
    // TEMPLATE: for non-card related randomness, take the first seed
    random.setSeed(cards[0].seed);

    // CHANGE BELOW: general, non-card-specific preparations go here

    
    // TEMPLATE: card-specific preparations go here
    for (let i = 0; i < cards.length; i++) {
        // TEMPLATE: use this card's seed
        let card = cards[i];
        random.setSeed(cards[i].seed);


        // CHANGE BELOW

     } 
    
  return ({ context, width, height, units }) => {
    // TEMPLATE: set up the background
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);
    // reset the paths for this render
    mysettings.paths.normal = [];
    mysettings.paths.shadow = [];
    
    // TEMPLATE: general draw function
    const draw = (card) => {
        // CHANGE BELOW: call the card-specific drawing function
        if (mysettings.splitpathspercard) {
            const p1 = [];
            const p2 = [];
            drawShape(card, p1, p2);
            mysettings.paths.normal.push(p1);
            mysettings.paths.shadow.push(p2);
        } else {
            drawShape(card, mysettings.paths.normal, mysettings.paths.shadow);
        }
    }

    // TEMPLATE: this draws all the cards
    postcards.drawCards(draw, width, height, mysettings.postcardcolumns, mysettings.postcardrows, cards);
    // TEMPLATE: add cutlines to end
    let cutlines = postcards.drawCutlines(width, height, mysettings.postcardrows, mysettings.postcardcolumns);
    const seed_text = postcards.addSeedText(width, height, mysettings.postcardcolumns, mysettings.postcardrows, {seeds: cards.map(c => c.seed), offset: 0.5})
  
    // TEMPLATE: name the layers based on the keys in mysettings.paths
    let layers = Object.keys(mysettings.paths).flatMap(k => {
        return mysettings.splitpathspercard ? mysettings.paths[k] : [mysettings.paths[k]];
    });
    let layernames = Object.keys(mysettings.paths).flatMap((k,i) => {
        return mysettings.splitpathspercard ? mysettings.paths[k].map((_, j) => `${i+1}-${k}-${j+1}`) : `${i+1}-${k}`;
    });

    // TEMPLATE: add cutlines as a separate layer at the end
    layers.push(cutlines);
    layernames.push('9999-cutlines');
    

    // TEMPLATE: render the paths with layer names and seed text
    return renderGroupsWithText(layers, seed_text, {
      context, width, height, units, groupnames: layernames, optimize : {
        sort: true,
        merge: true,
        removeDuplicates: true,
        removeCollinear: true
      }
    });
  };
};

// TEMPLATE: send to canvas-sketch for rendering
canvasSketch(sketch, canvas_sketch_settings);
