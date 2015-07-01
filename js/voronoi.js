var _ = require('lodash')
var CreateVoronoiDiagram = require("voronoi-diagram")
var CreateSvgEl = require('./utils/svg-el')

function _diagramToLines( diagram ) {
	
	return _.map(diagram.cells, function( cell ) {
		
		var finiteCell = _.filter(cell, function(index) {
			return index >= 0
		})
		
		var line = _.map(finiteCell, function( index ) {
			return diagram.positions[index]
		})
	
		line.push( line[0] )
		
		return line
	})
}

function _drawCells( diagram, $svg ) {
	
	var lines = _diagramToLines( diagram )
	
	_.each(lines, function( line ) {
		
		var $polyline = $( CreateSvgEl('polyline') )
	
		$polyline.css({
			fill: "none",
			stroke: "black",
			"stroke-width": "1.5"
		})
	
		var pointsString = _.map( line, function( point ) {
			return Math.floor(point[0]) + "," + Math.floor(point[1])
		})
		.join(" ")
	
		$polyline.attr({
			"stroke-linejoin" : "round",
			points: pointsString
		})
	
		$svg.append( $polyline )
	})
}

function _generatePoints( count, width, height, overdraw ) {
	
	var overdrawWidth = overdraw * width
	var overdrawHeight = overdraw * height
	
	return _.times(count, function() {
		
		return [
			_.random( -overdrawWidth,  width  + overdrawWidth  ),
			_.random( -overdrawHeight, height + overdrawHeight )
		]
	})
}

module.exports = function() {
	
	var $svg = $('svg')
	var svg = document.getElementById('svg')

	var points = _generatePoints( 30, $svg.width(), $svg.height(), 1 )

	var diagram = CreateVoronoiDiagram(points)
	
	_drawCells( diagram, $svg )
	
}