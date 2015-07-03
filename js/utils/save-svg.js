module.exports = function save_svg( $svg, $scope ){

	var $generateLink = $('<a href="#download">Generate Download Link</a>')
	var $link
	
	$scope.append( $generateLink )
	
	$generateLink.on('click', function() {
		debugger
		var b64 = btoa($svg.html())
		$link = $("<a id='#download' href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n"+b64+"' title='razzle.svg'>Download</a>")
		$generateLink.after( $link )
		$generateLink.hide()
	})
	
	return function resetLink() {
		if( $link ) $link.remove()
		$generateLink.show()
	}
}
