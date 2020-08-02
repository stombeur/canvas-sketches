// hatched donuts

const canvasSketch = require('canvas-sketch');
const penplot = require('./utils/penplot');
const poly = require('./utils/poly');

let svgFile = new penplot.SvgFile();

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm',
};

const sketch = (context) => {

  let margin = 0.2;
  let elementWidth = 1;
  let elementHeight = 1;
  let columns = 1;
  let rows = 1;
  
  let drawingWidth = (columns * (elementWidth + margin)) - margin;
  let drawingHeight = (rows * (elementHeight + margin)) - margin;
  let marginLeft = (context.width - drawingWidth) / 2;
  let marginTop = (context.height - drawingHeight) / 2;
  
  // let o = [];
  // for (let r = 0; r < rows; r++) {
  //   o[r] = [];
  //   for (let i = 0; i < columns; i++) {
  //     let rot = utils.getRandomInt(4,0) * 90;//utils.random(0, 360);
  //     let size = utils.random(45, 270);
  //     let quarter = utils.getRandomInt(4,1);
  //     o[r].push([rot, size, quarter]);
  //   }
  // }
  
  return ({ context, width, height, units }) => {
    svgFile = new penplot.SvgFile();
    poly.init(context);

    const drawCircle = (cx, cy, radius) => {
  
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    
      svgFile.addCircle(cx, cy, radius);
    }
    
    const drawArc = (cx, cy, radius, sAngle, eAngle) => {
      context.beginPath();
      context.arc(cx, cy, radius, (Math.PI / 180) * sAngle, (Math.PI / 180) * eAngle);
      context.stroke();
    
      svgFile.addArc(cx, cy, radius, sAngle, eAngle);
    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'black';
    context.lineWidth = 0.01;

    let rmax = (width-margin*2) / 2;
    let rmin = rmax * 4/5;
    let rborder = rmax*2;
    let center = poly.point(width/2, height/2);
    poly.drawCircle(context)(center.x, center.y, rmax);
    poly.drawCircle(context)(center.x, center.y, rmin);
    
    let p1 = poly.point(width/2, height/2 - rmax - 2);
    let p2 = poly.rotatePointXY(p1, center, 30);
    let p4 = poly.point(width/2, height/2 - rmin + 2);
    let p3 = poly.rotatePointXY(p4, center, 30);
    let pZ1 = poly.point(width/2, height/2 - rborder);
    let pZ2 = poly.rotatePointXY(pZ1, center, 30);
    let pZ3 = poly.point(width/2, height/2 + rborder);
    let pZ4 = poly.rotatePointXY(pZ3, center, 30);

    poly.drawCircle(context)(p1.x, p1.y, 1);
    poly.drawCircle(context)(p2.x, p2.y, 1);
    poly.drawCircle(context)(p3.x, p3.y, 1);
    poly.drawCircle(context)(p4.x, p4.y, 1);

    
    poly.drawPolygonOnCanvas([[p1.x,p1.y],[p2.x,p2.y],[p3.x,p3.y],[p4.x,p4.y]])
    let x = poly.hatchDonut(center, rmax, rmin, 30, 0.1);
    //console.log(x)
    //let y = poly.hatchPolygon([[p1.x,p1.y],[p2.x,p2.y],[p3.x,p3.y],[p4.x,p4.y]], 5, 0.1)
    poly.drawLineOnCanvas([[pZ3.x, pZ3.y],[pZ1.x, pZ1.y]]);
    poly.drawLineOnCanvas([[pZ4.x, pZ4.y],[pZ2.x, pZ2.y]]);

    x.forEach(l => {
        //poly.drawLineOnCanvas(l);
       
        try {
            console.log(l);
            console.log([[l[0].x,l[0].y],[l[1].x,l[1].y]]);
           // poly.drawLineOnCanvas([[l[0].x,l[0].y],[l[1].x,l[1].y]]);
            let l1 = poly.clip([[l[0].x,l[0].y],[l[1].x,l[1].y]], [[pZ3.x, pZ3.y],[pZ1.x, pZ1.y]]);
            poly.drawLineOnCanvas([[l1[0].x,l1[0].y],[l1[1].x,l1[1].y]]);
        // console.log(l1)
        // let l2 = [[l1[0][0],l1[0][1]],[l1[1][0], l1[1][1]]];
       // console.log(l2);
    //poly.drawLineOnCanvas(l1);
        }
        catch {
           // poly.drawLineOnCanvas(l);
        }
        // console.log(l,l1)
       // let l2 = poly.clipLineToCircle(l, center, rmax);
        //let l2 = poly.clipLineToCircle(l, center, rmin);
        
    });
    // let bb = {xmin:margin, ymin:margin, xmax:width-margin, ymax:height-margin};

    // let circles = [];
    // circles.push({center: poly.point(width/3, height/3), r: width/2, hatchAngle: 20, hatchSpace: 0.2, innerOuter: 4/5});
    // //circles.push({center: poly.point(width/4, height/4), r: width/4, hatchAngle: 25, hatchSpace: 0.1, innerOuter: 0.5});
    // circles.push({center: poly.point(width/3*2, height/3*2), r: width/2, hatchAngle: 70, hatchSpace: 0.2, innerOuter: 3.5/5});
    // circles.push({center: poly.point(width/2, height/2), r: width/2+2, hatchAngle: 12, hatchSpace: 0.2, innerOuter: 3.5/5});
    // circles.push({center: poly.point(width/2*1.5, height/4*3), r: width/2+2, hatchAngle: 44, hatchSpace: 0.2, innerOuter: 3.5/5});

    // circles.push({center: poly.point(width/10, height/2+4), r: width/3.5, hatchAngle: 57, hatchSpace: 0.17, innerOuter: 0.73});

    // circles.forEach(c => {

    //   let x = poly.hatchDonut(c.center, c.r, c.r * c.innerOuter, c.hatchAngle, c.hatchSpace);
    //   x.forEach(l => { 
    //     let clippedLine = poly.clipLineToBB(l, bb);
    //     if (clippedLine) { 
    //       poly.drawLineOnCanvas(clippedLine);
    //       let p1 = [clippedLine[0][0] || clippedLine[0].x, clippedLine[0][1] || clippedLine[0].y];
    //       let p2 = [clippedLine[1][0] || clippedLine[1].x, clippedLine[1][1] || clippedLine[1].y];
    //       svgFile.addLine([p1, p2]);
    //      }
    //   });

    //   svgFile.newPath();
    // });

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
