export const corners = (x, y, side, padding) => {
    let zeroCorner = [x + padding, y + padding],
    oneCorner = [x + side - padding, y + padding],
    twoCorner = [x + side - padding, y + side - padding],
    threeCorner = [x + padding, y + side - padding];

    return [zeroCorner, oneCorner, twoCorner, threeCorner];
}

export const startAngles = () => {
    let result = [];
    for (let i = 0; i < 4; i++) {
        result.push(i * 90);
    }
    return result;
}

export const startAngle = (corner) => {
   return corner * 90;
}

export const startAngleOpposing = (corner) => {
    return ((corner * 90) + 180) % 360;
    // switch(corner) {
    //     case 0:
    //         return 180;
    //     case 1:
    //         return 270;
    //     case 2:
    //         return 0;
    //     case 3:
    //         return 90;
    // }
}