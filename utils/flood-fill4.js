const snakefill = require('./snakefill');

let rows = 20;
let columns = 20;
let grid = snakefill(rows, columns, {iterations: 20});

for (let r = 0; r < rows; r++)
{
    let row = ''
    for (let c = 0; c < columns; c++) {
        let charCode = grid[r][c] > 0 ? 9619 : 32;
        row += `${String.fromCharCode(charCode)}`
    }
    console.log(row)
}