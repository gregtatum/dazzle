var SeedRandom = require('seedrandom')
var _ = require('lodash')

function float( random, min, max ) {
  return random() * (max - min) + min
}

function floatLow( random, min, max ) {
	//More likely to return a low value
  return random() * random() * (max - min) + min
}

function floatHigh( random, min, max ) {
	//More likely to return a high value
	return (1 - random() * random()) * (max - min) + min
}

function int( random, min, max ) {
	return Math.floor( float( random, min, max + 1 ) )
}

function intLow( random, min, max ) {
	return Math.floor( floatLow( random, min, max + 1 ) )
}

function intHigh( random, min, max ) {
	return Math.floor( floatHigh( random, min, max + 1 ) )
}

module.exports = function seedRandom( seed ) {
	
	var random = SeedRandom( seed )
	
	return {
		unit      : random,
		float     : _.partial( float, random ),
		floatLow  : _.partial( floatLow, random ),
		floatHigh : _.partial( floatHigh, random ),
		int       : _.partial( int, random ),
		intLow    : _.partial( intLow, random ),
		intHigh   : _.partial( intHigh, random ),
	}
}