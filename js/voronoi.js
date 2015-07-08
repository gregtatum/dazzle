var _ = require('lodash')
var CreateVoronoiDiagram = require("voronoi-diagram")
var Svg = require('./utils/svg')
var SeedRandom = require('./utils/random')

var _createClipGroup = (function() {

	var clipGroupId = 0
	
	return function createClipGroup( random, cellLines ) {
	
		// <defs>
		//     <clipPath id="voronoiClipPath4">
		//         <path points="..." />
		//     </clipPath>
		// </defs>
		//
		// <g style="clip-path: url(#voronoiClipPath4);">
		//     <rect x="5" y="5" width="190" height="90" style="stroke: none; fill:#00ff00;"/>
		// </g>
	
		var $defs     = $(Svg.create('defs'))
		var $clipPath = $(Svg.create('clipPath'))
		var $path     = $(Svg.create('path'))
	
		var $g        = $(Svg.create('g'))
	
		$defs.append( $clipPath )
		$clipPath.append( $path )
		$g.append( $defs )
	
		var id = "voronoiClipPath" + clipGroupId++
		$clipPath.attr('id', id)
		$g.css("clip-path", "url(#"+id+")")
	
		$path.attr({
			d: Svg.pathD( cellLines )
		})
		
		return $g[0]
	}
})()

function _diagramToCellLines( diagram ) {
	
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

function _drawClipGroups( random, lines, $svg ) {
	
	var els = _.map( lines, _.partial( _createClipGroup, random ) )
	
	_.each( els, function( el ) {
		$svg.append(el)
	})
	
	return els
}

function _drawCells( lines, $svg ) {
	
	_.each(lines, function( line ) {
		
		var $polyline = $( Svg.create('polyline') )
	
		$polyline.css({
			fill: "none",
			stroke: "black",
			"stroke-width": "1.5"
		})
	
		$polyline.attr({
			"stroke-linejoin" : "round",
			points: Svg.points( line )
		})
	
		$svg.append( $polyline )
	})
}

function _generateCenters( random, count, width, height, overdraw ) {
	
	var overdrawWidth = overdraw * width
	var overdrawHeight = overdraw * height
	
	return _.times(count, function() {
		
		return [
			random.float( -overdrawWidth,  width + overdrawWidth  ),
			random.float( -overdrawHeight, height + overdrawHeight )
		]
	})
}

function _dropOutOfRangeLines( lines, centers, width, height, overdraw ) {
	
	var overdrawBounded = Math.max( overdraw, 0 )
	var overdrawWidth = overdrawBounded * width
	var overdrawHeight = overdrawBounded * height
	
	var result = _.filter( _.zip( lines, centers ), function( arr ) {
		
		var line = arr[0]
		var center = arr[1]
		
		var xs = _.pluck( line, 0 )
		var ys = _.pluck( line, 1 )
		var minX = _.min( xs )
		var maxX = _.max( xs )
		var minY = _.min( ys )
		var maxY = _.max( ys )

		return (
			maxX <= width + overdrawWidth &&
			maxY <= height + overdrawHeight &&
			minX >= -overdrawWidth &&
			minY >= -overdrawHeight
		)
	})
	
	return _.unzip( result )
}

module.exports = function( props, dazzle ) {
	
	var config = _.extend({
		scale : 2,
		count : 200
	}, props)
	
	var random = SeedRandom( "Voronoi" + props.variation )
	var $svg = $('svg')
	var svg = document.getElementById('svg')

	var allCenters = _generateCenters(
		random,
		config.count,
		$svg.width(),
		$svg.height(),
		config.scale
	)

	var diagram = CreateVoronoiDiagram(allCenters)
	var allLines = _diagramToCellLines( diagram )
	
	var [lines, centers] = _dropOutOfRangeLines(
		allLines,
		allCenters,
		$svg.width(),
		$svg.height(),
		config.scale
	)
	
	// _drawCells( lines, $svg )
	var groups = _drawClipGroups( random, lines, $svg )
	
	_.each( _.zip(groups, lines, centers), dazzle )
}