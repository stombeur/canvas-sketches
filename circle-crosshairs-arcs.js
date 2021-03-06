// hatched donuts

const canvasSketch = require('canvas-sketch');
const { renderGroups, renderPaths, createPath } = require('canvas-sketch-util/penplot');

const penplot = require('./utils/penplot');
const poly = require('./utils/poly');
const random = require('canvas-sketch-util/random');

random.setSeed(random.getRandomSeed());//359079

const settings = {
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = ({ width, height }) => {
  paths = [];

  let margin = 1;
  let elementWidth = 1;
  let elementHeight = 1;
  let columns = 1;
  let rows = 1;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (width - drawingWidth) / 2;
  let marginTop = (height - drawingHeight) / 2;
   
  return ({ context, width, height, units }) => {
    paths = [];

    context.fillStyle = 'white';
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

    const drawArc = (ctx, center, radius, sAngle, eAngle) => {
      ctx.arc(center.x, center.y, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
    }

    const drawSegment = (rOuter, rInner, center, sAngle, eAngle) => {
      if (random.chance(0.25)) { return; }

      let nrOfArcs = random.pick([3,5,6,7,8,9,10,15])
      let spacing = (rOuter-rInner)/nrOfArcs;

      for (let r = rInner; r <= rOuter; r+=spacing) {
        const path = createPath(ctx => {
            drawArc(ctx, center, r, sAngle, eAngle);
        });
        paths.push(path);
      }
      
    }

    let rmax = (width-margin*2) / 2;
    let center = poly.point(width/2, height/2);

    let nrOfBands = 12;
    let nrOfSegments = 10;
    let spacebetweensegments = 0.1;
    let anglebetweensegments = 1;

    for (let i = 0; i < nrOfSegments; i++) {
      let sAngle = 360 / nrOfSegments * i;
      let eAngle = 360 / nrOfSegments * (i+1);   
      
      for (let j = 1; j < nrOfBands; j++) {
        let rout = rmax / nrOfBands * (j+1);
        let rin = rmax / nrOfBands * j + spacebetweensegments;
        drawSegment(rout, rin, center, sAngle + (anglebetweensegments/2), eAngle - (anglebetweensegments/2));
      }
    }
    
    
  

    //poly.drawCircle(context)(center.x, center.y, rmax);
    //poly.drawCircle(context)(center.x, center.y, rmin);
    
   

        
        

    return renderGroups([paths], {
      context, width, height, units
    });
  };
};

canvasSketch(sketch, settings);
