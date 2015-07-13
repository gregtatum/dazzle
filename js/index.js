var Voronoi = require('./voronoi')
var DazzleFn = require('./dazzle')
var SaveSvg = require('./utils/save-svg')

function _drawFn( props ) {
	
	return function draw() {
		
		var $svg = $('#svg')
		$svg.empty()
		$svg.attr({
			width: $svg.width(),
			height: $svg.height()
		})
		var dazzle = DazzleFn( props.dazzle, $svg )
		Voronoi( props.voronoi, dazzle )
	}
}

;(function initVoronoi() {
	
	var gui = new dat.GUI()
	
	var props = {
		voronoi : {
			scale : 2,
			count : 200,
			variation : 0
		},
		dazzle : {
			enableDazzle : true,
			enableColors : true,
			variation : 0,
			density : 100,
			densityRange : 5,
			overdraw : 2,
			widthScale : 1,
			rotationX : 0,
			rotationY : 0,
			rotationZ : 0,
			rotationXRange : 0,
			rotationYRange : 0,
			rotationZRange : 0,
		}
	}

	var draw = _drawFn( props )
	draw()
	
	gui.addFolder('Voronoi')
	gui.add(props.voronoi, 'scale', -0.4, 5).onFinishChange( draw )
	gui.add(props.voronoi, 'count', 10, 800).step(5).onFinishChange( draw )
	gui.add(props.voronoi, 'variation', 0, 50).step(1).onFinishChange( draw )
	
	gui.addFolder('Dazzle')
	gui.add(props.dazzle, 'enableDazzle').onFinishChange( draw )
	gui.add(props.dazzle, 'enableColors').onFinishChange( draw )
	gui.add(props.dazzle, 'variation', 0, 50).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'density', 5, 200).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'densityRange', 0, 200).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'overdraw', 1, 10).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'widthScale', 1, 20).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationX', -Math.PI * 0.5, Math.PI * 0.5).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationY', -Math.PI * 0.5, Math.PI * 0.5).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationZ', -Math.PI, Math.PI).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationXRange', 0, Math.PI * 0.5).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationYRange', 0, Math.PI * 0.5).onFinishChange( draw )
	var r = gui.add(props.dazzle, 'rotationZRange', 0, Math.PI).onFinishChange( draw )
	r.__impliedStep = 0.1
})()