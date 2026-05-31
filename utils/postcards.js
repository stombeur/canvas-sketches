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

  const prepareColumnsRowsPortrait = (width, height, columns = 2, rows = 2, seeds = undefined) => {
    // return a list of { origin, width, height, index }
    let index = 0;
    let result = [];

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        
        let posX = c * (width / columns);
        let posY = r * (height / rows);
        
       // f([posX,posY], width/columns, height/rows, {...opt, ...opt2});
       /*
        let center = [card.origin[0]+card.width/2, card.origin[1]+ card.height/2];
        card.center = center;
        card.grid = createGrid(columns, rows)
        card.margin = margin
        card.left = card.origin[0]
        card.right = card.origin[0] + card.width
        card.top = card.origin[1]
        card.bottom = card.origin[1] + card.height
       */

        result.push(
          {
            index,
            origin: [posX,posY],
            center: [posX+width/columns/2, posY+height/rows/2],
            width: width/columns,
            height: height/rows,
            left: posX,
            right: posX + width/columns,
            top: posY,
            bottom: posY + height/rows,
          }
        );

        index++;
      }
    }

    if (!seeds || !seeds.seedvalues) { seeds = {seedvalues: []}; }

    for (let i = 0; i < result.length; i++) {
      if (seeds.seedvalues.length < result.length || !seeds.seedvalues[i]) { seeds.seedvalues[i] = random.getRandomSeed(); }
      result[i].seed = seeds.seedvalues[i];
    }

    console.log("seeds", JSON.stringify(seeds))

    return result;
  }

const prepareCards = (columns = 2, rows = 2, seeds = undefined) => {
    let index = 0;
    let result = [];

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {

        result.push(
          {
            index
          }
        );

        index++;
      }
    }

    if (!seeds || !seeds.seedvalues) { seeds = {seedvalues: []}; }
    for (let i = 0; i < result.length; i++) {
      if (seeds.seedvalues.length < result.length || !seeds.seedvalues[i]) { seeds.seedvalues[i] = random.getRandomSeed(); }
      result[i].seed = seeds.seedvalues[i];
    }

    console.log("seedvalues:", JSON.stringify(seeds.seedvalues));

    return result;
  }

    const drawCards = (f, width, height, columns = 2, rows = 2, cards) => {
    let cardIndex = 0;

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = c * (width / columns);
        let posY = r * (height / rows);

        let card = cards[cardIndex];
        card.origin = [posX,posY];
        card.center = [posX+width/columns/2, posY+height/rows/2];
        card.width = width/columns;
        card.height = height/rows;
        card.left = posX;
        card.right = posX + width/columns;
        card.top = posY;
        card.bottom = posY + height/rows;

        f(card);
        cardIndex++;
      }
    }
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
    opt = {fontsize: 3, fontfamily: 'sans-serif', ...opt};
    let i = 0;
    let result = [];
    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = (opt.offset || 0) + c * (width / columns);
        let posY = -(opt.offset || 0) + (r+1) * (height / rows);

        let seed = opt.seeds[i];
        
        result.push({
          pos: [posX,posY],
          text: "" + seed,
          fontsize: opt.fontsize,
          fontfamily: opt.fontfamily,
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

  const drawCutlines = (input_width, input_height, rows, columns, offset = 0.1) => {
    let l = input_width / 100;
    let paths = [];

    let width = input_width - offset;
    let height = input_height - offset;

    let z = offset;

    // add corners first
    paths.push(createLinePath([[z,z],[z, l+z]]));
    paths.push(createLinePath([[z,z],[l+z, z]]));

    paths.push(createLinePath([[width,z],[width, l+z]]));
    paths.push(createLinePath([[width,z],[width-l, z]]));

    paths.push(createLinePath([[z,height],[z, height-l]]));
    paths.push(createLinePath([[z,height],[l, height]]));

    paths.push(createLinePath([[width,height],[width, height-l]]));
    paths.push(createLinePath([[width,height],[width-l, height]]));

    //left
    let h = input_height/rows;
    for (let i = 1; i < rows; i++) {
      paths.push(createLinePath([[z,h*i],[l, h*i]]));
      paths.push(createLinePath([[z,h*i - l],[z, h*i + l]]));
    }

    //right
    for (let i = 1; i < rows; i++) {
      paths.push(createLinePath([[width,h*i],[width-l, h*i]]));
      paths.push(createLinePath([[width,h*i - l],[width, h*i + l]]));
    }

    //top
    let w = input_width/columns;
    for (let i = 1; i < columns; i++) {
      paths.push(createLinePath([[w*i, z],[w*i, l]]));
      paths.push(createLinePath([[w*i - l,z],[w*i + l, z]]));
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

  const drawSeparateLayerCutlines = (width, height, rows, columns) => {
    let l = width / 100;
    let pathsPerPart = [];

    for (let r = 0; r <= (rows-1); r++) {
      for (let c = 0; c <= (columns-1); c++) {
        let posX = c * (width / columns);
        let posY = r * (height / rows);
        
        let paths = [];
        paths.push(createLinePath([[posX,posY],[posX, posY+l]]));
        paths.push(createLinePath([[posX,posY],[posX+l, posY]]));

        paths.push(createLinePath([[posX + width/columns, posY],[posX + width/columns, posY+l]]));
        paths.push(createLinePath([[posX + width/columns, posY],[posX + width/columns-l, posY]]));

        paths.push(createLinePath([[posX, posY + height/rows],[posX, posY + height/rows-l]]));
        paths.push(createLinePath([[posX, posY + height/rows],[posX+l, posY + height/rows]]));

        paths.push(createLinePath([[posX + width/columns, posY + height/rows],[posX + width/columns, posY + height/rows-l]]));
        paths.push(createLinePath([[posX + width/columns, posY + height/rows],[posX + width/columns-l, posY + height/rows]]));

        pathsPerPart.push(paths);
      }
    }

    return pathsPerPart;
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
module.exports.drawSeparateLayerCutlines = drawSeparateLayerCutlines;
module.exports.drawCards = drawCards;
module.exports.prepareCards = prepareCards;