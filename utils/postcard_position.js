const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath, renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('./arc.js');
const { createLinePath, createArcPath, createPolylinePath, createCirclePath } = require('./paths.js');
const poly = require('./poly.js');
const postcards = require('./postcards.js');
const rnd2 = require('./random.js');
const { point } = require('./point.js');
const { polyline } = require('./polyline.js');

import { boundingbox } from './boundingbox.js';
import { hatch } from './hatch.js';
//import { DoubleCross, DoubleCross2, DoubleCrossBorder, EquilateralTriangle, RectangularBorder, SymmetricCross } from '../shape.js';
import { insetPolygon } from './polygon.js';
import { clipregion } from './clipregion.js';
import { randomLineInBB } from './line.js';
import { addTextToCanvas } from './text.js';

// TEMPLATE: canvas-sketch settings
let canvas_sketch_settings = {
  dimensions: [ 270, 410 ],//'A4', //
  orientation: 'portrait', //portrait, landscape
  pixelsPerInch: 300,
  units: 'mm',
};

// CHANGE BELOW: this drawing's settings
const mysettings = {
  //seedvalues: ["253602","324723","491265","993640"], // set fixed seedvalues here
  postcardrows: 3,
  postcardcolumns: 6,
  nrofsplitlines: 5,
  spreaddivider: 57,
  inset: true,
  insetamount: 0.09,
  splitpathspercard: true,
  paths: {
    normal: [],
    shadow: [],
  },
  heightratio: 3/5,
  widthratio: 6/7, //3/5
  text: [],
}

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

    let bb_h = height/2 * mysettings.heightratio;
    let bb_w = width/2 * mysettings.widthratio;

    let step_x = bb_w / (mysettings.postcardcolumns);
    let step_y = bb_h / (mysettings.postcardrows);

    let margin_left = (width - bb_w) / 2;
    let margin_top = (height/2 - bb_h) / 2;

    let bb = boundingbox.fromTopleft([origin[0]+margin_left, origin[1]+margin_top], bb_w, bb_h);
    bb.lines.forEach(l => {
        paths.push(createLinePath(l));
    });

    for (let i = 1; i < mysettings.postcardcolumns; i++) {
        let x = origin[0] + margin_left + step_x * i;
        paths.push(createLinePath([[x, origin[1]+margin_top], [x, origin[1]+margin_top+bb_h]]));
    }
    for (let i = 1; i < mysettings.postcardrows; i++) {
        let y = origin[1] + margin_top + step_y * i;
        let line = [[origin[0]+margin_left, y], [origin[0]+margin_left+bb_w, y]];
        paths.push(createLinePath(line));
    }

    let pos = card.index + 1;
    let row = Math.ceil(pos / mysettings.postcardcolumns);
    let column = pos - (row-1) * mysettings.postcardcolumns;
    let reversecolumn = mysettings.postcardcolumns - column + 1;
    let topleft_x = origin[0]+margin_left+(reversecolumn-1)*step_x;
    let topleft_y = origin[1]+margin_top+(row-1)*step_y;
    let bb_hatch = boundingbox.fromTopleft([topleft_x, topleft_y], step_x, step_y);
    hatch.inside(bb_hatch.points, 30, 0.8)?.forEach(l => {
        pathsDropShadow.push(createLinePath(l));
    });

    mysettings.text.push(addTextToCanvas(`${card.index + 1}/${mysettings.postcardcolumns*mysettings.postcardrows}`, [origin[0]+1, origin[1]+4]));
    mysettings.text.push(addTextToCanvas("www.instagram.com/stephanetombeur", [origin[0]+1, (height*row)-7], {fontsize:2}));

    mysettings.text.push(addTextToCanvas("digitale generatieve kunst", [origin[0]+1, (height*row)-4], {fontsize:2}));
    mysettings.text.push(addTextToCanvas("inkt op encyclopediepapier", [origin[0]+1, (height*row)-1], {fontsize:2}));
    mysettings.text.push(addTextToCanvas("a million", [origin[0]+5, (height*(row-1)+height/1.8)], {fontsize: 4, fontstyle: "italic", fontweight: "bold"}));
    mysettings.text.push(addTextToCanvas("little pieces", [origin[0]+5, (height*(row-1)+height/1.8)+5], {fontsize: 4, fontstyle: "italic", fontweight: "bold"}));
    mysettings.text.push(addTextToCanvas("remember", [origin[0]+5, (height*(row-1)+height/1.8)+10], {fontsize: 4, fontstyle: "italic", fontweight: "bold"}));
    mysettings.text.push(addTextToCanvas("being", [origin[0]+5, (height*(row-1)+height/1.8)+15], {fontsize: 4, fontstyle: "italic", fontweight: "bold"}));
    mysettings.text.push(addTextToCanvas("part of a whole", [origin[0]+5, (height*(row-1)+height/1.8)+20], {fontsize: 4, fontstyle: "italic", fontweight: "bold"}));

}

const sketch = ({ width, height }) => {
    // TEMPLATE: for non-card related randomness, take the first seed
    random.setSeed(cards[0].seed);

    // CHANGE BELOW: general, non-card-specific preparations go here
    let nroflines = mysettings.nrofsplitlines;
    let center = [width/2, height/2];
    let all_spreads = [cards[0].width/75, cards[0].width/75, cards[0].width/30, cards[0].width/75, cards[0].width/50, cards[0].width/50, cards[0].width/50, cards[0].width/30];
    let all_lines_bb = boundingbox.fromWH(center, width*12/10, height*12/10);
    let all_lines = Array.from(Array(nroflines)).map(x => { return {line: randomLineInBB([all_lines_bb.left, all_lines_bb.top], all_lines_bb.right-all_lines_bb.left, all_lines_bb.bottom-all_lines_bb.top), spread: random.pick(all_spreads)}});

    
    // TEMPLATE: card-specific preparations go here
    for (let i = 0; i < cards.length; i++) {
        // TEMPLATE: use this card's seed
        let card = cards[i];
        random.setSeed(cards[i].seed);
    

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
    //const seed_text = postcards.addSeedText(width, height, mysettings.postcardcolumns, mysettings.postcardrows, {seeds: cards.map(c => c.seed), offset: 0.5})
  

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
    return renderGroupsWithText(layers, mysettings.text, {
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
