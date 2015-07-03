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
		var dazzle = DazzleFn( props.dazzle )
		Voronoi( props.voronoi, dazzle )
	}
}

;(function initVoronoi() {
	
	var gui = new dat.GUI()
	
	var props = {
		voronoi : {
			overdraw : 2,
			count : 200,
			variation : 0
		},
		dazzle : {
			variation : 0,
			density : 100,
			densityRange : 5,
			rotation : Math.PI * 0.2,
			rotationRange : Math.PI * 0.2
		}
	}

	var draw = _drawFn( props )
	draw()
	
	gui.addFolder('Voronoi')
	gui.add(props.voronoi, 'overdraw', -0.4, 5).onFinishChange( draw )
	gui.add(props.voronoi, 'count', 10, 800).step(5).onFinishChange( draw )
	gui.add(props.voronoi, 'variation', 0, 50).step(1).onFinishChange( draw )
	
	gui.addFolder('Dazzle')
	gui.add(props.dazzle, 'variation', 0, 50).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'density', 5, 200).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'densityRange', 0, 200).step(1).onFinishChange( draw )
	gui.add(props.dazzle, 'rotation', 0, Math.PI * 2).onFinishChange( draw )
	gui.add(props.dazzle, 'rotationRange', 0, Math.PI * 2).onFinishChange( draw )

})()