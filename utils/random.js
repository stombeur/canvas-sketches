/**
 * get a random integer value between min (incl) and max (excl)
 * @param {number} max maximum value exclusive
 * @param {number} min minimum value inclusive, default = 0
 */
const getRandomInt = (max, min = 0) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	let x = min + Math.floor(Math.random() * (max - min));
	return x;
}

/**
 * get a random integer value between min (incl) and max (incl)
 * @param {number} max maximum value inclusive
 * @param {number} min minimum value inclusive, default = 0
 */
function getRandomIntInclusive(max, min = 0) {
	min = Math.ceil(min);
	max = Math.floor(max);
	let x = min + Math.floor(Math.random() * (max - min + 1));
	return x;
}

/**
 * get a random value between min (incl) and max (excl)
 * @param {number} max maximum value exclusive
 * @param {number} min minimum value inclusive, default = 0
 */
function getRandom(max, min=0) {
	let x = min + (Math.random() * (max - min));
	return x;
}

/**
 * get a random value between min (incl) and max (incl)
 * @param {number} max maximum value inclusive
 * @param {number} min minimum value inclusive, default = 0
 */
function getRandomInclusive(max, min=0) {
	let x = min + (Math.random() * (max - min + 1));
	return x;
}

/**
 * get a random integer value where min <= x < max
 * @param {number} max maximum value exclusive
 * @param {number} min minimum value inclusive, default = 0
 */
const random = (min, max) => Math.random() * (max - min) + min;

/**
 * get a random bitmask with 'flags' number of bits
 * @param {number} flags number of bits
 */
function getRandomBitMask(flags) {
	let result = 0;

	for (let f = 0; f < flags; f++) {
		if (getRandomInt(2) > 0) result = result | Math.pow(2,f);
	}

	return result;
}

/**
 * get a bitmask for 'max' number of bits where all bits are 1
 * @param {number} max number of bits
 */
function getBitMask(max) {
	let result = 0;

	for (let f = 0; f < max; f++) {
		result = result | Math.pow(2,f);
	}

	return result;
}

const flags = {
	one: 1, //Math.pow(2,0),
	two: 4, //Math.pow(2,1),
	three: 8, //Math.pow(2,2),
	four: 16, //Math.pow(2,3),
	five: 32,
	six: 64,
	seven: 128,
	eight: 256,
	nine: 512,
	ten: 1024,
	eleven: 2048,
    twelve: 4096,
    13: 8192,
    14: Math.pow(2,14),
    15: Math.pow(2,15),
    16: Math.pow(2,16),
    17: Math.pow(2,17),
    18: Math.pow(2,18),
    19: Math.pow(2,19),
    20: Math.pow(2,20),
}

/**
 * shuffle the contents of an array in-place
 * @param {array} array the array that needs sum' shuffelin
 */
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
module.exports.getBitMask = getBitMask;