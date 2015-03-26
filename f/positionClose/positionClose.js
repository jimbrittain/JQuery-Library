"use strict";
/* global Boundary, Alignment, $, window, document, jquery */
/**
 * positionClose.js
 * Javascript Overlay Positioning
 * @version 0.1
 * @author JDB - jim@immaturedawn.co.uk 2012
 * @url http://www.immaturedawn.co.uk
 * @license - Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * @copyright - Immature Dawn 2012
 * 
 * @usage 
 * 	- supply an obj with element, target, alignments, grid (jquery object element, jquery target element, alignments either Alignment or array of Alignments, grid def)
 * @dependencies
 * 	- Boundary Class
 * 	- Alignment Class
 * @notes
 * 	- uses hardcoded gridSnap function from /js/f/gridSnap/gridSnap.js
 */
function positionClose(obj){
	function gridSnap(n, pg){ return (Math.ceil(n/pg)) * pg; }
	var pixelGrid = (('grid' in obj) && !isNaN(obj.grid) && !isNaN(parseInt(obj.grid))) ? obj.grid : 1;
	var element = ('element' in obj) ? obj.element : false; // problem no element;
	var target = ('target' in obj) ? obj.target : document;
	var alignments = [];
	if('alignments' in obj){
		if(typeof(obj.alignments) === 'object' && (obj.alignments instanceof Array)){ //based on andrewpeace.com is_array
			for(var i=0, imax = obj.alignments.length; i < imax; i += 1){
				if(obj.alignments[i] instanceof Alignment) { alignments.push(obj.alignments[i]); }}
		} else if(obj.alignments instanceof Alignment){
			alignments.push(obj.alignments);
		} else { alignments.push(new Alignment()); }}
	var elementBounds = new Boundary({
		top: 0,
		left: 0,
		bottom: element.outerHeight(),
		right: element.outerWidth()});
	var documentBounds = new Boundary({
		top: 0,
		left: 0,
		bottom: $(document).height(), 
		right: $(document).width()});
	var destination = { possible: false, top: 0, left: 0 }; 
	var lowerBig = false;
	if(documentBounds.width() < elementBounds.width() || documentBounds.height() < elementBounds.height()){
		destination.possible = false;
	} else {
		for(var j=0, jmax = alignments.length; j<jmax; j += 1){
			var targetBounds = new Boundary({});
			if(alignments[j].target === document){
				targetBounds.top = 0;
				targetBounds.left = 0;
				targetBounds.bottom = $(document).height();
				targetBounds.right = $(document).width();
			} else {
				var targetOffset = target.offset();
				targetBounds.top = targetOffset.top;
				targetBounds.bottom = targetOffset.top + target.innerHeight();
				targetBounds.left = targetOffset.left;
				targetBounds.right = targetOffset.left + target.innerWidth(); }
			var destinationBounds = {
				top: targetBounds.top + (targetBounds.height() * alignments[j].verticalValue()),
				left: targetBounds.left + (targetBounds.width() * alignments[j].horizontalValue()), 
				bottom: 0,
				right: 0 };
			//registration
			destinationBounds.top = destinationBounds.top - (elementBounds.height() * alignments[j].registrationYValue());
			destinationBounds.left = destinationBounds.left - (elementBounds.width() * alignments[j].registrationXValue());
			//gridsnap
			destinationBounds.top = gridSnap(destinationBounds.top, pixelGrid);
			destinationBounds.left = gridSnap(destinationBounds.left, pixelGrid);
			destinationBounds.bottom = destinationBounds.top + elementBounds.height();
			destinationBounds.right = destinationBounds.left + elementBounds.width();
			if(destinationBounds.top >= documentBounds.top && destinationBounds.bottom <= documentBounds.bottom && destinationBounds.left >= documentBounds.left && destinationBounds.right <= documentBounds.right){
				destination.top = destinationBounds.top;
				destination.left = destinationBounds.left;
				destination.possible = true;
				break; }}}
	return destination; }