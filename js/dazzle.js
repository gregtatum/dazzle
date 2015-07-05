var Svg = require('./utils/svg')
var _ = require('lodash')
var SeedRandom = require('./utils/random')
var Mat4 = require('gl-mat4')
var Vec4 = require('gl-matrix').vec4
var ConsoleMatrix = require('./utils/console-matrix')

function domDemo() {
	
	var $svg = $('#svg')
	var height = $svg.height()
	var width = $svg.width()
	
	var perspective = Mat4.perspective(
		[],
		Math.PI * 0.5, //fov
		width / height, //ratio
		height*0.1, //near
		height*1.0 //far
	)

	var $div = $('<div></div>')
	$div.appendTo($('body'))
	$div.css({
		width: "200px",
		height: "200px",
		backgroundColor : "#000",
		position:"absolute",
		marginTop:"-100px",
		marginLeft:"-100px",
		top: height/2+"px",
		left: width/2+"px",
	})

	var $div2 = $('<div></div>')
	$div2.appendTo($('body'))
	$div2.css({
		width: "200px",
		height: "200px",
		backgroundColor : "rgba(0,0,0,0.1)",
		position:"absolute",
		marginTop:"-100px",
		marginLeft:"-100px",
		top: height/2+"px",
		left: width/2+"px",
	})
	
	var i = 0
	var mat = _flipMatricesFn()
	
	function transform() {
		
		mat( true ) //reset
		i += 0.005
		
		Mat4.scale     ( mat(), mat(), [height,height,height] ) //scale back from clip space
		Mat4.multiply  ( mat(), mat(), perspective )            //project
		Mat4.translate ( mat(), mat(), [0,0,-height] )          //camera position
		Mat4.rotateY   ( mat(), mat(), Math.PI * i )            //rotate cube
		
		$div.css(
			"transform",
			_matrixArrayToCssMatrix( (mat(),mat()) )
		)
		
		requestAnimationFrame( transform )
	}
	
	transform()
	
}

;(function svgDemo() {
	
	var $svg = $('#svg')
	var height = $svg.height()
	var width = $svg.width()
	
	var left = width/2-100
	var right = width/2+100
	var top = height/2-100
	var bottom = height/2+100

	var line = [
		[left,top],
		[right,top],
		[right,bottom],
		[left,bottom]
	]
	
	function makePolygon( line, fill ) {
		var $polygon = $(Svg.create('polygon'))
		$svg.append( $polygon )
		$polygon.attr({
			fill : fill,
			points: Svg.points( line )
		})
		
		return $polygon
	}
	
	function multiplyLine( line, matrix ) {
		return _.map(line, function( point ) {
			var homogeneousPoint = [point[0], point[1], 0, 1]
			var results = Vec4.transformMat4([], homogeneousPoint, matrix)
			return [
				results[0] / results[3],
				results[1] / results[3]
			]
		})
	}
	
	var $polygon = makePolygon( line, "rgba(0,0,0,1)" )
	// makePolyline( line, "rgba(0,0,0,0.3)" )
	
	var i = 0.1
	var mat = _flipMatricesFn()

	var perspective = Mat4.perspective(
		[],
		Math.PI * 0.5, //fov
		width / height, //ratio
		height*0.1, //near
		height*1.0 //far
	)
	
	function transform() {
		
		mat( true ) //reset
		i += 0.005

		//Read in reverse
		Mat4.translate ( mat(), mat(), [width/2, height/2, 0] )     //back from origin
		Mat4.scale     ( mat(), mat(), [height,height,height] )    //scale back from clip space
		Mat4.multiply  ( mat(), mat(), perspective )               //project
		Mat4.translate ( mat(), mat(), [0,0,-height] )             //camera position
		Mat4.rotateY   ( mat(), mat(), Math.PI * i )               //rotate cube
		Mat4.translate ( mat(), mat(), [-width/2, -height/2, 0] )  //to origin
		
		$polygon.attr(
			"points",
			Svg.points(
				multiplyLine( line, (mat(),mat()) )
			)
		)
		
		requestAnimationFrame( transform )
	}
	
	transform()
	
})()

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

function _matrixArrayToCssMatrix(array) {
	return "matrix3d(" + array.join(',') + ")";
}

function _rotationMatrix( theta, center ) {
	
	var matA = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1
	]
	var matB = [
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1
	]
	
	var moveBack = [center[0], center[1], 0]
	var moveToOrigin = [-center[0], -center[1], 10]
	
	var perspective = Mat4.perspective([], Math.PI * 0.6, window.innerWidth / window.outerWidth, 5, 15)
	
	// Mat4.translate( matA, matB, moveBack )
	Mat4.multiply( matB, matA, perspective)
	// Mat4.rotateZ( matA, matB, theta )
	Mat4.rotateY( matA, matB, Math.PI * 0.1 )
	Mat4.translate( matB, matA, [0,0,10] )
	// Mat4.translate( matB, matA, moveToOrigin )
	// Mat4.translate( matA, matB, moveToOrigin )
	
	return _matrixArrayToCssMatrix(matB)
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
		
		$g.css({
			"transform" : "rotateY("+random.float(0, config.rotationRange)+")"
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
		
		_drawFillColors( random, bounds, el )
		var bars = _drawBars( bounds, config, random )
		
		$(el).append( bars )
		// _drawCenterDots( el, center )
		
	}
}