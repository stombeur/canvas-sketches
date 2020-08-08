// hatched donuts

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const poly = require('./utils/poly');
const polybool = require('polybooljs');
const random = require('canvas-sketch-util/random');
let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 1;
  let elementWidth = 1;
  let elementHeight = 1;
  let columns = 1;
  let rows = 1;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
   
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;
    poly.init(context);

    

    const drawSegment = (rOuter, rInner, center, sAngle, eAngle, hAngle) => {
      let rot = eAngle-sAngle;

      let p1 = poly.point(center.x, center.y - rOuter);
      if (sAngle>0) p1 = poly.rotatePointXY(p1, center, sAngle);
      let p2 = poly.rotatePointXY(p1, center, rot);
      let p4 = poly.point(center.x, center.y - rInner);
      if (sAngle>0) p4 = poly.rotatePointXY(p4, center, sAngle);
      let p3 = poly.rotatePointXY(p4, center, rot);
  
      let interPointsMax = [];
      let interPointsMin = [];

      let segments = 5;
      for (let i = 1; i < segments; i++) {
        let pmax = poly.rotatePointXY(p1, center, (rot/segments)*i); 
        interPointsMax.push(pmax);
        let pmin = poly.rotatePointXY(p3, center, -(rot/segments)*i); 
        interPointsMin.push(pmin);
      }

      let polygon = [p4,p1].concat(interPointsMax).concat([p2,p3]).concat(interPointsMin);
      //poly.drawPolygon(context)(polygon);
  
      let hatches = poly.hatchPolygon(polygon, hAngle, 0.5);
  
      hatches.forEach(h => {
        poly.drawLineOnCanvas(h)
      });
    }

    let rmax = (width-margin*2) / 2;
    let rmin = rmax * 4/5;
    let center = poly.point(width/2, height/2);

    let nrOfBands = 8;
    let nrOfSegments = 10;

    for (let i = 0; i < nrOfSegments; i++) {
      let sAngle = 360 / nrOfSegments * i;
      let eAngle = 360 / nrOfSegments * (i+1);   
      
      for (let j = 1; j < nrOfBands; j++) {
        let rout = rmax / nrOfBands * (j+1);
        let rin = rmax / nrOfBands * j;
        let hAngle = random.pick([15,30,45,60]);
        drawSegment(rout, rin, center, sAngle, eAngle, hAngle);
      }
    }
    
    
  

    //poly.drawCircle(context)(center.x, center.y, rmax);
    //poly.drawCircle(context)(center.x, center.y, rmin);
    
   

        
        

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
