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

const testNeighbors = (r, c, grid) => {
    let sum = 0;
    //left
    if (c > 0) sum += grid[r][c-1];
    // topleft
    if (c > 0 && r > 0) sum += grid[r-1][c-1]; 
    //top
    if (r > 0) sum += grid[r-1][c];
    //topright
    if (c < grid[r].length - 1 && r > 0) sum += grid[r-1][c+1]; 
    //right
    if (c < grid[r].length - 1) sum += grid[r][c+1];
    //bottomright
    if (r < grid.length - 1 && c < grid[r].length -1) sum += grid[r+1][c+1]; 
    //bottom 
    if (r < grid.length - 1) sum += grid[r+1][c];
    //bottomleft
    if (r < grid.length - 1 && c > 0) sum += grid[r+1][c-1]; 
    return sum;
}

const countNeighbours = (r, c, grid, check = 2) => {
    let nr = 0;
    //left
    if (c > 0) nr += (grid[r][c-1] === check) ? 1 : 0;
    // topleft
    //if (c > 0 && r > 0) sum += grid[r-1][c-1]; 
    //top
    if (r > 0) nr += (grid[r-1][c] === check) ? 1 : 0;
    //topright
    //if (c < grid[r].length - 1 && r > 0) sum += grid[r-1][c+1]; 
    //right
    if (c < grid[r].length - 1) nr += (grid[r][c+1] === check) ? 1 : 0;
    //bottomright
   // if (r < grid.length - 1 && c < grid[r].length -1) sum += grid[r+1][c+1]; 
    //bottom 
    if (r < grid.length - 1) nr += (grid[r+1][c] === check) ? 1 : 0;
    //bottomleft
    //if (r < grid.length - 1 && c > 0) sum += grid[r+1][c-1]; 
    return nr;
}

let colums = 100, rows = 60;

let grid = [];
let coeff = 0;

let nrOfIterations = Number(iterations);

console.log('')
for (let i = 0; i < nrOfIterations; i++) {
    let newgrid = []
    let testgrid = [];
    let newfills = 0;
    let newnrof2s = 0;
    let newnrofmore = 0;
    let newnrof1s = 0;
    let newnrof0s = 0;
    random.permuteNoise();
    for (let r = 0; r < rows; r++)
    {
        row = [];
        for (let c = 0; c < colums; c++) {
            //row.push(random.boolean() ? 1 : 0);
            rnd = random.noise2D(c, r, 1, 1);
            row.push(rnd >= 0.2 ? 1 : 0);
        }
        newgrid.push(row);
    }

    for (let r = 0; r < rows; r++)
    {
        row = [];
        for (let c = 0; c < colums; c++) {
            let v = testNeighbors(r, c, newgrid)
            newfills += newgrid[r][c];
            row.push(v)
            if (v === 2) newnrof2s++;
            if (v > 2) newnrofmore++;
            if (v === 1) newnrof1s++;
            if (v === 0) newnrof0s++;
        }
        testgrid.push(row)
    }

    count = 0;
    for (let r = 0; r < rows; r++)
    {
        for (let c = 0; c < colums; c++) {
            let v = countNeighbours(r, c, testgrid)
            count += v;
        }
    }

    let newcoeff = 5 * newfills
                // + 2 * newnrof2s
                // + 3 * count
                // - ( 2 * newnrofmore )
                 - ( 1 * newnrof1s )
                 - ( 1 * newnrof0s )

    if (newcoeff > coeff) {
        grid = newgrid;
        coeff = newcoeff;
    }

    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line
    process.stdout.write(`${i.toString().padStart(1+(nrOfIterations%10), ' ')} / ${nrOfIterations} coeff=${coeff}`);
    
}
console.log('\n');

for (let r = 0; r < rows; r++)
{
    row = ''
    for (let c = 0; c < colums; c++) {
        row += `${grid[r][c]} `
    }
    console.log(row)
}

console.log('')

for (let r = 0; r < rows; r++)
{
    row = ''
    for (let c = 0; c < colums; c++) {
        let charCode = grid[r][c] > 0 ? 9619 : 32;
        row += `${String.fromCharCode(charCode)}`
    }
    console.log(row)
}

console.log('')

let grid_sum = 0;
for (let r = 0; r < rows; r++)
{
    row = ''
    for (let c = 0; c < colums; c++) {
        row += `${testNeighbors(r, c, grid)} `
    }
    console.log(row)
}


