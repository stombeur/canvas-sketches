const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');
const random = require('canvas-sketch-util/random');
//const palettes = require('nice-color-palettes');
const poly = require('./utils/poly.js');

random.setSeed(random.getRandomSeed());
console.log(`seed: ${random.getSeed()}`);
// 469789
// 219376

const paths = [];

const settings = {
  suffix: random.getSeed(),
  dimensions: 'A3',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};

const sketch = ({ width, height }) => {
  const countX = 10;
  const countY = Math.floor(countX / width * height);

  const skew = (point, skew, skewX, skewY) => {
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

  const createGrid = () => {
    const grid = [];
    for (let x = 0; x < countX; x++) {
      const points = [];
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
        const noise = random.noise2D(u,v);
        const positionSkewed = skew(position, noise,  noise / countX, noise / countY);
        points.push({
          position: positionSkewed,
          noise
        });
      }
      grid.push(points);
    }
    return grid;
  };

  let grid = createGrid();

  return ({ context, width, height, units }) => {

    const margin = width * 0.175;

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const drawLineOnCanvas = (ctx, line) => {
      let x1 = line[0].x  || line[0][0],
          x2 = line[1].x || line[1][0],
          y1 = line[0].y || line[0][1],
          y2 = line[1].y || line[1][1];

      //console.log({line:[[x1,y1],[x2,y2]]})
    
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }

    for (let row = 0; row < grid.length; row++) {
      const isLastRow = row === grid.length - 1;
      for (let column = 0; column < grid[row].length; column++) {
        const isLastColumn = column === grid[row].length - 1;
        const position = grid[row][column].position;
        const x = lerp(margin, width - margin, position[0]);
        const y = lerp(margin, height - margin, position[1]);
        
        let lineRight = null, 
            lineDown = null;
        
        if (!isLastColumn) {
          const pointRight = grid[row][column+1].position;
          const x2 = lerp(margin, width - margin, pointRight[0]);
          const y2 = lerp(margin, height - margin, pointRight[1]);
          lineRight = [[x,y],[x2,y2]];
        }

        if (!isLastRow) {
          const pointDown = grid[row+1][column].position;
          const x2 = lerp(margin, width - margin, pointDown[0]);
          const y2 = lerp(margin, height - margin, pointDown[1]);
          lineDown = [[x,y],[x2,y2]];
        }

        //console.log({lineRight, lineDown})

        const path = createPath(ctx => {
          if (lineRight) { drawLineOnCanvas(ctx, lineRight); }
          if (lineDown) { drawLineOnCanvas(ctx, lineDown); }
        });
        
  
        paths.push(path);
      }
    }

    // return [
    //   // Export PNG as first layer
    //   context.canvas,
    //   // Export SVG for pen plotter as second layer
    //   {
    //     data: pathsToSVG(paths, {
    //       width,
    //       height,
    //       units
    //     }),
    //     extension: '.svg',
    //   }
    // ];
    return renderPaths(paths, {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);