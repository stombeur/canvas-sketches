const random = require('canvas-sketch-util/random');
const util = require('node:util')

const {
  values: { iterations },
} = util.parseArgs({
  options: {
    iterations: {
      type: "string",
      short: "i",
      default: '1000'
    },
  },
});

// const testNeighbors = (r, c, grid) => {
//     let sum = 0;
//     //left
//     if (c > 0) sum += grid[r][c-1];
//     // topleft
//     if (c > 0 && r > 0) sum += grid[r-1][c-1]; 
//     //top
//     if (r > 0) sum += grid[r-1][c];
//     //topright
//     if (c < grid[r].length - 1 && r > 0) sum += grid[r-1][c+1]; 
//     //right
//     if (c < grid[r].length - 1) sum += grid[r][c+1];
//     //bottomright
//     if (r < grid.length - 1 && c < grid[r].length -1) sum += grid[r+1][c+1]; 
//     //bottom 
//     if (r < grid.length - 1) sum += grid[r+1][c];
//     //bottomleft
//     if (r < grid.length - 1 && c > 0) sum += grid[r+1][c-1]; 
//     return sum;
// }

// const countNeighbours = (r, c, grid, check = 2) => {
//     let nr = 0;
//     //left
//     if (c > 0) nr += (grid[r][c-1] === check) ? 1 : 0;
//     // topleft
//     //if (c > 0 && r > 0) sum += grid[r-1][c-1]; 
//     //top
//     if (r > 0) nr += (grid[r-1][c] === check) ? 1 : 0;
//     //topright
//     //if (c < grid[r].length - 1 && r > 0) sum += grid[r-1][c+1]; 
//     //right
//     if (c < grid[r].length - 1) nr += (grid[r][c+1] === check) ? 1 : 0;
//     //bottomright
//    // if (r < grid.length - 1 && c < grid[r].length -1) sum += grid[r+1][c+1]; 
//     //bottom 
//     if (r < grid.length - 1) nr += (grid[r+1][c] === check) ? 1 : 0;
//     //bottomleft
//     //if (r < grid.length - 1 && c > 0) sum += grid[r+1][c-1]; 
//     return nr;
// }

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

let columns = 20, rows = 20;

let grid = Array.from({length: rows}, (_, i) => Array.from({length: columns}, (_, i) => 0));
//let coeff = 0;

//let nrOfIterations = Number(iterations);

console.log('')

for (let i = 0; i < 25; i++) {

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



console.log('\n');

for (let r = 0; r < rows; r++)
{
    row = ''
    for (let c = 0; c < columns; c++) {
        row += `${grid[r][c]} `
    }
    console.log(row)
}

console.log('')

for (let r = 0; r < rows; r++)
{
    row = ''
    for (let c = 0; c < columns; c++) {
        let charCode = grid[r][c] > 0 ? 9619 : 32;
        row += `${String.fromCharCode(charCode)}`
    }
    console.log(row)
}

console.log('')

// let grid_sum = 0;
// for (let r = 0; r < rows; r++)
// {
//     row = ''
//     for (let c = 0; c < colums; c++) {
//         row += `${testNeighbors(r, c, grid)} `
//     }
//     console.log(row)
// }


