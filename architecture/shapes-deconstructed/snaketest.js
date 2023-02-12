const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const {
  renderGroups,
  renderPaths,
  createPath,
} = require("canvas-sketch-util/penplot");
const random = require("canvas-sketch-util/random");
const { arc } = require("../../utils/arc.js");
const { createArcPath, createLinePath } = require("../../utils/paths.js");
//const palettes = require('nice-color-palettes');
const poly = require("../../utils/poly.js");
const postcards = require("../../utils/postcards");
const rnd2 = require("../../utils/random");
const { point } = require("../../utils/point");
const { polyline } = require("../../utils/polyline.js");
import { hatch } from "../../utils/hatch";
import { clipregion } from "../../utils/clipregion";
import { boundingbox } from "../../utils/boundingbox";
import { House, SymmetricCross } from "../shape";

const settings = {
  suffix: random.getSeed(),
  dimensions: "A4", //[ 2048, 2048 ]
  orientation: "portrait",
  pixelsPerInch: 300,
  //scaleToView: true,
  units: "mm",
};

let paths = [];

const drawSnake = (w, coords, width, height, nroflines = 4) => {
  let points = [];

  let center = [width / 2, height / 2];

  let bb = boundingbox.fromWH(center, width, height, -width / 10);
  let padH = width / 50;
  let padW = padH / 4;

  let hh = bb.height - padH * 3;
  let j = Math.ceil(hh / (padH * 4));

  let start = new point(bb.left, bb.top);
  points.push(start);

  // open outside
  let next = start.copy(bb.width, 0);
  points.push(next);
  next = next.copy(0, padH * 3);
  points.push(next);

  for (let i = 0; i < j; i++) {
    next = next.copy(-bb.width + padW, 0);
    points.push(next);
    next = next.copy(0, padH);
    points.push(next);
    next = next.copy(bb.width - padW, 0);
    points.push(next);
    next = next.copy(0, padH * 3);
    points.push(next);
  }


  // close outside
  next = next.copy(-bb.width /* NO PAD */, 0); points.push(next);

  //switch direction

  // open inside
  next = next.copy(0, -padH);
  points.push(next);
  next = next.copy(bb.width - padW, 0);
  points.push(next);
  next = next.copy(0, -padH);
  points.push(next);

  for (let i = 0; i < j; i++) {
    next = next.copy(-bb.width + padW, 0);
    points.push(next);
    next = next.copy(0, -3 * padH);
    points.push(next);
    next = next.copy(bb.width - padW, 0);
    points.push(next);
    next = next.copy(0, -padH);
    points.push(next);
  }
  // close inside
  next = next.copy(-bb.width + padW, 0); points.push(next);

  let clip = new clipregion(points);

  clip.toLines().forEach((l) => {
    paths.push(createLinePath(l));
  });
};

const sketch = ({ width, height }) => {
  return ({ context, width, height, units }) => {
    paths = [];
    context.fillStyle = "white"; //background;
    context.fillRect(0, 0, width, height);

    const draw = (origin, w, h, opts) => {
      let nroflines = (opts.index + 1) * 1;
      let localOrigin = postcards.reorigin([0, 0], origin);
      let crossOrigin = new point(...localOrigin).copy(w / 4, h / 10);

      drawSnake(w / 2, localOrigin, w, h, nroflines);
    };

    postcards.drawColumnsRowsPortrait(draw, width, height, 1, 1);
    //postcards.drawSingle(draw, width, height);

    return renderPaths(paths, {
      context,
      width,
      height,
      units,
    });
  };
};

canvasSketch(sketch, settings);
