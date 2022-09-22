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
        const noise = random.noise2D(u,v) * 0.85; //random.gaussian(0.5, 0.1);//
        const positionSkewed = skew(position, noise,  noise / countX, noise / countY);
        points.push({
          position,
          positionSkewed,
          noise
        });
      }
      grid.push(points);
    }
    console.log(grid)
    return grid;
  };

  let grid = createGrid();

  return ({ context, width, height, units }) => {
    this.paths = [];
    const margin = width * 0.175;
    let unitX = (width - (2 * margin)) /countX;
    let offsetX = unitX / 2; 

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
      const isFirstRow = row === 0;
      let even = row % 2 === 0;
      ox = even ? 0 : offsetX;
      oxNot = !even ? 0 : offsetX;
      console.log(ox)

      for (let column = 0; column < grid[row].length; column++) {

        // if first row, draw only bottom triangles
        // if last row, draw only top triangles
        // top triangle odd = point[n] and point[n+1] this row + point[n+1] row above
        // top triangle even = point[n] and point[n+1] this row + point[n] row above

        const isLastColumn = column === grid[row].length - 1;
        const position = grid[row][column].position;
        const p1 = [lerp(margin, width - margin, position[0]) + ox, lerp(margin, height - margin, position[1])];
        let lines = [];

        if (!isLastColumn) {
          let p2 = [lerp(margin, width - margin, grid[row][column+1].position[0]) + ox, lerp(margin, height - margin, grid[row][column+1].position[1])];
          lines.push([p1,p2]);
          let otherCol = even ? column : column + 1;
          if (!isFirstRow) {
            // draw top triangles
            let p3 = [lerp(margin, width - margin, grid[row-1][otherCol].position[0]) + oxNot, lerp(margin, height - margin, grid[row-1][otherCol].position[1])];
            lines.push([p2, p3]);
            lines.push([p3, p1]);
          }
  
          if (!isLastRow) {
            // draw bottom triangles
            let p4 = [lerp(margin, width - margin, grid[row+1][otherCol].position[0]) + oxNot, lerp(margin, height - margin, grid[row+1][otherCol].position[1])];
            lines.push([p2, p4]);
            lines.push([p4, p1]);
          }
        }
        
        const path = createPath(ctx => {
          lines.forEach(l => drawLineOnCanvas(ctx, l));
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