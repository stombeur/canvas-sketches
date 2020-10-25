export class ribbon {
    constructor(lines) {
        if (lines && Array.isArray(lines)){
            this.lines = lines;
        }
    }

    lines = [];
    get left() {
        return this.lines[0];
    }
    get right() {
        return this.lines[this.lines.length-1];
    }
}