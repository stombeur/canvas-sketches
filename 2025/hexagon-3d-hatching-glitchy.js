const canvasSketch = require('canvas-sketch');
const { renderGroupsWithText } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
const { createLinePath } = require('../utils/paths.js');
const postcards = require('../utils/postcards.js');
const { hexagon } = require('./hexagon.js');
const { polyline } = require('../utils/polyline.js');


const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};
let postcardrows = 2;
let postcardcolumns = 4;
let lineWidth = 0.1;
let noiseFactor = 0.8;
// grid settings
let margin = 7;//Math.max (30/(Math.max(postcardcolumns, postcardrows)), 10);
let columns = 5;
let rows = 21;


let pathsPerCard = [];
let pathsPerCard2 = [];

const createGrid = (columns, rows, card, noiseFactor = 1) => {
  const widthFactor = Math.cos(30 * Math.PI / 180)
  const countX = columns;
  const elementWidth = (card.width-2*card.margin) / countX;
  const elementHeight = elementWidth / widthFactor;

  const countY = rows;
  
  const offsetLeft = card.left + (card.width - elementWidth*(countX-0.5))/2
  const offsetTop = card.top + (card.height - elementHeight*(countY/1.5))/3

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
        position,
        noise,
      });
    }
    grid.push(points);
  }
  return grid;
};

const findConnectingLineIndex = (line, lines) =>{
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

    let cards = postcards.prepareColumnsRowsPortrait(width, height, postcardcolumns, postcardrows);
   
    cards.forEach(card => {
        random.setSeed(card.seed);
        card.margin = margin
        card.grid = createGrid(columns, rows, card, noiseFactor)
      })

      
    
  return ({ context, width, height, units }) => {
    // do drawing stuff here
    pathsPerCard = [];
    pathsPerCard2 = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let cardPaths = [];
      let card = cards.find(c => c.index === opts.index);
      random.setSeed(card.seed);

      let grid = card.grid
      const elementWidth = (card.width-2*margin) / columns;
      const elementHeight = elementWidth / Math.cos(30 * Math.PI / 180);

      let outsidelines = [];
      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const element = col[r];
          
          let x = element.position[0];
          let y = element.position[1];

          let h = new hexagon([x,y], elementHeight/2);
      
          h.getOutsideLines(r, c, rows, columns).forEach(l => outsidelines.push(createLinePath(l)));
          //h.hatch3dFaces(5).forEach(l => cardPaths.push(createLinePath(l)));
          element.lines = h.hatch3dFaces(5)
        }
      }
      pathsPerCard2.push(outsidelines);

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const element = col[r];
          
          let lines = element.lines;
          let f = Math.floor(element.noise * 20) * 2

          for (let i = 0; i < f; i++) {
            let i1 = random.rangeFloor(0, lines.length);
            let l1 = lines[i1];
            let otherlines = lines.toSpliced(i1, 1);
            let i2 = findConnectingLineIndex(l1, otherlines);
      
            if (i2 > -1) {
              lines = otherlines.toSpliced(i2, 1);
            }

            if (r>0) {
              //check left
              let left = col[r-1];
              let j = findConnectingLineIndex(l1, left.lines);
              if (j > -1) {
                left.lines = left.lines.toSpliced(j, 1);
              }
            }
            if (r<col.length-1) {
              //check right
              let right = col[r+1];
              let j = findConnectingLineIndex(l1, right.lines);
              if (j > -1) {
                right.lines = right.lines.toSpliced(j, 1);
              }
            }
            if (c>0) {
              //check top
              let top = grid[c-1][r];
              let j = findConnectingLineIndex(l1, top.lines);
              if (j > -1) {
                top.lines = top.lines.toSpliced(j, 1);
              }
            }
            if (c<grid.length-1) {
              //check bottom
              let bottom = grid[c+1][r];
              let j = findConnectingLineIndex(l1, bottom.lines);
              if (j > -1) {
                bottom.lines = bottom.lines.toSpliced(j, 1);
              }
            }
          }
          
          element.lines = lines;
        }


      }

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          const element = col[r];
          
          let lines = element.lines;
          let f = Math.floor(element.noise * 20)

          for (let i = 0; i < f; i++) {
            let i1 = random.rangeFloor(0, lines.length);
            let l1 = lines[i1];
            let otherlines = lines.toSpliced(i1, 1);
            let i2 = findConnectingLineIndex(l1, otherlines);
      
            if (i2 > -1) {
              let l1a = new polyline(l1).copy().move([elementWidth/10,0]).points
              element.lines.push(l1a)
              let l1b = new polyline(lines[i2]).copy().move([elementWidth/10,0]).points
              element.lines.push(l1b)
            }

            if (r>0) {
              //check left
              let left = col[r-1];
              let j = findConnectingLineIndex(l1, left.lines);
              if (j > -1) {
                let l1a = new polyline(left.lines[j]).copy().move([elementWidth/10,0]).points
                element.lines.push(l1a)
              }
            }
            if (r<col.length-1) {
              //check right
              let right = col[r+1];
              let j = findConnectingLineIndex(l1, right.lines);
              if (j > -1) {
                let l1a = new polyline(right.lines[j]).copy().move([elementWidth/10,0]).points
                element.lines.push(l1a)
              }
            }
            if (c>0) {
              //check top
              let top = grid[c-1][r];
              let j = findConnectingLineIndex(l1, top.lines);
              if (j > -1) {
                let l1a = new polyline(top.lines[j]).copy().move([elementWidth/10,0]).points
                element.lines.push(l1a)
              }
            }
            if (c<grid.length-1) {
              //check bottom
              let bottom = grid[c+1][r];
              let j = findConnectingLineIndex(l1, bottom.lines);
              if (j > -1) {
                let l1a = new polyline(bottom.lines[j]).copy().move([elementWidth/10,0]).points
                element.lines.push(l1a)
              }
            }
          }
        }


      }

      for (let c = 0; c < grid.length; c++) {
        const col = grid[c];
        for (let r = 0; r < col.length; r++) {
          col[r].lines.forEach(l => cardPaths.push(createLinePath(l)));
        }
      }

      pathsPerCard.push(cardPaths);
    }

    console.log(pathsPerCard, pathsPerCard2)

    postcards.drawColumnsRowsLandscape(draw, width, height, postcardcolumns, postcardrows);
    let cutlinesPerCard = postcards.drawSeparateLayerCutlines(width, height, postcardrows, postcardcolumns);
    let text1 = postcards.addSeedText(width, height, postcardcolumns, postcardrows, {seeds: cards.map(c => c.seed)})

    let groups = [...cutlinesPerCard, ...pathsPerCard, ...pathsPerCard2];

    let groupnames = [];
    cutlinesPerCard.forEach((p, i) => groupnames.push(`${i} cutlines`))
    let j = groupnames.length;
    pathsPerCard.forEach((p, i) => groupnames.push(`${i+j} card`))
    j = groupnames.length;
    pathsPerCard2.forEach((p, i) => groupnames.push(`${i+j} card thick`))
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