"use strict";
/* global window, jquery, IMDebugger, $, isHTMLElement, simplifyDegrees, convertToPixelNumber, console, calculateAngledDistance, CoordinatesBox */
/* notes convertToPixelNumber -> measure and whatmeasure */
/*
 * jq.Clipper.js
 * ClipBox Class - Version 0.1
 * @version 0.1
 * @author JDB - jim@immaturedawn.co.uk 2013
 * @url - http://www.immaturedawn.co.uk
 * @license - Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * @copyright - Immature Dawn 2013
 *
 * Dependencies
 * 		calculateAngledDistance
 * 		simplifyDegrees
 * 		isHTMLElement
 * 		convertToPixelNumber
 * 		JQuery
 *
 * To create supply args
 * 	If HTMLElement - uses defaults for all else;
 * 	If String - trys to use string as JQ selector, if good uses defaults for all else;
 * 	If Object
 * 		'element' 				: the target element;
 * 		'constrainParent'		: Also constrain the parent
 * 		'angle'					: between 0 and 360
 * 		'direction'				: 'ttb', 'bbt', 'rtl', 'ltr'
 * 		'determineInnerX', 'determineInnerY', 'determineOuterX', 'determineOuterY' : option for supplying a more complicated calculator function
*/
function ClipBox(args){
	this.element = null;
	this.container = null;
	this.angle = 90;
	this.constrainParent = true;
	this._determineInnerWidth = null;
	this._determineInnerHeight = null;
	this._determineOuterWidth = null;
	this._determineOuterHeight = null;
	this.outer = { 'width' : 0, 'height' : 0 };
	this.inner = { 'width' : 0, 'height' : 0 };
	this.working = new CoordinatesBox();
	var isGood = this.init(args);
	if(isGood){
		$(this.element).css('visibility', 'visible');
		return this;
	} else {
		(new IMDebugger()).pass("Unable to initialise ClipBox");
		return false; }}

ClipBox.prototype.init = function(obj){
	if(isHTMLElement(obj)){
		this.element = this.checkElement(obj);
	} else if(typeof obj === 'object'){
		if('direction' in obj){
			switch(obj.direction){
				case 'ttb': this.angle = 0; break;
				case 'bbt': this.angle = 180; break;
				case 'rtl': this.angle = 270; break;
				case 'ltr':
				case 'default':
					this.angle = 90;
					break; }
		} else if('angle' in obj && !(isNaN(parseFloat(obj.angle))) && isFinite(obj.angle)){ 
			this.angle = simplifyDegrees(obj.angle); }
		this.constrainParent = ('constrainParent' in obj && obj.constrainParent) ? true : false;
		this.element = ('element' in obj && isHTMLElement(obj.element)) ? this.checkElement(obj.element) : null;
		this.container = ('container' in obj && isHTMLElement(obj.container)) ? obj.container : null;
		this._determineInnerWidth = ('determineInnerWidth' in obj && (typeof obj.determineInnerWidth === 'function')) ? obj.determineInnerWidth : null;
		this._determineInnerHeight = ('determineInnerHeight' in obj && (typeof obj.determineInnerHeight === 'function')) ? obj.determineInnerHeight : null;
		this._determineOuterWidth = ('determineOuterWidth' in obj && (typeof obj.determineOuterWidth === 'function')) ? obj.determineOuterWidth : null;
		this._determineOuterHeight = ('determineOuterHeight' in obj && (typeof obj.determineOuterHeight === 'function')) ? obj.determineOuterHeight : null;
	} else if(typeof obj === 'string'){
		var jqList = $(obj);
		if(jqList.length > 0 && (isHTMLElement(jqList[0]))){ this.element = this.checkElement(jqList[0]); }}
	if(this.element !== null){
		this.container = (this.container === null) ? $(this.element).parent()[0] : this.container;
		this.determineInnerWidth();
		this.determineInnerHeight();
		this.determineOuterWidth();
		this.determineOuterHeight();
		return true;
	} else { return false; }};

ClipBox.prototype.initialised = function(){
		return (this.outer.width === 0 || this.outer.height === 0 || this.inner.width === 0 || this.inner.height === 0) ? false : true; };

ClipBox.prototype.move = function(distance){
	distance = convertToPixelNumber(distance);
	var obj = {
		'left' : 	convertToPixelNumber($(this.element).css('left')),
		'top' : 	convertToPixelNumber($(this.element).css('top'))};
	var change = calculateAngledDistance(this.angle, distance);
	obj.left += change.x;
	obj.top += change.y;
	this.reposition(obj); };

ClipBox.prototype.determine = function(){
	if(this.initialised()){
		this.working = new CoordinatesBox();
		var args = {
			'top' : 	convertToPixelNumber($(this.element).css('top')),
			'right' : 	convertToPixelNumber($(this.element).css('right')),
			'bottom' : 	convertToPixelNumber($(this.element).css('bottom')),
			'left' : 	convertToPixelNumber($(this.element).css('left'))
		};
		var obj = {
			'top' : 	args.top,
			'left' : 	args.left };
		this.reposition(obj); }};

ClipBox.prototype.reposition = function(args){
	if(this.initialised()){
		this.working = new CoordinatesBox();
		this.working.x2 = this.outer.width;
		this.working.y2 = this.outer.height;
		var obj = { 'top' : 0, 'left' : 0 };
		if($.isArray(args)){
			var beenConverted = false;
			var argsReplacement = {};
			if(args.length === 4){ 
				argsReplacement = {
					'top':		convertToPixelNumber(args[0]),
					'right':	convertToPixelNumber(args[1]),
					'bottom':	convertToPixelNumber(args[2]),
					'left':		convertToPixelNumber(args[3]) };
			} else if((args.length % 2) === 0 && (args.length < 9)){
				var i = 0;
				while(i < args.length){
					var p = args[i];
					var v = convertToPixelNumber(args[i + 1]);
					argsReplacement[p] = v;
					i += 1; }}
			args = argsReplacement; }
		if(typeof args === 'object'){
			if('right' in args){ obj.left -= convertToPixelNumber(args.right); }
			if('left' in args){ obj.left += convertToPixelNumber(args.left); }
			if('bottom' in args){ obj.top -= convertToPixelNumber(args.bottom); }
			if('top' in args){ obj.top += convertToPixelNumber(args.top); }}
		this.setVertical(obj.top);
		this.setHorizontal(obj.left);
		this.setClip();
		this.setXY();
		return true;
	} else {
		(new IMDebugger()).pass("ClipBox is not properly initialised. Aborting");
		return false; }};

ClipBox.prototype.setHorizontal = function(xPos){
	this.working.x1 = xPos;
	if(this.inner.width < this.outer.width){
		this.working.x1 = 0;
		this.working.x2 = this.inner.width;
	} else {
		this.working.x2 = this.working.x1 + this.inner.width;
		if(this.working.x2 < this.outer.width){
			this.working.x2 = this.outer.width;
			this.working.x1 = this.working.x2 - this.inner.width;
		} else if(this.working.x1 > 0){
			this.working.x1 = 0;
			this.working.x2 = this.working.x1 + this.inner.width; }}
	if(this.working.x1 < 0){
		this.working.x = this.working.x1;
		this.working.x1 = Math.abs(this.working.x1);
		this.working.x2 += this.working.x1; }};

ClipBox.prototype.setVertical = function(yPos){
	this.working.y1 = yPos;
	if(this.inner.height < this.outer.height){
		this.working.y1 = 0;
		this.working.y2 = this.inner.height;
	} else {
		this.working.y2 = this.working.y1 + this.inner.height;
		if(this.working.y2 < this.outer.height){
			this.working.y2 = this.outer.height;
			this.working.y1 = this.working.y2 - this.inner.height;
		} else if(this.working.y1 > 0){
			this.working.y1 = 0;
			this.working.y2 = this.working.y1 + this.inner.height; }}
	if(this.working.y1 < 0){
		this.working.y = this.working.y1;
		this.working.y1 = Math.abs(this.working.y1);
		this.working.y2 += this.working.y1; }};

ClipBox.prototype.checkElement = function(elem){
	var isParentPositioned = ($(elem).parent().css('position') === 'relative' || $(elem).parent().css('position') === 'absolute') ? true : false;
	var isElementPositioned = ($(elem).css('position') === 'absolute' || $(elem).css('position') === 'relative') ? true : false;
	var isElementHidden = ($(elem).css('visibility') === 'hidden') ? true : false;
	return (isParentPositioned && isElementPositioned && isElementHidden) ? elem : null; };

ClipBox.prototype.parseClip = function(){
	var theClip = $(this.element).css('clip');
	var obj = {'top': 0, 'right': 0, 'bottom' : 0, 'left' : 0 };
	if(theClip.indexOf('rect(') === 0){
		theClip = theClip.substring(5);
		theClip = theClip.substring(0, (theClip.length - 1));
		var clip_arr = [];
		if(theClip.indexOf(', ') !== -1){ clip_arr = theClip.split(', ');
		} else if(theClip.indexOf(',') !== -1){ clip_arr = theClip.split(',');
		} else if(theClip.indexOf(' ') !== -1){ clip_arr = theClip.split(' '); }
		if(clip_arr.length === 4){
			obj.top = convertToPixelNumber(clip_arr[0]);
			obj.right = convertToPixelNumber(clip_arr[1]);
			obj.bottom = convertToPixelNumber(clip_arr[2]);
			obj.left = convertToPixelNumber(clip_arr[3]); }}
	return obj; };

ClipBox.prototype.determineOuterWidth = function(){
	this.outer.width = (typeof this._determineOuterWidth === 'function') ? convertToPixelNumber(this._determineOuterWidth()) : convertToPixelNumber($(this.container).innerWidth()); };

ClipBox.prototype.determineOuterHeight = function(){
	this.outer.height = (typeof this._determineOuterHeight === 'function') ? convertToPixelNumber(this._determineOuterHeight()) : convertToPixelNumber($(this.container).innerHeight()); };

ClipBox.prototype.determineInnerWidth = function(){
	this.inner.width = (typeof this._determineInnerWidth === 'function') ? convertToPixelNumber(this._determineInnerWidth()) : convertToPixelNumber($(this.element).outerWidth()); };

ClipBox.prototype.determineInnerHeight = function(){
	this.inner.height = (typeof this._determineInnerHeight === 'function') ? convertToPixelNumber(this._determineInnerHeight()) : convertToPixelNumber($(this.element).outerHeight()); };

ClipBox.prototype.handleValue = function(val){ return (val === 0) ? 'auto' : val + 'px'; };

ClipBox.prototype.setClip = function(){
	$(this.element).css('clip', 'rect(' + this.handleValue(this.working.y1) + ' ' + this.handleValue(this.working.x2) + ' ' + this.handleValue(this.working.y2) + ' ' + this.handleValue(this.working.x1) + ')');
	if(this.constrainParent){
		$(this.element).parent().css('width', (this.working.x2 - this.working.x1) + 'px');
		$(this.element).parent().css('height', (this.working.y2 - this.working.y1) + 'px'); }};

ClipBox.prototype.setXY = function(){
	var xShift = this.working.x;
	var yShift = this.working.y;
	if($(this.element).css('left') !== this.handleValue(xShift)){ $(this.element).css('left', this.handleValue(xShift)); }
	if($(this.element).css('top') !== this.handleValue(yShift)){ $(this.element).css('top', this.handleValue(yShift)); }};

function CoordinatesBox(){
	this.x1 = 0;
	this.x2 = 0;
	this.y1 = 0;
	this.y2 = 0;
	this.requiresAlteration = false;
	this.x = 0;
	this.y = 0; }
