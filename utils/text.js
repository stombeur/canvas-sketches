  
  
  export const addTextToCanvas = (text, position, opt = null) => {
    opt = {fontsize: 3, fontfamily: 'sans-serif', fontstyle: 'normal', fontweight: 'normal', bold: false, ...opt};
    // normalize boolean `bold` into `fontweight` if provided
    const fontweight = opt.fontweight || (opt.bold ? 'bold' : 'normal');
    return {
      pos: position,
      text,
      fontsize: opt.fontsize,
      fontfamily: opt.fontfamily,
      fontstyle: opt.fontstyle,
      fontweight: fontweight,
    }
  }

