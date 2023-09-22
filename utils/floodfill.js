const random = require('canvas-sketch-util/random');
//import 'canvas-sketch-util/random'

const countNeighbors = (r, c, grid) => {
    let sum = 0;
    //left
    if (c > 0) sum += grid[r][c-1][0];
    // topleft
    if (c > 0 && r > 0) sum += grid[r-1][c-1][0]; 
    //top
    if (r > 0) sum += grid[r-1][c][0];
    //topright
    if (c < grid[r].length - 1 && r > 0) sum += grid[r-1][c+1][0]; 
    //right
    if (c < grid[r].length - 1) sum += grid[r][c+1][0];
    //bottomright
    if (r < grid.length - 1 && c < grid[r].length -1) sum += grid[r+1][c+1][0]; 
    //bottom 
    if (r < grid.length - 1) sum += grid[r+1][c][0];
    //bottomleft
    if (r < grid.length - 1 && c > 0) sum += grid[r+1][c-1][0]; 
    return sum;
}

const countAdjacent = (r, c, grid, check = 2) => {
    let nr = 0;
    //left
    if (c > 0) nr += (grid[r][c-1][1] >= check) ? 1 : 0;
    //top
    if (r > 0) nr += (grid[r-1][c][1] >= check) ? 1 : 0;
    //right
    if (c < grid[r].length - 1) nr += (grid[r][c+1][1] >= check) ? 1 : 0;
    //bottom 
    if (r < grid.length - 1) nr += (grid[r+1][c][1] >= check) ? 1 : 0;
    return nr;
}

const floodfill = (rows, columns, 
                       o) => {

    let options = {
                ...{ iterations:1000, 
                     noise2d:true, 
                     matchAdjacent: 2,
                     removeZeroAdjacents: false,
                    }, 
                    ...o
                }
    options.weights = {...{
        fill1s: 5,
        count0s: -1,
        count1s: -1,
        count2s: 2,
        countMores: -1,
        countAdjacent: 2,
            }, ...o.weights }

    let result = [];
    let criteria = {
        fill1s: 0,
        count0s: 0,
        count1s: 0,
        count2s: 0,
        countMores: 0,
        countAdjacent: 0,
    }
    let coefficient = 0;

    for (let n = 0; n < options.iterations; n++) {
        random.setSeed(random.getRandomSeed());
        random.permuteNoise();

        let grid = [];
        // first iteration, fill with 0 or 1
        for (let r = 0; r < rows; r++)
        {
            let row = [];
            for (let c = 0; c < columns; c++) {
                let val = 0;
                if (options.noise2d) {
                    let rnd = random.noise2D(c, r, 1, 1);
                    val = rnd >= 0.2 ? 1 : 0;
                }
                else {
                    val = random.boolean() ? 1 : 0;
                }
                criteria.fill1s += val; // count 1s
                row.push([val, 0])
            }
            grid.push(row);
        }

        // second iteration, count neighbors
        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < columns; c++) {
                if (grid[r][c][0] === 0) continue;
                let v = countNeighbors(r, c, grid)
                grid[r][c][1] = v;
                
                if (v === 2) criteria.count2s++;
                if (v > 2) criteria.countMores++;
                if (v === 1) criteria.count1s++;
                if (v === 0) criteria.count0s++;
            }
        }

        // third iteration, count adjacent values (non-diagonal)
        for (let r = 0; r < rows; r++)
        {
            for (let c = 0; c < columns; c++) {
                if (grid[r][c][0] === 0) continue;
                let adj = countAdjacent(r, c, grid, options.matchAdjacent);
                if (grid[r][c][0] === 1 && adj === 0 && options.removeZeroAdjacents) {
                    //console.log(`remove ${r}-${c} 0 adjacents`)
                    grid[r][c][0] = 0;
                }
                criteria.countAdjacent += adj;
            }
        }

        // calculate coefficient
        let newcoeff = options.weights.fill1s * criteria.fill1s
                 + options.weights.count2s * criteria.count2s
                 + options.weights.countAdjacent * criteria.countAdjacent
                 + options.weights.countMores * criteria.countMores 
                 + options.weights.count1s * criteria.count1s 
                 + options.weights.count0s * criteria.count0s 

        if (newcoeff > coefficient) {
            result = grid;
            coefficient = newcoeff;
        }
    }

    return result;
}

module.exports = floodfill;