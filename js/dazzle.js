var Svg = require('./utils/svg')
var _ = require('lodash')
var SeedRandom = require('./utils/random')
var Mat4 = require('gl-mat4')
var Vec4 = require('gl-matrix').vec4
var ConsoleMatrix = require('./utils/console-matrix')
var PolygonBoolean = require('2d-polygon-boolean');

function _multiplyLine( line, matrix ) {
	return _.map(line, function( point ) {
		var homogeneousPoint = [point[0], point[1], 0, 1]
		var results = Vec4.transformMat4([], homogeneousPoint, matrix)
		return [
			results[0] / results[3],
			results[1] / results[3]
		]
	})
}

function _flipMatricesFn() {

	function identity(mat) {
		mat[0] = mat[5] = mat[10] = mat[15] = 1
		mat[1] = mat[6] = mat[11] = 0
		mat[2] = mat[7] = mat[12] = 0
		mat[3] = mat[8] = mat[13] = 0
		mat[4] = mat[9] = mat[14] = 0
		return mat
	}
	// Flip between A and B matrices in the pattern A,B,B,A,...
	var matA = identity(Array(16))
	var matB = identity(Array(16))
	var i = 0
	
	return function flipMats(reset) {
		
		if( reset ) {
			identity( matA )
			identity( matB )
			i = 0
		} else {
			var which = (i == 0 || i == 3)
			i = (i + 1) % 4
			return which ? matA : matB
		}
	}
}

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

function _clipBarsFn( center, halfLength ) {
	
	var left = center[0] - halfLength
	var right = center[0] + halfLength
	var top = center[1] - halfLength
	var bottom = center[1] + halfLength
	
	var bounds = [
		[left,top],
		[right,top],
		[right,bottom],
		[left,bottom]
	]
	
	return function clipBars( line ) {
		try {
			var result = PolygonBoolean( line, bounds, 'and' )
			if( result.length > 0 ) {
				return result[0]
			} else {
				return false
			}
			return result
		} catch (err) {
			return false
		}		
	}
}

function _transformBars( transform, bounds, rotation, line ) {
	
	var mat = transform.mat
	var height = transform.height
	var perspective = transform.perspective
	var center = bounds.center
	
	mat( true ) //reset mat flipper
	
	Mat4.translate ( mat(), mat(), [center[0], center[1], 0] ) // to final position
	Mat4.scale     ( mat(), mat(), [height,height,height] )    // scale back from clip space
	Mat4.multiply  ( mat(), mat(), perspective )               // project
	Mat4.translate ( mat(), mat(), [0,0,-height] )             // camera position
	Mat4.rotateZ   ( mat(), mat(), rotation[2] )         // rotate bar
	Mat4.rotateY   ( mat(), mat(), rotation[1] )         // rotate bar
	Mat4.rotateX   ( mat(), mat(), rotation[0] )         // rotate bar
	
	var transformedMatrix = (mat(),mat())
	
	return _multiplyLine( line, transformedMatrix )
}

function _drawBars( bounds, config, random, transform ) {
	
	var $g = $(Svg.create('g'))
	
	var density = config.density + random.float(-config.densityRange, config.densityRange) * 0.5
	var barCount = Math.min(50, Math.floor(bounds.diagonal / density))
	var step = bounds.diagonal / barCount
	
	var rotation = [
		config.rotationX + random.float( -config.rotationXRange, config.rotationXRange ),
		config.rotationY + random.float( -config.rotationYRange, config.rotationYRange ),
		config.rotationZ + random.float( -config.rotationZRange, config.rotationZRange )
	]
	
	var iterations = barCount * config.overdraw
	
	var clipBars = _clipBarsFn( bounds.center, bounds.diagonal * 0.5 )
	
	_.times( iterations, function( j ) {
		
		// Adjust for the overdraw
		var i = j - (iterations - barCount) / config.overdraw

		var left   = config.widthScale * 2 * -bounds.diagonal
		var right  = config.widthScale * 2 * bounds.diagonal
		var top    = bounds.diagonal * -0.25 + step * i
		var bottom = top + step * 0.5
		
		var line = [
			[left,top],
			[right,top],
			[right,bottom],
			[left,bottom]
		]
		
		var transformedLine = _transformBars( transform, bounds, rotation, line )
		var clippedLine = clipBars( transformedLine )

		if( clippedLine ) {
			var $bar = $(Svg.create('polygon'))
		
			$bar.attr({
				points: Svg.points( clippedLine ),
				style: "stroke:none; fill:rgba(0,0,0,1)"
			})
		
			$g.append( $bar )
		}
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

function _sharedTransformData($svg) {

	var width = $svg.width()
	var height = $svg.height()
	var perspective = Mat4.perspective(
		[],
		Math.PI * 0.5, //fov
		width / height, //ratio
		height*0.1, //near
		height*1.0 //far
	)
	
	return {
		width: width,
		height: height,
		mat : _flipMatricesFn(),
		perspective : perspective
	}
}

module.exports = function dazzleFn( props, $svg ) {
	
	var config = _.extend({
		variation : 0,
		overdraw : 2,
		density : 100,
		densityRange : 5,
		widthScale : 1,
		rotationX : 0,
		rotationY : 0,
		rotationZ : 0,
		rotationXRange : 0,
		rotationYRange : 0,
		rotationZRange : 0,
	}, props)

	var random = SeedRandom( "Dazzle" + props.variation )
	var transform = _sharedTransformData( $svg )
	
	return function dazzle( [el, line, center] ) {

		var bounds = _cellBounds( line )
		
		_drawFillColors( random, bounds, el )
		var bars = _drawBars( bounds, config, random, transform )
		
		$(el).append( bars )
		// _drawCenterDots( el, center )
		
	}
}