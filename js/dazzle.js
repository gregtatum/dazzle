var Svg = require('./utils/svg')
var _ = require('lodash')
var SeedRandom = require('./utils/random')
var Mat4 = require('gl-mat4')

function _averagePoints( points ) {
	
	var sum = _.reduce( points, function(memo, point) {
		memo[0] += point[0]
		memo[1] += point[1]
		return memo
	}, [0,0])
	
	return [
		sum[0] / points.length,
		sum[1] / points.length
	]
}

function _cellBounds( line ) {
	
	var xs = _.map( line, _.partial( _.get, _, 0 ) )
	var ys = _.map( line, _.partial( _.get, _, 1 ) )

	var top = _.min( ys )
	var right = _.max( xs )
	var bottom = _.max( ys )
	var left = _.min( xs )
	var height = bottom - top
	var width = right - left
	var diagonal = Math.sqrt(height * height + width * width)
	var centerX = (right + left) / 2
	var centerY = (top + bottom) / 2
	
	return {
		top : top,
		right : right,
		bottom : bottom,
		left : left,
		height : height,
		width : width,
		diagonal : diagonal,
		center : [centerX, centerY],
	}
}

function _matrixArrayToCssMatrix(array) {
	return "matrix3d(" + array.join(',') + ")";
}

function _rotationMatrix( theta, center ) {

	var rotate = []
	var moveBack = []
	var moveToOrigin = []
	var result = []
	
	Mat4.translate( moveBack, Mat4.create(), [center[0], center[1], 0] )
	Mat4.translate( moveToOrigin, Mat4.create(), [-center[0], -center[1], 0] )
	Mat4.rotateZ( rotate, Mat4.create(), theta )
	
	Mat4.multiply(result, moveBack, rotate)
	Mat4.multiply(result, result, moveToOrigin)
	
	return _matrixArrayToCssMatrix(result)
}

function _drawBars( bounds, config, random ) {
	
	var $g = $(Svg.create('g'))
	
	var density = config.density + random.float(-config.densityRange, config.densityRange) * 0.5
	var barCount = Math.min(50, Math.floor(bounds.diagonal / density))
	var step = bounds.diagonal / barCount
	var left = bounds.center[0] - bounds.diagonal * 0.5
	var top = bounds.center[1] - bounds.diagonal * 0.5
	
	_.times( barCount, function( i ) {
		
		var $rect = $(Svg.create('rect'))
		$rect.attr({
			x: left,
			y: top + step * i,
			width: bounds.diagonal,
			height: step * 0.5,
			style: "stroke:none; fill:rgba(0,0,0,1)"
		})
		
		var matrix = _rotationMatrix( config.rotation + random.float(0, config.rotationRange), bounds.center)
		$g.css({
			"transform" : matrix
		})
		$g.append( $rect )
	})
	
	return $g
}

function _drawCenterDots( el, center ) {
	
	var $circle = $(Svg.create('circle'))
	
	$circle.attr({
		cx : center[0],
		cy : center[1],
		r : 4,
		fill : "rgba(0,0,0,0.3)"
	})
	
	$(el).append( $circle )
}

function _drawFillColors( random, bounds, el ) {
	
	var $rect = $(Svg.create('rect'))
	
	var r = random.int(0, 255)
	var g = random.int(0, 255)
	var b = random.int(0, 255)
	
	$rect.attr({
		x: bounds.left,
		y: bounds.top,
		width: bounds.width,
		height: bounds.height,
		style: "stroke:none; fill:rgba("+r+","+g+","+b+",0.3)"
	})
	$(el).append( $rect )
}

module.exports = function dazzleFn( props ) {
	
	var config = _.extend({
		variation : 0,
		density : 100,
		densityRange : 5,
		rotation : Math.PI * 0.2,
		rotationRange : Math.PI * 0.2
	}, props)

	var random = SeedRandom( "Dazzle" + props.variation )
	
	return function dazzle( [el, line, center] ) {
		
		var bounds = _cellBounds( line )
		
		// _drawFillColors( random, bounds, el )
		var bars = _drawBars( bounds, config, random )
		
		$(el).append( bars )
		// _drawCenterDots( el, center )
		
	}
}