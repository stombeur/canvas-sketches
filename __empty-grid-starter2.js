// starter file with grid

const canvasSketch = require("canvas-sketch");
const {
  renderPaths,
  renderGroups,
  createPath,
} = require("canvas-sketch-util/penplot");
import { hatch } from "./utils/hatch";
import { room } from "./room";
const random = require("canvas-sketch-util/random");
const { createArcPath, createLinePath } = require("../utils/paths");
const poly = require("./utils/poly");
const polybool = require("polybooljs");
import { polyline } from "./utils/polyline";
import { boundingbox } from "./utils/boundingbox";
const { distanceBetween } = require("./utils/poly");

const settings = {
  dimensions: "A4",
  orientation: "portrait",
  pixelsPerInch: 300,
  scaleToView: true,
  units: "cm",
};

const createGrid = (countX, countY, countZ) => {
  const grid = [];
  for (let x = 0; x < countX; x++) {
    let col = [];
    for (let y = 0; y < countY; y++) {
      let row = [];
      for (let z = 0; z < countZ; z++) {
        const u = x / (countX - 1);
        const v = y / (countY - 1);
        const w = z / (countZ - 1);
        const position = [u, v, w];
        let noiseFactor = 0.4;
        row.push({
          position,
          noise1: random.noise3D(u, v, w) * noiseFactor,
          noise2: random.noise3D(w, u, v) * noiseFactor,
          noise3: random.noise3D(v, w, u) * noiseFactor,
        });
      }
      col.push(row);
    }
    grid.push(col);
  }
  return grid;
};

// grid settings
let margin = 1;
let columns = 4;
let rows = 6;

const sketch = ({ width, height }) => {
  // do random stuff here
  let w = width - margin * 2
  let h = height - margin * 2
  let center  = [w/2, h/2]
  let wCol = w / columns
  let hRow = h / rows
  let elementSize = Math.min(wCol, hRow)
  let start = [center[0] - elementSize*columns/2, center[1] - elementSize*rows/2]

  return ({ context, width, height, units }) => {
    // do drawing stuff here
    let paths = [];

    paths.push(createArcPath())

    return renderPaths(paths, {
      context,
      width,
      height,
      units,
    });
  };
};

canvasSketch(sketch, settings);
