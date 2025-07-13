const poly = require('./poly');
const { createLinePath } = require('./paths.js');
const { random } = require('canvas-sketch-util');

const reorigin = (point, origin) => {
    x = point.x || point[0];
    y = point.y || point[1];
    hor = origin.x || origin[0];
    vert = origin.y || origin[1];

    let t = [x+hor, y+vert];

    if (point.x){
      return poly.point(...t);
    }
    else return t;
  }

  const drawDouble = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    opt2.index = 1;
    f([0,0], width, height/2, {...opt, ...opt2});
    opt2.index = 2;
    f([0,height/2], width, height/2, {...opt, ...opt2});
  }

  const drawQuad = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    opt2.index = 1;
    f([0,0], width/2, height/2, {...opt, ...opt2});
    opt2.index = 2;
    f([0,height/2], width/2, height/2, {...opt, ...opt2});
    opt2.index = 3;
    f([width/2,0], width/2, height/2, {...opt, ...opt2});
    opt2.index = 4;
    f([width/2,height/2], width/2, height/2, {...opt, ...opt2});
  }

  const drawFourColumnsTwoRowsPortrait = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c <= 3; c++) {
        let posX = c * (width / 4);
        let posY = r * (height / 2);
        
        f([posX,posY], width/4, height/2, {...opt, ...opt2});
        opt2.index++;
      }
    }
  }

  const drawSixColumnsTwoRowsPortrait = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c <= 5; c++) {
        let posX = c * (width / 6);
        let posY = r * (height / 2);
        
        f([posX,posY], width/6, height/2, {...opt, ...opt2});
        opt2.index++;
      }
    }
  }

  const prepareColumnsRowsPortrait = (width, height, columns = 2, rows = 2) => {
    // return a list of { origin, width, height, index }
    let index = 0;
    let result = [];

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        
        let posX = c * (width / columns);
        let posY = r * (height / rows);
        
       // f([posX,posY], width/columns, height/rows, {...opt, ...opt2});

        result.push(
          {
            seed: random.getRandomSeed(),
            index,
            origin: [posX,posY],
            width: width / columns,
            height: height / rows,
          }
        );

        index++;
      }
    }

    return result;
  }

  const drawColumnsRowsPortrait = (f, width, height, columns = 2, rows = 2, opt = null) => {
    let opt2 = {index:0}

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = c * (width / columns);
        let posY = r * (height / rows);
        
        f([posX,posY], width/columns, height/rows, {...opt, ...opt2});
        opt2.index++;
      }
    }
  }

  const drawColumnsRowsLandscape = (f, width, height,  columns = 2, rows = 2, opt = null) => {
    let opt2 = {index:0}

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = c * (width / columns);
        let posY = r * (height / rows);
        
        f([posX,posY], width/columns, height/rows, {...opt, ...opt2});
        opt2.index++;
      }
    }
  }

  const addSeedText = (width, height, columns = 2, rows = 2, opt = null) => {
    console.log(width, height, columns, rows, opt);
    opt = {fontsize: 3,...opt};
    let i = 0;
    let result = [];
    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = c * (width / columns);
        let posY = (r+1) * (height / rows);

        let seed = opt.seeds[i];
        
        result.push({
          pos: [posX,posY],
          text: "" + seed,
          fontsize: opt.fontsize,
        });
        i++;
      }
    }

    return result;
  }

  const drawTwoColumnsFourRowsLandscape = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    for (let r = 0; r <= 3; r++) {
      for (let c = 0; c <= 1; c++) {
        let posX = c * (width / 2);
        let posY = r * (height / 4);
        
        f([posX,posY], width/2, height/4, {...opt, ...opt2});
        opt2.index++;
      }
    }
  }


  
  const drawQuadQuad = (f, width, height, opt = null) => {
    drawOffsetQuad(f, width/2, height/2, [0,0], opt);
    drawOffsetQuad(f, width/2, height/2, [width/2,0], opt);
    drawOffsetQuad(f, width/2, height/2, [width/2,height/2], opt);
    drawOffsetQuad(f, width/2, height/2, [0,height/2], opt);
  }

  const drawOffsetQuad = (f, width, height, offsetOrigin, opt = null) => {
    let [x,y] = [offsetOrigin[0] , offsetOrigin[1]];
    let opt2 = {index:0}

    opt2.index = 1;
    f([x,y], width/2, height/2, {...opt, ...opt2});
    opt2.index = 2;
    f([x,y+height/2], width/2, height/2, {...opt, ...opt2});
    opt2.index = 3;
    f([x+width/2,y], width/2, height/2, {...opt, ...opt2});
    opt2.index = 4;
    f([x+width/2,y+height/2], width/2, height/2, {...opt, ...opt2});
  }

  const drawSingle = (f, width, height, opt = null) => {
    f([0,0], width, height, {...opt, index:1});
  }

  const drawOct = (f, width, height, opt = null) => {
    let opt2 = {index:0}

    opt2.index = 1;
    f([0,0], width/4, height/2, {...opt, ...opt2});
    opt2.index = 2;
    f([width/4,0], width/4, height/2, {...opt, ...opt2});
    opt2.index = 3;
    f([width/2,0], width/4, height/2, {...opt, ...opt2});
    opt2.index = 4;
    f([width/4*3,0], width/4, height/2, {...opt, ...opt2});

    opt2.index = 5;
    f([0,height/2], width/4, height/2, {...opt, ...opt2});
    opt2.index = 6;
    f([width/4,height/2], width/4, height/2, {...opt, ...opt2});
    opt2.index = 7;
    f([width/2,height/2], width/4, height/2, {...opt, ...opt2});
    opt2.index = 8;
    f([width/4*3,height/2], width/4, height/2, {...opt, ...opt2});

  }

  const drawQuadCutLines = (ctx, width, height) => {
    let l1 = [[width/2,0],[width/2,height]];
    let l2 = [[0,height/2],[width, height/2]];
    ctx.moveTo(...l1[0]);
    ctx.lineTo(...l1[1]);
    ctx.moveTo(...l2[0]);
    ctx.lineTo(...l2[1]);
  }

  const drawCutlines = (width, height, rows, columns) => {
    let l = width / 100;
    let paths = [];

    // add corners first
    paths.push(createLinePath([[0,0],[0, l]]));
    paths.push(createLinePath([[0,0],[l, 0]]));

    paths.push(createLinePath([[width,0],[width, l]]));
    paths.push(createLinePath([[width,0],[width-l, 0]]));

    paths.push(createLinePath([[0,height],[0, height-l]]));
    paths.push(createLinePath([[0,height],[l, height]]));

    paths.push(createLinePath([[width,height],[width, height-l]]));
    paths.push(createLinePath([[width,height],[width-l, height]]));

    //left
    let h = height/rows;
    for (let i = 1; i < rows; i++) {
      paths.push(createLinePath([[0,h*i],[l, h*i]]));
      paths.push(createLinePath([[0,h*i - l],[0, h*i + l]]));
    }

    //right
    for (let i = 1; i < rows; i++) {
      paths.push(createLinePath([[width,h*i],[width-l, h*i]]));
      paths.push(createLinePath([[width,h*i - l],[width, h*i + l]]));
    }

    //top
    let w = width/columns;
    for (let i = 1; i < columns; i++) {
      paths.push(createLinePath([[w*i, 0],[w*i, l]]));
      paths.push(createLinePath([[w*i - l,0],[w*i + l, 0]]));
    }

    //bottom
    for (let i = 1; i < columns; i++) {
      paths.push(createLinePath([[w*i, height],[w*i, height - l]]));
      paths.push(createLinePath([[w*i - l,height],[w*i + l, height]]));
    }

    // crosses
    for (let i = 1; i < columns; i++) {
      for (let j = 1; j < rows; j++) {
        paths.push(createLinePath([[w*i, h*j +l],[w*i, h*j - l]]));
        paths.push(createLinePath([[w*i - l,h*j],[w*i + l, h*j]]));
      }
    }


    return paths;
  }

  const drawQuadAddressLines = (ctx, width, height) => {
    // hor lijn dwars = 4/7
    // adreslijnen = 3/5 van deel 3/7

    let y1 = height/2 * 3/7;
    let y2 = height/2 + y1;
    let margin = width/30;

    ctx.moveTo(0+margin, y1);
    ctx.lineTo(width/2-margin, y1);
    ctx.moveTo(width/2+margin, y1);
    ctx.lineTo(width-margin, y1);

    ctx.moveTo(0+margin, y2);
    ctx.lineTo(width/2-margin, y2);
    ctx.moveTo(width/2+margin, y2);
    ctx.lineTo(width-margin, y2);

    let aX = width/2 * 3/5;
    let aXspace = (width/2-aX) / 4;

    const drawAddress = (x,y,xSpace, m, yOffset=0) => {
      ctx.moveTo(x, yOffset+m);
      ctx.lineTo(x, yOffset+y-m);
      ctx.moveTo(x+xSpace, yOffset+m);
      ctx.lineTo(x+xSpace, yOffset+y-m);
      ctx.moveTo(x+xSpace+xSpace, yOffset+m);
      ctx.lineTo(x+xSpace+xSpace, yOffset+y-m);
    }

    drawAddress(aX, y1, aXspace, margin);
    drawAddress(aX+width/2, y1, aXspace, margin);
    drawAddress(aX, y1, aXspace, margin, height/2);
    drawAddress(aX+width/2, y1, aXspace, margin, height/2);
    // drawAddress(aX+width/2, y2, aXspace, margin);

    aX = aX + width/2;

  }

module.exports.reorigin = reorigin;
module.exports.drawSingle = drawSingle;
module.exports.drawDouble = drawDouble;
module.exports.drawQuad = drawQuad;
module.exports.drawOct = drawOct;
module.exports.drawQuadCutLines = drawQuadCutLines;
module.exports.drawQuadAddressLines = drawQuadAddressLines;
module.exports.drawOffsetQuad = drawOffsetQuad;
module.exports.drawQuadQuad = drawQuadQuad;
module.exports.drawFourColumnsTwoRowsPortrait = drawFourColumnsTwoRowsPortrait;
module.exports.drawTwoColumnsFourRowsLandscape = drawTwoColumnsFourRowsLandscape;
module.exports.drawSixColumnsTwoRowsPortrait = drawSixColumnsTwoRowsPortrait;
module.exports.drawColumnsRowsPortrait = drawColumnsRowsPortrait;
module.exports.prepareColumnsRowsPortrait = prepareColumnsRowsPortrait;
module.exports.drawColumnsRowsLandscape = drawColumnsRowsLandscape;
module.exports.drawCutlines = drawCutlines;
module.exports.addSeedText = addSeedText;