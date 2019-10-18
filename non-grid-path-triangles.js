// starter file with grid

const canvasSketch = require('canvas-sketch');
const penplot = require('./penplot');
const utils = require('./utils');
const poly = require('./poly');

let svgFile = new penplot.SvgFile();


const settings = {
  dimensions: 'A4',
  orientation: 'landscape',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.02;

    let margin = 0.5;
    let ribbonHeight = height / 5;

    let topLine = [[margin, height/2 - ribbonHeight/2],[width-margin, height/2 - ribbonHeight/2]];
    let bottomLine = [[margin, height/2 + ribbonHeight/2],[width-margin, height/2 + ribbonHeight/2]];
    poly.drawLineOnCanvas(context, topLine);
    poly.drawLineOnCanvas(context, bottomLine);

    let randomPoints = Array.from({length: 20}, () => utils.getRandom(width/10, 0.5));
    let posX = margin;
    let posY = height/2 + ribbonHeight/2;

    let trianglePoints = [];
    trianglePoints.push([posX, height/2 - ribbonHeight/2 + margin]);
    trianglePoints.push([posX, posY - margin]);
    let lastPosY = posY;

    for (let i = 0; i < randomPoints.length; i++) {
      

      let nextPosY = i%2===0 ? height/2 - ribbonHeight/2  : height/2 + ribbonHeight/2;
      lastPosY = nextPosY;
      let nextPosX = posX + randomPoints[i];
      if (nextPosX > width-margin) { nextPosX = width; }
      trianglePoints.push([nextPosX, nextPosY +margin]);

      poly.drawLineOnCanvas(context, [[posX, posY],[nextPosX, nextPosY]]);
      
      if (nextPosX >= width-margin) { break; }

      posX = nextPosX;
      posY = nextPosY;
      
    }

    let y = (lastPosY === height/2 - ribbonHeight/2 ? height/2 + ribbonHeight/2 - margin : height/2 - ribbonHeight/2 + margin);
    trianglePoints.push([width - margin, y]);


    let nrOfPoints = trianglePoints.length;
    let index = 0;
    while (nrOfPoints >= 3) {
      let p1 = trianglePoints[index];
      let p2 = trianglePoints[index+1];
      let p3 = trianglePoints[index+2];

      //console.log({p1,p2,p3});
      // poly.drawLineOnCanvas(context, [p1,p2]);
      // poly.drawLineOnCanvas(context, [p2,p3]);
      // poly.drawLineOnCanvas(context, [p3,p1]);
      //poly.drawPolygonOnCanvas(context, [[p1,p2],[p2,p3],[p3,p1]]);
      nrOfPoints--;
      index = index + 1;
    }
    
    let leftBoundary = [[margin, height/2 - ribbonHeight/2 + margin], [margin, height/2 + ribbonHeight/2 - margin]];

    // eerste driehoek links = altijd breed bovenaan
    let p1 = [trianglePoints[0][0] - margin/2, trianglePoints[0][1]];
    let p2 = [trianglePoints[1][0] - margin/2, trianglePoints[1][1]];
    let p3 = [trianglePoints[2][0] - margin/2, trianglePoints[2][1]];
    console.log({p1,p2,p3})

    poly.drawLineOnCanvas(context, [p1,p2]);
    poly.drawLineOnCanvas(context, [p2,p3]);
    poly.drawLineOnCanvas(context, [p3,p1]);

    return [
      // Export PNG as first layer
      context.canvas,
      // Export SVG for pen plotter as second layer
      {
        data: svgFile.toSvg({
          width,
          height,
          units
        }),
        extension: '.svg',
      }
    ];
  };
};

canvasSketch(sketch, settings);
