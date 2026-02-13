
const getWindingOrder = (points) => {
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        sum += (next.x - curr.x) * (next.y + curr.y);
    }
    return sum > 0 ? 1 : -1;
}

const getInsetDistance = (points, percentage) => {
    const xs = points.map(p => p.x);
    const width = Math.max(...xs) - Math.min(...xs);
    // 5% from each side = 10% total width reduction
    return (width * percentage) / 2;
}

export const insetPolygon = (points, percentage) => {
    // 1. Get Winding (CW = 1, CCW = -1)
    const winding = getWindingOrder(points);

    const distance = getInsetDistance(points, percentage);

    // 2. To SHRINK:
    // If CW (1), we need negative distance to go inward.
    // If CCW (-1), we need positive distance to go inward.
    // Therefore: actualDist = distance * -winding;
    const actualDist = distance * -winding;

    const result = [];
    const len = points.length;

    for (let i = 0; i < len; i++) {
        const curr = points[i];
        const prev = points[(i - 1 + len) % len];
        const next = points[(i + 1) % len];

        // Edge vectors
        const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };

        const l1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
        const l2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;

        // Normal vectors (Rotated 90 degrees CCW)
        const n1 = { x: -v1.y / l1, y: v1.x / l1 };
        const n2 = { x: -v2.y / l2, y: v2.x / l2 };

        // Average of the two normals (The Bisector)
        let bisectorX = n1.x + n2.x;
        let bisectorY = n1.y + n2.y;
        let bLen = Math.sqrt(bisectorX * bisectorX + bisectorY * bisectorY);
        
        if (bLen < 0.0001) { 
            // Handle collinear points: just use the normal of the edge
            bisectorX = n1.x;
            bisectorY = n1.y;
            bLen = 1;
        }

        bisectorX /= bLen;
        bisectorY /= bLen;

        // Mitre calculation to maintain distance from edges
        const dot = n1.x * n2.x + n1.y * n2.y;
        
        // Safety: Limit the mitre length for extremely sharp angles 
        // to prevent "infinite spikes"
        const mitreLimit = 4; 
        let mitreMag = 1 / Math.sqrt((1 + dot) / 2);
        if (mitreMag > mitreLimit) mitreMag = mitreLimit;

        result.push({
            x: curr.x + bisectorX * actualDist * mitreMag,
            y: curr.y + bisectorY * actualDist * mitreMag
        });
    }
    return result;
}