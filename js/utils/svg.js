var _ = require('lodash')

module.exports = {
	
	// jQuery can't create SVG elements
	create : function(tagName) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName)
	},
	
	// Create a d attribute for a path from points
	pathD : function( points ) {
	
		return _.reduce( points, function( memo, point, i ) {
		
			var prefix = i === 0 ? "M" : "L"
		
			return memo + " " + prefix + point[0] + " " + point[1]
		}, "")
	},

	// Create a points attribute for a polyline from points
	points : function( points ) {
		
		return _.map( points, function( point ) {
			return Math.floor(point[0]) + "," + Math.floor(point[1])
		})
		.join(" ")
	}
		
	
}