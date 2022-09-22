// starter file with grid

const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  renderGroups,
  createPath,
} = require("canvas-sketch-util/penplot");
const random = require("canvas-sketch-util/random");
const { createArcPath, createLinePath } = require("./utils/paths");
const poly = require("./utils/poly");
const polybool = require("polybooljs");
const { distanceBetween } = require("./utils/poly");
import { point } from "./utils/point";
import {polyline} from "./utils/polyline"
import {hexagon} from "./utils/hexagon"
const { lerp } = require("canvas-sketch-util/math");

const settings = {
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

const createGrid = (countX, countY) => {
  const grid = [];
  for (let x = 0; x < countX; x++) {
    let col = [];
    for (let y = 0; y < countY; y++) {
      const u = x / (countX - 1);
      const v = y / (countY - 1);
      const position = [u, v];
      let noiseFactor = 0.4;
      let oo = random.noise2D(u, v) 
      let row = {
        position,
        noise1: random.noise2D(u, v) * noiseFactor,
        noise2: random.noise2D(v, u) * noiseFactor,
        offset: Math.abs(oo) > 0.4 ? 1 : 0 //Math.random() > 0.5 ? 1 : 0
      };
      col.push(row);
    }
    grid.push(col);
  }
  return grid;
};

// grid settings
let margin = 2;
let columns = 6;
let rows = 10;

const sketch = ({ width, height }) => {
  // do random stuff here
  let grid = createGrid(columns, rows);

  let el = (width - margin*2) / columns
  let start = [margin - el/4, margin + (el/2*1.3)]

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];

    for (let c = 0; c < grid.length; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        let pos = [start[0] + el/2 + c*el, start[1] + (r)*(Math.sqrt(3 * Math.pow(el/2, 2))) ]
        if (r%2 > 0) {
          pos[0] = pos[0] + el/2
        }
        let hex = new hexagon(pos, el/2)
        //hex.drawLines(paths)

        hex.drawCircles(paths, grid[c][r].offset)
      }
    }

    let border = new polyline(poly.createSquarePolygon(margin, margin, width - 2*margin, height - 2*margin))
    //paths.push(...border.tolines().map(l => createLinePath(l)))

    return renderPaths(paths, {
      context,
      width,
      height,
      units,
    });
  };
};

canvasSketch(sketch, settings);
