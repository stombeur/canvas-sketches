const floodfill = require('./floodfill');

let rows = 60;
let columns = 100;
let grid = floodfill(rows, columns, {iterations: 1000, weights: { count2s: 0, countMores: 0, countAdjacent: 1 }});

for (let r = 0; r < rows; r++)
{
    let row = ''
    for (let c = 0; c < columns; c++) {
        let charCode = grid[r][c][0] > 0 ? 9619 : 32;
        row += `${String.fromCharCode(charCode)}`
    }
    console.log(row)
}