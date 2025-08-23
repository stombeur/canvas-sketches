const QRCode = require ('qrcode-svg');

export class QR {
    qrcode
    pixels

    constructor(content, pixels) {
        this.qrcode = new QRCode({
            content,
            padding: 0,
            width: pixels,
            height: pixels,
            color: '#000000',
            background: '#ffffff',
            ecl: "L",
            join: false,
            predefined: false
          });
        this.pixels = pixels;
    }

    toLines(topleftcorner, qrCodeWidth, penWidth) {
        //let overlap = true;
        let qrData = this.qrcode.qrcode.modules;
        const lines = [];
        const visited = new Array(qrData.length)
                            .fill(0)
                            .map(() => new Array(qrData[0].length).fill(false));
        const width = qrData[0].length;
        const height = qrData.length;
        
        const stepcorrection =  penWidth / 2;
        let step = qrCodeWidth / width;

        console.log({width, height, visited, qrCodeWidth, penWidth, step, stepcorrection, pixels: this.pixels})
    
        function visitRow(visited, y, startX, endX) {
            for (let x = startX; x <= endX; x++) {
                visited[y][x] = true;
            }
        }
    
        function visitColumn(visited, x, startY, endY) {
            for (let y = startY; y <= endY; y++) {
                visited[y][x] = true;
            }
        }

        function addLine(line) {
            lines.push([
                [topleftcorner[0] + line[0][0], topleftcorner[1] + line[0][1]],
                [topleftcorner[0] + line[1][0], topleftcorner[1] + line[1][1]]
            ]);
        }

        // Scan horizontally
        for (let y = 0; y < height; y++) {
            let startX = null;
            for (let x = 0; x < width; x++) {
                if (qrData[y][x] && startX === null) {
                    startX = x;
                } else if ((!qrData[y][x] || x === width - 1) && startX !== null) {
                    const endX = qrData[y][x] ? x : x - 1;
                    if (startX !== endX) {
                        addLine([
                            [startX  * step + stepcorrection, 
                            y  * step + stepcorrection],
                            [(endX + 1)  * step - stepcorrection, 
                            y  * step + stepcorrection]]
                        )
                        visitRow(visited, y, startX, endX);
                    }
                    startX = null;
                }
            }
        }

        // Scan vertically
        for (let x = 0; x < width; x++) {
            let startY = null;
            for (let y = 0; y < height; y++) {
                if (qrData[y][x] && startY === null) {
                    startY = y;
                } else if (
                    (!qrData[y][x] || y === height - 1) &&
                    startY !== null
                ) {
                    const endY = qrData[y][x] ? y : y - 1;
                    if (startY !== endY) {
                        addLine([[x  * step + stepcorrection,
                                    startY  * step + stepcorrection],
                                    [x  * step + stepcorrection,
                                    (endY + 1)  * step - stepcorrection]]);
                        visitColumn(visited, x, startY, endY);
                    }
                    startY = null;
                }
            }
        }

        // Scan for all single black pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (qrData[y][x] && !visited[y][x]) {
                    addLine([[x  * step + stepcorrection,
                               y  * step + stepcorrection],
                                [x  * step + step - stepcorrection,
                                y  * step + stepcorrection]]);
                }
            }
        }

        return lines;
    }
}
