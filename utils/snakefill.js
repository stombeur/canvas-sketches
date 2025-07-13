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
                     mergetree: false,
                     othergrid: treeGrid
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

    if (options.mergetree) {
        //create a deep copy of the treeGrid
        let deepGrid = JSON.parse(JSON.stringify(options.othergrid));
        return mergegrids(grid, deepGrid);
    }

    return grid;
}

const mergegrids = (grid, tree) => {
    let result = [];

    if (grid.length > tree.length) {
        // determine the difference in length
        // add a random amount of rows to the top and bottom, at least one each
        let diff = grid.length - tree.length;
        random.setSeed(random.getRandomSeed());
        let top = random.rangeFloor(1, diff);
        let bottom = diff - top;
                for (let i = 0; i < top; i++) {
            tree.unshift(Array.from({length: tree[0].length}, (_, i) => 0));
        }
        for (let i = 0; i < bottom; i++) {
            tree.push(Array.from({length: tree[0].length}, (_, i) => 0));
        }
    }

    if (grid[0].length > tree[0].length) {
        // determine the difference in length
        // add a random amount of rows to the top and bottom, at least one each
        let diff = grid[0].length - tree[0].length;
        random.setSeed(random.getRandomSeed());
        let left = random.rangeFloor(1, diff);
        let right = diff - top;

        for (let i = 0; i < tree.length; i++) {
            for (let j = 0; j < left; j++) {
                tree[i].unshift(0);
            }
            for (let j = 0; j < right; j++) {
                tree[i].push(0);
            }
        }
    }

    for (let i = 0; i < grid.length; i++) {
        let row = [];
        for (let j = 0; j < grid[i].length; j++) {
            if (tree[i][j] == 1) row.push(1);
            else if (tree[i][j] == 2) row.push(0);
            else row.push(grid[i][j]);
        }
        result.push(row);
    }
    return result;
}

const treeGrid = [
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,1,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,1,1,1,2,0,0,0,0,0],
    [0,0,0,0,2,1,1,1,1,1,2,0,0,0,0],
    [0,0,0,0,2,2,1,1,1,2,2,0,0,0,0],
    [0,0,0,2,2,1,2,1,1,1,2,2,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,1,1,1,1,1,2,1,1,1,2,0,0],
    [0,0,0,2,2,1,1,1,1,1,2,2,0,0,0],
    [0,0,0,2,1,1,1,1,1,1,1,2,0,0,0],
    [0,0,2,1,1,2,1,1,1,1,1,1,2,0,0],
    [0,2,1,1,1,1,1,1,1,1,2,1,1,2,0],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [0,2,2,2,2,2,2,1,2,2,2,2,2,2,0],
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
];

const treeGrid2 = [
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
    [0,0,0,0,0,2,2,1,2,2,0,0,0,0,0],
    [0,0,0,0,2,2,1,1,1,2,2,0,0,0,0],
    [0,0,0,0,2,1,1,2,1,1,2,0,0,0,0],
    [0,0,0,0,2,2,1,1,1,2,2,0,0,0,0],
    [0,0,0,2,2,1,1,1,1,1,2,2,0,0,0],
    [0,0,2,2,1,1,2,1,1,1,1,2,2,0,0],
    [0,0,2,1,1,1,1,1,1,1,1,1,2,0,0],
    [0,0,2,2,2,1,1,1,2,1,2,2,2,0,0],
    [0,0,2,2,1,1,1,1,1,1,1,2,2,0,0],
    [0,2,2,1,1,2,1,1,1,1,1,1,2,2,0],
    [2,2,1,1,1,1,1,1,1,1,2,1,1,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,1,2,2,2,2,2,2,2],
    [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0],
];

const alien1Grid = [
    [0,0,0,2,2,2,0,2,2,2,0,0,0],
    [0,0,0,2,1,2,2,2,1,2,0,0,0],
    [0,0,2,2,2,1,2,1,2,2,2,0,0],
    [0,2,2,1,1,1,1,1,1,1,2,2,0],
    [2,2,1,1,2,1,1,1,2,1,1,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,2,1,1,1,1,1,1,1,2,1,2],
    [2,1,2,1,2,2,2,2,2,1,2,1,2],
    [2,2,2,2,1,1,2,1,1,2,2,2,2],
    [0,0,0,2,2,2,2,2,2,2,0,0,0],
];

const alien2Grid = [
    [0,0,0,0,0,2,2,2,0,0,0,0,0],
    [0,0,0,0,2,2,1,2,2,0,0,0,0],
    [0,0,0,2,2,1,1,1,2,2,0,0,0],
    [0,0,2,2,1,1,1,1,1,2,2,0,0],
    [0,2,2,1,1,1,1,1,1,1,2,2,0],
    [0,2,1,1,2,2,1,2,2,1,1,2,0],
    [0,2,1,1,1,1,1,1,1,1,1,2,0],
    [0,2,2,2,1,1,1,1,1,2,2,2,0],
    [0,2,2,1,2,2,1,2,2,1,2,2,0],
    [0,2,1,2,2,1,2,1,2,2,1,2,0],
    [0,2,2,2,2,2,2,2,2,2,2,2,0],
];

const alien3Grid = [
    [0,0,2,2,2,0,0,2,2,2,0,0],
    [0,0,2,1,2,2,2,2,1,2,0,0],
    [0,0,2,2,1,2,2,1,2,2,0,0],
    [0,2,2,1,1,1,1,1,1,2,2,0],
    [2,2,1,1,2,1,1,2,1,1,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,2,1,1,1,1,1,1,2,1,2],
    [2,2,2,2,1,2,2,1,2,2,2,2],
    [0,0,2,1,2,2,2,2,1,2,0,0],
    [0,0,2,2,2,0,0,2,2,2,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],

];

module.exports = {};
module.exports.snakefill = snakefill;
module.exports.treeGrid = treeGrid;
module.exports.treeGrid2 = treeGrid2;
module.exports.alien1Grid = alien1Grid;
module.exports.alien2Grid = alien2Grid;
module.exports.alien3Grid = alien3Grid;