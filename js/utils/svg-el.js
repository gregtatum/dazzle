module.exports = function createSvgElement(tagName) {
	return document.createElementNS('http://www.w3.org/2000/svg', tagName)
}