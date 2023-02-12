export class point extends Array {
    epsilon = 0.000001;
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
    
    copy(moveX = 0, moveY = 0) {
        return new point(this[0] + moveX, this[1] + moveY);
    }

    isBetween(a, b) {
        if (!a.x) { a = new point(a[0], a[1]); }
        if (!b.x) { b = new point(b[0], b[1]); }
      
        
        return ((a.x <= this.x + this.epsilon && this.x <= b.x + this.epsilon) || (a.x + this.epsilon >= this.x && this.x + this.epsilon >= b.x)) 
        && ((a.y <= this.y +this.epsilon && this.y <= b.y + this.epsilon) || (a.y + this.epsilon >= this.y && this.y + this.epsilon >= b.y));

        //return ((a.x <= this.x && this.x <= b.x) || (a.x >= this.x && this.x >= b.x)) && ((a.y <= this.y && this.y <= b.y) || (a.y >= this.y && this.y >= b.y));
      }
    
    distanceTo(other) {
        return Math.hypot(other.x-this.x, other.y-this.y);
    }

    static distanceBetween (p1, p2) {

        if (!p1.x) { p1 = point(p1[0], p1[1]); }
        if (!p2.x) { p2 = point(p2[0], p2[1]); }
      
        let dist = Math.hypot(p2.x-p1.x, p2.y-p1.y);
        return dist;
      }
}