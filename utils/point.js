export class point extends Array {
    constructor(...items) {
        if (items.length < 2) { super(2); }
        else { super(...items); }
    }
    
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
    set x(value) {
        this[0] = value;
    }
    set y(value) {
        this[1] = value;
    }

    rotate(center, angle) {
        if (angle === 0) return this;
      
        if (!center) { throw Error('center is null'); }
      
        let radians = (Math.PI / 180) * angle,
            x = this[0], 
            y = this[1], 
            cx = center[0], 
            cy = center[1], 
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = cos * (x - cx) - sin * (y - cy) + cx,
            ny = cos * (y - cy) + sin * (x - cx) + cy;
      
        return new point(nx, ny);
      };
}