const defined = require('defined');
const convertUnits = require('convert-units');

// 96 DPI for SVG programs like Inkscape etc
const TO_PX = 35.43307;
const DEFAULT_SVG_LINE_WIDTH = 0.03;

function cm (value, unit) {
  return convertUnits(value).from(unit).to('cm');
}

function polyLinesToSvgPaths (polylines, opt = {}) {
    if (!opt.units || typeof opt.units !== 'string') throw new TypeError('must specify { units } string as well as dimensions, such as: { units: "in" }');
    const units = opt.units.toLowerCase();
    const decimalPlaces = 5;

    let commands = [];
    polylines.forEach(line => {
        line.forEach((point, j) => {
        const type = (j === 0) ? 'M' : 'L';
        const x = (TO_PX * cm(point[0], units)).toFixed(decimalPlaces);
        const y = (TO_PX * cm(point[1], units)).toFixed(decimalPlaces);
        commands.push(`${type} ${x} ${y}`);
        });
    });

    return commands;
}


function arcsToSvgPaths (arcs, opt = {}) {
  const dimensions = opt.dimensions;
  if (!dimensions) throw new TypeError('must specify dimensions currently');
  if (!opt.units || typeof opt.units !== 'string') throw new TypeError('must specify { units } string as well as dimensions, such as: { units: "in" }');
  const units = opt.units.toLowerCase();
  if (units === 'px') throw new Error('px units are not yet supported by this function, your print should be defined in "cm" or "in"');

  let commands = [];
  arcs.forEach(input => {
    let arc = input.toSvgPixels();
    commands.push(`M${arc.startX} ${arc.endX} a${arc.radiusX},${arc.radiusY} ${arc.rotX} ${arc.largeArcFlag},${arc.sweepFlag} ${arc.endX},${arc.endY}`);
  });

  return commands;
}

function pathsToSvgFile(paths, opt = {}) {
    const dimensions = opt.dimensions;
    if (!dimensions) throw new TypeError('must specify dimensions currently');
    if (!opt.units || typeof opt.units !== 'string') throw new TypeError('must specify { units } string as well as dimensions, such as: { units: "in" }');
    const units = opt.units.toLowerCase();
    if (units === 'px') throw new Error('px units are not yet supported by this function, your print should be defined in "cm" or "in"');
    const decimalPlaces = 5;
  
    const svgPath = paths.join(' ');
    const dimensionsInCM = dimensions.map(d => cm(d, units));
    const viewWidth = (dimensionsInCM[0] * TO_PX).toFixed(decimalPlaces);
    const viewHeight = (dimensionsInCM[1] * TO_PX).toFixed(decimalPlaces);
    const fillStyle = opt.fillStyle || 'none';
    const strokeStyle = opt.strokeStyle || 'black';
    const lineWidth = defined(opt.lineWidth, DEFAULT_SVG_LINE_WIDTH);
  
    const data = `<?xml version="1.0" standalone="no"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" 
      "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg width="${dimensionsInCM[0]}cm" height="${dimensionsInCM[1]}cm"
         xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${viewWidth} ${viewHeight}">
     <g>
       <path d="${svgPath}" fill="${fillStyle}" stroke="${strokeStyle}" stroke-width="${lineWidth}cm" />
     </g>
  </svg>`;
    return { data, extension: '.svg' };
}

class Arc {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.radiusX = 0;
        this.radiusY = 0;
        this.rotX = 0;
        this.largeArcFlag = 0;
        this.sweepFlag = 1;
    }

    toSvgPixels() {
        let a = new Arc();
        a.startX = (TO_PX * cm(this.startX, units)).toFixed(decimalPlaces);
        a.startY = (TO_PX * cm(this.startY, units)).toFixed(decimalPlaces);
        a.endX = (TO_PX * cm(this.endX, units)).toFixed(decimalPlaces);
        a.endY = (TO_PX * cm(this.endY, units)).toFixed(decimalPlaces);

        a.radiusX = this.radiusX;
        a.radiusY - this.radiusY;
        a.rotX = this.rotX;
        a.largeArcFlag = this.largeArcFlag;
        a.sweepFlag = this.sweepFlag;

        return a;
    }
}

function createCircle(cx, cy, radius) {
    let a = new Arc();
    a.startX = cx - radius;
    a.startY = cy;
    a.endX = a.startX;
    a.endY = a.startY;
    a.radiusX = radius;
    a.radiusY = radius;

    return a;
}

module.exports.arcsToSvgPaths = arcsToSvgPaths;
module.exports.polyLinesToSvgPaths = polyLinesToSvgPaths;
module.exports.pathsToSvgFile = pathsToSvgFile;
module.exports.Arc = Arc;
module.exports.createCircle = createCircle;