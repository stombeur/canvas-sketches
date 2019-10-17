function getRandomInt(max, min = 0) {
	let x = min + Math.floor(Math.random() * Math.floor(max));
	return x;
}

function getRandom(max, min=0) {
	//let x = min + (Math.random() * (max - min + 1) + min);
	let x = min + (Math.random() * max);
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

const shuffle = (array) => {
	var currentIndex = array.length, temporaryValue, randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
  }

module.exports.getRandomInt = getRandomInt;
module.exports.getRandom = getRandom;
module.exports.getRandomBitMask = getRandomBitMask;
module.exports.flags = flags;
module.exports.random = random;
module.exports.shuffle = shuffle;