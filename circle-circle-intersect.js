const canvasSketch = require('canvas-sketch');
const { renderPaths, renderGroups } = require('canvas-sketch-util/penplot');
const postcards = require('./utils/postcards');
const { createArcPath, createLinePath, createCirclePath } = require('./utils/paths');
const { arc }  = require('./utils/arc');
const { polyline } = require('./utils/polyline');

const settings = {
    dimensions: 'A4',//[ 2048, 2048 ]
    orientation: 'portrait',
    pixelsPerInch: 300,
    //scaleToView: true,
    units: 'mm',
  };

  const sketch = ({ width, height }) => {
    // do random stuff here
  
    let c1 = new arc([width/2, height/2], 30)

    let innercircles = []
    let innerintersects = []
    let nrofinner = 10
    for (let i = 0; i < nrofinner-1; i++) {
        innercircles.push(new arc([width/2, height/2], (30 / nrofinner) * ( i+1)))
    }

    let c2 = new arc([width/2,height/2-40], 30)
    let c3 = new arc([width/3,height/2], 20)

    let cno =  new arc([width/2, height/2  +80], 30)
    let ctouch = new arc([width/2 + c1.r + c1.r, height/2], 30)

    let inter = c1.intersect(c2)
    let interall = c1.intersects([c3, c2, cno, ctouch])
    console.log(interall)
  
    return ({ context, width, height, units }) => {
      // do drawing stuff here
      let paths = [];
  
      const draw = (origin, w, h, opts) => {
        interall.forEach(element => {
            paths.push(createArcPath(c1.c, c1.r, element[0], element[1]))
        });
        // innercircles.forEach(element => {
        //     paths.push(createArcPath(element.c, element.r, element.sAngle, element.eAngle))
        // });
         paths.push(
         createArcPath(c2.c, c2.r, c2.sAngle, c2.eAngle),
         createArcPath(c3.c, c3.r, c3.sAngle, c3.eAngle),
         createArcPath(ctouch.c, ctouch.r, ctouch.sAngle, ctouch.eAngle),
         createArcPath(cno.c, cno.r, cno.sAngle, cno.eAngle)
         )
        // if (i1) { paths.push( createCirclePath(i1, 1))}
        // if (i2) { paths.push( createCirclePath(i2, 1))}
      }
  
      
  
  
      postcards.drawSingle(draw, width, height);
     
      
  
      return renderGroups([ paths], {
        context, width, height, units
      });
    };
  };
  
  canvasSketch(sketch, settings);