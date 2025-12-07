const canvasSketch = require('canvas-sketch');
const { renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { lerp } = require('canvas-sketch-util/math');
const { arc } = require('../utils/arc.js');
const { createLinePath, createCirclePath, createPolylinePath } = require('../utils/paths.js');
const postcards = require('../utils/postcards.js');
const { point } = require('../utils/point.js');
const { polyline } = require('../utils/polyline.js');
const { square } = require('./square.js');
const { hexagon } = require('./hexagon.js');
import { OutlineSphere } from "@lnjs/core";
import { create2dClassicGrid, create2dLerpedGrid } from "../utils/grid.js";
import {hatch } from "../utils/hatch.js";
const snake = require('../utils/snakefill.js');

const settings = {
  suffix: random.getSeed(),
  dimensions: [ 180, 140 ], //'A4',//[ 2048, 2048 ]
  orientation: 'landscape',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};
let postcardrows = 1;
let postcardcolumns = 3;
let lineWidth = 0.1;
let noiseFactor = 0.8;
// grid settings
let margin = 9;//Math.max (30/(Math.max(postcardcolumns, postcardrows)), 10);
let columns = 5;
let rows = 18;
let hashing = 4;
let glitchmove = hashing * 2;
let outlineonly = false;
let invert = true;

let hatchPathsPerCard = [];
let outlinePathsPerCard = [];
let seeds = {"seedvalues":["970883","789848","120376"]};

const createGrid = (columns, rows, card, noiseFactor = 1) => {
  const widthFactor = Math.cos(30 * Math.PI / 180)
  const countX = columns;
  const elementWidth = (card.width-2*card.margin) / countX;
  const elementHeight = elementWidth / widthFactor;

  const countY = rows;
  
  const offsetLeft = card.left + (card.width - elementWidth*(countX-0.5))/2
  const offsetTop = card.top + card.margin// card.top + (card.height - elementHeight*(countY/1.5))/2

  let iterations = 33;//Math.floor((rows * columns) / 4);
  //if (iterations > 100) { iterations = Math.floor(iterations / 5); }
  let snakegrid = snake.snakefill(rows, columns, { iterations });

  if (invert) {
    snakegrid = snake.invertsnake(snakegrid);
  }

  const grid = [];
  for (let x = 0; x < countX; x++) {
    const points = [];
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      let posX = offsetLeft + (x * elementWidth)
      if (y%2 === 1) posX = posX + elementWidth/2
      let posY = offsetTop + (y * elementHeight) - y*elementHeight/4
      const position = [ posX, posY ];
      const noise = random.noise2D(u,v) * noiseFactor;
      points.push({
        snake: snakegrid[y][x],
        position,
        noise,
      });
    }
    grid.push(points);
  }

  for (let x = 0; x < countX; x++) {
    for (let y = 0; y < countY; y++) {
      let e = grid[x][y];

      // clockwise from top point (topright and on until topleft)
      let firstrow = y === 0;
      let lastrow = y === countY-1;
      let evenrow = y % 2 === 1;
      let oddrow = y % 2 === 0;
      let firstcol = x === 0;
      let lastcol = x === countX-1;

      let topright = firstrow || (evenrow && lastcol) || (!firstrow && ((oddrow && grid[x][y-1].snake === 0) || (evenrow && grid[x+1][y-1].snake === 0)))
      let right = lastcol || grid[x+1][y].snake === 0;
      let bottomright = lastrow || (evenrow && lastcol) || (!lastrow && ((oddrow && grid[x][y+1].snake === 0)||(evenrow && grid[x+1][y+1].snake === 0)));
      let bottomleft = lastrow || (oddrow && firstcol) || (!lastrow && ((evenrow && grid[x][y+1].snake === 0) || (oddrow && grid[x-1][y+1].snake === 0)));
      let left = firstcol || grid[x-1][y].snake === 0;
      let topleft = firstrow  || (oddrow && firstcol) || (!firstrow && ((evenrow && grid[x][y-1].snake === 0) || (oddrow && grid[x-1][y-1].snake === 0)));

      e.borders = { topright, right, bottomright, bottomleft, left, topleft };
      
    }
  }

  return grid;
};

const findConnectingLineIndex = (line, lines) =>{
  if (!line || !lines) { return -1;}

  return lines.findIndex(
    l => 
      { 
        
        let result = pointsAreEqual(l[0], line[0]) || pointsAreEqual(l[1], line[0]) || pointsAreEqual(l[0], line[1]) || pointsAreEqual(l[1], line[1]);
        //console.log('check',lines, l, line, result)
        return result;
      }
  );
}

const pointsAreEqual = (a, b) => {
  // x1 = x2 and y1 = y2
  return a[0] === b[0] && a[1] ===b[1];
}

const sketch = ({ width, height }) => {
    // do random stuff here

    let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardcolumns, postcardrows, seeds);
   
    cards.forEach(card => {
        random.setSeed(card.seed);
        card.margin = margin
        card.grid = createGrid(columns, rows, card, noiseFactor)
      })

      
    
  return ({ context, width, height, units }) => {
    // do drawing stuff here
    hatchPathsPerCard = [];
    outlinePathsPerCard = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let cardPaths = [];
      let outlinePaths = [];
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let grid = card.grid
      const elementWidth = (card.width-2*margin) / columns;
      const elementHeight = elementWidth / Math.cos(30 * Math.PI / 180);

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const row = col[r];
          
          let x = row.position[0];
          let y = row.position[1];

          let h = new hexagon([x,y], elementHeight/2);
      
          
          if (row.snake > 0) { 
            h.getOutsideLinesPredefined(row.borders).forEach(l => outlinePaths.push(createLinePath(l)));
            //h.hatch3dFaces(5).forEach(l => cardPaths.push(createLinePath(l)));
            row.lines = h.hatch3dFaces(hashing);
          }
          
        }
      }

      if (!outlineonly) {
      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const element = col[r];
          
          let lines = element.lines;
          if (!lines) { continue;}
          let f = Math.abs(Math.floor(element.noise * 5));

          if (!invert) {
            for (let i = 0; i < f; i++) {
              let addOrRemove = random.pick(['remove', 'remove', 'add']);

              let i1 = random.rangeFloor(0, lines.length);
              let l1 = lines[i1];
              let otherlines = lines.toSpliced(i1, 1);
              let i2 = findConnectingLineIndex(l1, otherlines);
        
              if (i2 > -1) {
                if (addOrRemove === 'remove') {
                  lines = otherlines.toSpliced(i2, 1);
                }
                if (addOrRemove === 'add') {
                  let l1a = new polyline(l1).copy().move([elementWidth/glitchmove,0]).points
                  lines.push(l1a)
                  let l1b = new polyline(lines[i2]).copy().move([elementWidth/glitchmove,0]).points
                  lines.push(l1b)
                }
              }

              if (r>0) {
                //check left
                let left = col[r-1];
                if (left.lines) {
                  let j = findConnectingLineIndex(l1, left.lines);
                  if (j > -1) {
                    if (addOrRemove === 'remove') {
                        left.lines = left.lines.toSpliced(j, 1);
                    }
                    if (addOrRemove === 'add') {
                        let l1a = new polyline(left.lines[j]).copy().move([elementWidth/glitchmove,0]).points
                        lines.push(l1a)
                    }
                  }
                }
              }
              if (r<col.length-1) {
                //check right
                let right = col[r+1];
                if (right.lines) {
                  let j = findConnectingLineIndex(l1, right.lines);
                  if (j > -1) {
                    if (addOrRemove === 'remove') {
                        right.lines = right.lines.toSpliced(j, 1);
                    }
                    if (addOrRemove === 'add') {
                      let l1a = new polyline(right.lines[j]).copy().move([elementWidth/glitchmove,0]).points
                      lines.push(l1a)
                    }
                  }
                }
              }
              if (c>0) {
                //check top
                let top = grid[c-1][r];
                if (top.lines) {
                  let j = findConnectingLineIndex(l1, top.lines);
                  if (j > -1) {
                    if (addOrRemove === 'remove') {
                      top.lines = top.lines.toSpliced(j, 1);
                    }
                    if (addOrRemove === 'add') {
                      let l1a = new polyline(top.lines[j]).copy().move([elementWidth/glitchmove,0]).points;
                      lines.push(l1a);
                    }
                  }
                }
                
              }
              if (c<grid.length-1) {
                //check bottom
                let bottom = grid[c+1][r];
                if (bottom.lines) {
                  let j = findConnectingLineIndex(l1, bottom.lines);
                  if (j > -1) {
                    if (addOrRemove === 'remove') {
                      bottom.lines = bottom.lines.toSpliced(j, 1);
                    }
                    if (addOrRemove === 'add') {
                      let l1a = new polyline(bottom.lines[j]).copy().move([elementWidth/glitchmove,0]).points;
                      lines.push(l1a);
                    }
                  }
                }
                
              }
            }
          }

          element.lines = lines;
        }
      
      }

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          if (!col[r].lines) {continue}
          col[r].lines.forEach(l => cardPaths.push(createLinePath(l)));
        }
      }

    }
      hatchPathsPerCard.push(cardPaths);
      outlinePathsPerCard.push(outlinePaths);
    }

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...hatchPathsPerCard, ...outlinePathsPerCard];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
    let j = groupnames.length;
    hatchPathsPerCard.forEach((p, i) => groupnames.push(`${i+j} hatches`))
    j = groupnames.length;
    outlinePathsPerCard.forEach((p, i) => groupnames.push(`${i+j} outside`))
    console.log(groupnames)

    return renderGroupsWithText(groups, text1, {
      context, width, height, units, groupnames, lineWidth, optimize : {
        sort: true,
        merge: true,
        removeDuplicates: true,
        removeCollinear: true
      }
    });
  };
};

canvasSketch(sketch, settings);