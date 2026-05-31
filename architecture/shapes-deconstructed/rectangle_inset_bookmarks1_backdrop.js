const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath, renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { arc } = require('../../utils/arc.js');
const { createLinePath, createArcPath, createPolylinePath, createCirclePath } = require('../../utils/paths.js');
const poly = require('../../utils/poly.js');
const postcards = require('../../utils/postcards.js');
const rnd2 = require('../../utils/random.js');
const { point } = require('../../utils/point.js');
const { polyline } = require('../../utils/polyline.js');

import { boundingbox } from '../../utils/boundingbox.js';
import { hatch } from '../../utils/hatch.js';
//import { DoubleCross, DoubleCross2, DoubleCrossBorder, EquilateralTriangle, RectangularBorder, SymmetricCross } from '../shape.js';
import { insetPolygon } from '../../utils/polygon.js';
import { clipregion } from '../../utils/clipregion.js';
import { randomLineInBB } from '../../utils/line.js';

// TEMPLATE: canvas-sketch settings
let canvas_sketch_settings = {
  dimensions: [ 270, 410 ],
  orientation: 'portrait', //portrait, landscape
  pixelsPerInch: 300,
  units: 'mm',
};

const drawShape = (card, options) => {  
    // CHANGE BELOW
    // draw per card and push lines into paths

    let origin = card.origin;
    let width = card.width;
    let height = card.height;

    let margin = 4

    let sc = new clipregion();
    let bb = boundingbox.fromTopleft([origin[0]+margin, origin[1]+margin], width-margin*2, height-margin*2);
    sc.addRegion(bb.points);

    let sc_clip_split = sc;

    if (card.lines.length === 0) {
      sc_clip_split = sc_clip_split.translate(-5,-3)
    } else {
      if (options.inset) {
        card.lines.forEach(l => {
          sc_clip_split = sc_clip_split.splitNoJoin(l.line, card.lines_bb);
        });
        let shapes = sc_clip_split.regions;
        let sc_clip_inset = new clipregion();
        shapes.forEach(shape => {
          let insetshape = insetPolygon(shape.map(p => { return {x: p[0], y: p[1]}}), options.insetamount);
          insetshape = insetshape.map(p => [p.x, p.y]);
          sc_clip_inset.addRegion(insetshape);
        });
        sc_clip_split = sc_clip_inset;
      } else {
        for (let i = 0; i < card.lines.length; i++) {
          let tempsplit = sc_clip_split.split(card.lines[i].line, card.lines_bb, card.spreads[i]);
          //check if tempsplit goes outside of the card, if it does, ignore the split
          let outside = false;
          tempsplit.regions.forEach(r => {
            r.forEach(p => {
              if (p[0] < card.lines_bb.left || p[0] > card.lines_bb.right || p[1] < card.lines_bb.top || p[1] > card.lines_bb.bottom) {
                outside = true;
              }
            })
          });
          if (!outside) { 
          sc_clip_split = tempsplit;
        } else {

          console.log("iteration out of bounds: ", i);
          break;
        }
      }
      }
    }

    let hatchregions = sc.subtract(sc_clip_split);
    
    sc_clip_split.toLines().forEach(l => {
        options.paths.normal.push(createLinePath(l));
    });
   

    for (let i = 0; i < hatchregions.regions.length; i++) {
      const region = hatchregions.regions[i];
      const otherRegions = hatchregions.regions.slice();
      otherRegions.splice(i,1);
      
      hatch.inside(region, 30, 0.8, otherRegions)?.forEach(l => {
        options.paths.shadow.push(createLinePath(l));
      });
    }
}

const sketch = ({ width, height }) => {
  // CHANGE BELOW: this drawing's settings
  const mysettings = {
      seedvalues: ["259883"], // set fixed seedvalues here
      postcardrows: 1,
      postcardcolumns: 1,
      nrofsplitlines: 67,
      spreaddivider: 57,
      inset: true,
      insetamount: 0.05,
      splitpathspercard: false,
      paths: {
        normal: [],
        shadow: [],
      },
      resetPaths: () => {
        mysettings.paths.normal = [];
        mysettings.paths.shadow = [];
      }
    }

    // TEMPLATE: prepare the cards and their random seeds
    let cards = postcards.prepareCards(mysettings.postcardcolumns, mysettings.postcardrows, {"seedvalues":mysettings.seedvalues});
    // TEMPLATE: add a suffix to the exported file name based on the seeds used for this drawing
    canvas_sketch_settings.suffix = cards.map(c => c.seed).join('-');
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


        // CHANGE BELOW card specific preparations go here
        //let spreads = all_spreads;//[card.width/75, card.width/75, card.width/30, card.width/75, card.width/50, card.width/50, card.width/50, card.width/30];
        card.lines_bb = all_lines_bb;//boundingbox.fromWH(card.center, card.width*9.5/10, card.height*9.5/10);
        card.spreads = all_spreads;//Array.from(Array(nroflines)).map(i => random.value()*card.width/mysettings.spreaddivider);
        card.lines = all_lines;//Array.from(Array(nroflines)).map(x => { return {line: randomLine([card.lines_bb.left, card.lines_bb.top], card.lines_bb.right-card.lines_bb.left, card.lines_bb.bottom-card.lines_bb.top), spread: random.pick(spreads)}});
    } 
    
  return ({ context, width, height, units }) => {
    // TEMPLATE: set up the background
    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);
    // reset the paths for this render
    mysettings.resetPaths();
    
    // TEMPLATE: general draw function
    const draw = (card) => {
        // CHANGE BELOW: call the card-specific drawing function
        // if (mysettings.splitpathspercard) {
        //     const p1 = [];
        //     const p2 = [];
        //     drawShape(card, mysettings);
        //     mysettings.paths.normal.push(p1);
        //     mysettings.paths.shadow.push(p2);
        // } else {
            drawShape(card, mysettings);
        // }
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
