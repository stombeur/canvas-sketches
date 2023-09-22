const random = require('canvas-sketch-util/random');

const dostep = (x,y) => {
    let dir = random.rangeFloor(0,4);
    switch(dir) {
        case 0:
            return [x, y-1];
        case 1:
            return [x+1, y];
        case 2:
            return [x, y+1];
        default:
            return [x-1, y];
    }
}

const trystep = (x,y, grid) => {
    let next = [x,y];
    let trynext = [x,y];
    for (let i = 0; i < 4; i++) {
        trynext = dostep(x,y);
        if (trynext[0] < grid[0].length && trynext[0] >= 0 
            && trynext[1] < grid.length && trynext[1] >= 0
            && grid[trynext[1]][trynext[0]] == 0
            ) return trynext;
    }
    return next;
}

const snakefill = (rows, columns, 
                       o) => {

    let options = {
                ...{ iterations:10, 
                    }, 
                    ...o
                }
    
    let grid = Array.from({length: rows}, (_, i) => Array.from({length: columns}, (_, i) => 0));
    
    
    for (let i = 0; i < options.iterations; i++) {

        let start = [random.rangeFloor(0, columns), random.rangeFloor(0, rows)];
        if (grid[start[1]][start[0]] == 1) continue;
        let step = [start[0], start[1]];
        grid[start[1]][start[0]] = 1;
        let hasnext = true;
        do {
            let next = trystep(step[0], step[1], grid);
            grid[next[1]][next[0]] = 1;
            if (next[0] == step[0] && next[1] == step[1]) hasnext = false;
            step = next;
        } while (hasnext);

    }

    return grid;
}

module.exports = snakefill;