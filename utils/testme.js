let max = 360
let h = [ [-56, -30], [-20, 51], [55,61], [70,88], [89,95], [107, 119]]

let overlaps = true;
while(overlaps) {
    overlaps = false;
    let swap = [];
    h.forEach((el, i, arr) =>{
        //console.log(el);
        let f = arr.filter((a, j) =>  ((a[0] >= el[0] && a[0] <= el[1] ) || (a[1] >= el[0] && a[1] <= el[1])));
       // console.log(f)
        if (f.length === 1 && swap.findIndex(x => x[0] === f[0][0] && x[1] === f[0][1]) === -1) {
            swap.push(...f)
        }
        if (f.length > 1) {
            //console.log(f)
            f.sort((a,b) => a[0] - b[0])
            let e = [Math.min(...f.map(e => e[0])), Math.max(... f.map(e=> e[1]))]
            if (swap.findIndex(x => x[0] === e[0] && x[1] === e[1]) === -1) { swap.push(e); overlaps = true;} 
        }
    }
    )

    if (!overlaps) break;
    
    swap.sort((a,b) => a[0] - b[0])
    // swap.forEach(el => {
    //     el[0] = el[0] % max;
    //     el[1] = el[1] % max;
    // })
    //console.log(h)
    //console.log(swap)
    h = swap
}

console.log(h)
