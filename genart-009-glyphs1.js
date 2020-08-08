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
  dimensions: 'A4',//[ 2048, 2048 ]
  orientation: 'portrait',
  pixelsPerInch: 300,
  //scaleToView: true,
  units: 'mm',
};



const sketch = ({ width, height }) => {
  const countX = 15;
  const countY = Math.floor(countX / width * height);
  const l = (width / countX) * (1 / 5);

  const createGlyph = (l, [u,v]) => {
    let glyph = [];
    let a = 1;//random.noise2D(u,v);

    const addLine = (line) => {
      //glyph.push(line);
      let r = random.gaussian();
      let e = Math.abs(a * r);

      if (e > 0.7) {
        glyph.push(line);
      }
      else glyph.push(null);
    }
    
    addLine([[-l,-l],[0,-l]]);
    addLine([[-l,-l],[-l,0]]);
    //addLine([[-l,-l],[0,0]]);
    addLine([[-l,0],[0,-l]]);
    addLine([[-l,0],[0,0]]);
    addLine([[0,-l],[0,0]]);
    
    addLine([[0,0],[l,0]]);
    addLine([[0,0],[0,l]]);
    //addLine([[0,0],[l,l]]);
    addLine([[0,l],[l,0]]);
    addLine([[0,l],[l,l]]);
    addLine([[l,0],[l,l]]);

    addLine([[-l,0],[-l,l]]);
    addLine([[-l,l],[0,l]]);
    addLine([[-l,0],[0,l]]);
    //addLine([[-l,l],[0,0]]);

    addLine([[0,-l],[l,-l]]);
    addLine([[l,-l],[l,0]]);
    //addLine([[0,0],[l,-l]]);
    addLine([[0,-l],[l,0]]);

    return glyph;
  }

  const createGrid = () => {
    const grid = [];
    for (let x = 0; x < countX; x++) {
      const points = [];
      for (let y = 0; y < countY; y++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const position = [ u, v ];
        const glyph = createGlyph(l, position)
        points.push({
          position,
          glyph
        });
      }
      grid.push(points);
    }
    return grid;
  };

  let grid = createGrid();

  return ({ context, width, height, units }) => {
    this.paths = [];
    const margin = width * 0.175;

    context.fillStyle = 'white';//background;
    context.fillRect(0, 0, width, height);

    const drawLineOnCanvas = (ctx, line) => {
      let x1 = line[0].x  || line[0][0],
          x2 = line[1].x || line[1][0],
          y1 = line[0].y || line[0][1],
          y2 = line[1].y || line[1][1];
    
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }

    const drawGlyph = (glyph, [x,y]) => {

      const path = createPath(ctx => {
        for (let i = 0; i < glyph.length; i++) {
          const element = glyph[i];
          if (element) {
            line = [[x+element[0][0],y+element[0][1]],[x+element[1][0],y+element[1][1]]];
            drawLineOnCanvas(ctx, line);
          }
        }
        
      });

      return path;
    }

    for (let row = 0; row < grid.length; row++) {
      for (let column = 0; column < grid[row].length; column++) {
        const position = grid[row][column].position;
        const glyph = grid[row][column].glyph;

        const x = lerp(margin, width - margin, position[0]);
        const y = lerp(margin, height - margin, position[1]);

        path = drawGlyph(glyph, [x,y]);
        
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