
const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
const poly = require('../utils/poly.js');
const postcards = require('../utils/postcards');

// random.setSeed(random.getRandomSeed());//995935
// console.log(`seed: ${random.getSeed()}`);
// 912597
// 995601

//880711
//995935

const skewFactor = 0.5;

let paths = [];
let hatches = [];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const skew = (point, skew, skewX, skewY) => {
  //return point;

  let result = [point[0], point[1]];
  if (skew < 0.25) {
    result[1] = result[1] - skewY;
  }
  else if (skew >= 0.25 && skew < 0.5) {
    result[0] = result[0] + skewX;
  }
  else if (skew >= 0.5 && skew < 0.75) {
    result[1] = result[1] + skewY;
  }
  else if (skew >= 0.75) {
    result[0] = result[0] - skewX;
  }
  return result;
}

const createGrid = (count, width, height) => {
  const countX = count;
  const countY = Math.floor(countX / width * height);

  const grid = [];
  for (let x = 0; x < countX; x++) {
    const points = [];
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      const position = [ u, v ];
      const noise = random.noise2D(u,v) * 1;//random.gaussian(0.25, 0.28) //
      const positionSkewed = skew(position, noise,  noise / countX * skewFactor, noise / countY * skewFactor);
      points.push({
        position: positionSkewed,
        noise,
        hatch1: noise < 0.87 && noise > 0.57,
        hatch2: noise < 0.44 && noise > 0.32
      });
    }
    grid.push(points);
  }
  return grid;
};

const drawLineOnCanvas = (ctx, line) => {
  let x1 = line[0].x  || line[0][0],
      x2 = line[1].x || line[1][0],
      y1 = line[0].y || line[0][1],
      y2 = line[1].y || line[1][1];

  //console.log({line:[[x1,y1],[x2,y2]]})

  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

const sketch = ({ width, height }) => {


  

  return ({ context, width, height, units }) => {

    const margin = width * 0.05;
    paths = [];
    hatches = [];

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);
  

    const draw = (origin, w, h) => {
      random.setSeed(random.getRandomSeed());
      console.log(`origin: ${origin} seed: ${random.getSeed()}`);
      let grid = createGrid(10, width, height);

      for (let row = 0; row < grid.length; row++) {
        const isLastRow = row === grid.length - 1;

        const o = (p) => {
          return postcards.reorigin(p, origin);
        }
        
        for (let column = 0; column < grid[row].length; column++) {
          const doHatch1 = grid[row][column].hatch1;
          const doHatch2 = grid[row][column].hatch2;
          const isLastColumn = column === grid[row].length - 1;
          const position = grid[row][column].position;
          const x = lerp(margin, w - margin, position[0]);
          const y = lerp(margin, h - margin, position[1]);
          
          let lineRight = null, 
              lineDown = null,
              lineDiagonal = null,
              hatch1 = null,
              hatch2 = null;
          
          if (!isLastColumn) {
            const pointRight = grid[row][column+1].position;
            const x2 = lerp(margin, w - margin, pointRight[0]);
            const y2 = lerp(margin, h - margin, pointRight[1]);
            lineRight = [o([x,y]),o([x2,y2])];
          }
  
          if (!isLastRow) {
            const pointDown = grid[row+1][column].position;
            const x2 = lerp(margin, w - margin, pointDown[0]);
            const y2 = lerp(margin, h - margin, pointDown[1]);
            lineDown = [o([x,y]),o([x2,y2])];
          }
  
          if (!isLastColumn && !isLastRow) {
            const pointRight = grid[row][column+1].position;
            const x2 = lerp(margin, w - margin, pointRight[0]);
            const y2 = lerp(margin, h - margin, pointRight[1]);
            const pointDown = grid[row+1][column].position;
            const x4 = lerp(margin, w - margin, pointDown[0]);
            const y4 = lerp(margin, h - margin, pointDown[1]);
            const pointOpposite = grid[row+1][column+1].position;
            const x3 = lerp(margin, w - margin, pointOpposite[0]);
            const y3 = lerp(margin, h - margin, pointOpposite[1]);
  
            lineDiagonal = [o([x,y]),o([x3,y3])];
            
            // let n1 = grid[row][column].noise,
            //     n2 = grid[row][column+1].noise,
            //     n3 = grid[row+1][column+1].noise,
            //     n4 = grid[row+1][column].noise;
  
            // let noiseBoundary = 1.3;
  
            let n1 = grid[row][column].noise,
                n2 = grid[row][column+1].noise,
                n4 = grid[row+1][column].noise,
                n3 = grid[row+1][column+1].noise;
  
            spacing = 0.8;
            dynspace = 0.7;
  
            //bottom triangle
            if ((n1+n2+n3) > 1) {
              let angle = Math.atan2( y4-y, x4-x ) * 180 / Math.PI;
              let space = dynspace * (n1+n2+n3) * 1.1; //spacing;
              hatch1 = poly.hatchPolygon([o([x,y]),o([x3,y3]),o([x2,y2]),o([x,y])], angle, space, 5);
            }
  
            //top triangle
            if ((n1+n4+n3) > 1) {
              let angle = Math.atan2( y3-y, x3-x ) * 180 / Math.PI;
              let space = dynspace * (n1+n4+n3) * 1.1; //spacing;
              hatch2 = poly.hatchPolygon([o([x,y]),o([x4,y4]),o([x3,y3]),o([x,y])], angle, space, 5);
            }
  
  
            // if (doHatch1) {//(n1+n3+n4) > 1.3) {
            //   let angle = 45; //Math.atan2( y4-y, x4-x ) * 180 / Math.PI;
            //   hatch1 = poly.hatchPolygon([[x,y],[x4,y4],[x3,y3]], angle, 0.6);
            //   hatch1.push([[x,y],[x4,y4]]);
            //   hatch1.push([[x4,y4],[x3,y3]]);
            //   hatch1.push([[x3,y3],[x,y]]);
            // }
  
            // if (doHatch2) {//(n1+n2+n3) > 1.1) {
            //   let angle = 45;//Math.atan2( y-y2, x-x2 ) * 180 / Math.PI;
            //   hatch2 = poly.hatchPolygon([[x,y],[x3,y3],[x2,y2]], angle, 0.6);
            //   hatch2.push([[x,y],[x2,y2]]);
            //   hatch2.push([[x2,y2],[x3,y3]]);
            //   hatch2.push([[x3,y3],[x,y]]);
            // }
            
          }
  
          //console.log({lineRight, lineDown})
  
          const path = createPath(ctx => {
            if (lineRight) { drawLineOnCanvas(ctx, lineRight); }
            if (lineDown) { drawLineOnCanvas(ctx, lineDown); }
            if (lineDiagonal) { drawLineOnCanvas(ctx, lineDiagonal); }
          });
          paths.push(path);
          
          if (hatch1) { 
            const hatchpath = createPath(ctx => {
              hatch1.forEach(h => {drawLineOnCanvas(ctx, h);});
            });
            hatches.push(hatchpath);
          }
  
          if (hatch2) { 
            const hatchpath = createPath(ctx => {
              hatch2.forEach(h => {drawLineOnCanvas(ctx, h);});
            });
            hatches.push(hatchpath);
          }
    
        }
      }
    }

    postcards.drawQuad(draw, width, height);

    return renderGroups([paths,hatches], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);