function getRandomInt(max) {
	let x = Math.floor(Math.random() * Math.floor(max));
	//console.log(x);
	return x;
}

const random = (min, max) => Math.random() * (max - min) + min;

function getRandomBitMask(flags) {
	let result = 0;

	for (let f = 0; f < flags; f++) {
		if (getRandomInt(2) > 0) result = result | Math.pow(2,f);
	}

	return result;
}

var flags = {
	one: Math.pow(2,0),
	two: Math.pow(2,1),
	three: Math.pow(2,2),
	four: Math.pow(2,3),
	five: 16,
	six: 32,
	seven: 64,
	eight: 128,
	nine: 256,
	ten: 512,
	eleven: 1024,
    twelve: 2048,
    13: 4096,
    14: 8192,
    15: Math.pow(2,14),
    16: Math.pow(2,15),
    17: Math.pow(2,16),
    18: Math.pow(2,17),
    19: Math.pow(2,18),
}

module.exports.getRandomInt = getRandomInt;
module.exports.getRandomBitMask = getRandomBitMask;
module.exports.flags = flags;
module.exports.random = random;