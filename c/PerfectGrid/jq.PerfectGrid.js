"use strict";
/*global window, document, console, IMDebugger, isHTMLElement, navigator, $, debounce, clearTimeout, setTimeout, inVisibleDOM, GridObject, PerfectGridArgs */

// PerfectGrid Class
/* Requires debounce,isHTMLElement,jq 

* To call; 
* 	either PerfectGrid(x) or new PerfectGrid.build(x);
* 	2 versions;
* 		PerfectGrid(
* 			2 arguments:
* 				first, holder : either HTMLElement or css selector string to element references;
* 				second, boxIdentifier [optional] : css selector string that defines box relative to holder, defaults to all;
* 		)
* 		PerfectGrid(
* 			1 object {
* 				'holder' [required] 	: either HTMLElement or css selector string to element references;
* 				'box' [optional]		: css selector string that defines box relative to holder, defaults to all;
* 				'margin' [opt] 			: minimumMargin (only used on float so far), if not included uses margin-right on boxes
* 				'multiline' [opt]		: boolean, grid (true), row (false), also can use perfectrow class on holder or 'row' variable on this object
* 				'resize' 	[opt]		: boolean for fixing or resize
* 				'method' [opt] 			: 'strict' || 'loose'
* 			}
* 		)
* If you use first-creation build, i.e. new PerfectGrid(object), or first inclusion the PerfectGrid prototype will use vars as defaults;
* */

/**
 * Perfect Grid
 * @class PerfectGrid
 * @module PerfectGrid
 * @version 0.2
 * @author Immature Dawn
 * @constructor
 * @type Singleton
 * @copyright JDB 2014
 * @license - add license in here
 * @date 20140303
 * @requires isHTMLElement, PerfectGridArgs, GridObject, $.debounce, jQuery
 */
function PerfectGrid(){
	var first_run_boo = false, can_build_boo = false, args_obj = {};
	if(PerfectGrid.prototype.singletonInstance){
		if(arguments && arguments.length){ PerfectGrid.prototype.singletonInstance.build(arguments); }
		return PerfectGrid.prototype.singletonInstance;
	} else { first_run_boo = true; }
	this.rows = [];
	this.args = [];
	this.fix_on_resize_boo = true; //boolean
	this.refresh_boo = true;
	this.minimum_margin = 0; //include conversion;
	this.last_method_str = 'strict'; // strict | loose
	this.multiline_boo = true; //boolean
	if(arguments.length > 0){
		args_obj = new PerfectGridArgs();
		can_build_boo = args_obj.init(arguments);
		if(first_run_boo){
			this.minimum_margin = ('margin' in args_obj.optional) ? args_obj.optional.margin : this.minimum_margin;
			this.refresh_boo = ('refresh' in args_obj.optional) ? args_obj.optional.refresh : this.refresh_boo;
			this.fix_on_resize_boo = ('resize' in args_obj.optional) ? args_obj.optional.resize : this.fix_on_resize_boo;
			this.last_method_str = ('method' in args_obj.optional) ? args_obj.optional.method : this.last_method_str;
			this.multiline_boo = ('multiline' in args_obj.optional) ? args_obj.optional.multiline : this.multiline_boo; }
		if(can_build_boo){ this.build(arguments); }}
	return this; }

/**
 * Perfect Grid findRowIdFromElement
 * @method findRowIdFromElement
 * @requires isHTMLElement
 * @param {HTMLElement} elem Argument 1
 * @return {Number|False} Number for PerfectGrid.rows or false for not found
 */
PerfectGrid.prototype.findRowIdFromElement = function(elem){
	if(elem !== undefined && isHTMLElement(elem)){
		var _e = false;
		for(var i=0, max = this.rows.length; i < max; i+=1){
			if(elem === this.rows[i].element){
				_e = i;
				break; }}
		return _e;
	} else {
		(new IMDebugger()).pass("PerfectRows.returnRowIdFromElement must be supplied a HTML Element");
		return false; }};
/**
 * Perfect Grid findRowFromElement
 * @method findRowFromElement
 * @requires isHTMLElement
 * @dependencies findRowFromElement
 * @param {HTMLElement}
 * @return {GridObject|undefined} GridObject instance from PerfectGrid.rows
 */
PerfectGrid.prototype.findRowFromElement = function(elem){
	var id = this.findRowIdFromElement(elem);
	if(id !== false){
		return this.rows[id];
	} else { return undefined; }};
/**
 * Perfect Grid addRow
 * @method addRow
 * @requires isHTMLElement
 * @dependencies elementExists, findRowIdFromElement
 * @param {GridObject} g Argument 1
 * @return {GridObject|undefined} GridObject instance from PerfectGrid.rows (whether or not added). Undefined if not a valid GridObject
 */
PerfectGrid.prototype.addRow = function(g){
	if(g instanceof GridObject){
		if(!this.elementExists(g.element)){
			this.rows.push(g);
			this.rows[this.rows.length - 1].fix();
			return this.rows[this.rows.length - 1];
		} else { return this.rows[this.findRowIdFromElement(g.element)]; }
	} else { 
		(new IMDebugger()).pass("PerfectGrid.addRow must be supplied a valid GridObject.");
		return undefined; }};
/**
 * PerfectGrid deleteRowFromElement
 * @method deleteRowFromElement
 * @requires isHTMLElement
 * @dependencies elementExists, findRowIdFromElement, deleteRowFromId
 * @param {HTMLElement} elem Argument 1
 * @return {Boolean} true | false - latter if not found
 */
PerfectGrid.prototype.deleteRowFromElement = function(elem){
	var row_id = -1;
	if(elem !== undefined && isHTMLElement(elem)){
		if(this.elementExists(elem)){
			row_id = this.findRowIdFromElement(elem);
			return this.deleteRowFromId(row_id);
		} else { return false; }
	} else {
		(new IMDebugger()).pass("PerfectGrid.deleteRowFromElement must be supplied a valid HTMLElement.");
		return false; }};
/**
 * PerfectGrid deleteRowFromId
 * @method deleteRowFromId
 * @return {Boolean} true | false, latter if not valid id;
 */
PerfectGrid.prototype.deleteRowFromId = function(id){
	if(id > -1 && id < this.rows.length){
		this.rows.splice(id,1);
		return true;
	} else {
		(new IMDebugger()).pass("PerfectGrid.deleteRowFromId was supplied an invalid id that is outside the acceptable range.");
		return false;}};
/**
 * PerfectGrid deleteRedundantRows
 * @event deleteRedundantRows
 * @requires isHTMLElement, inVisibleDOM
 * @needs PerfectGrid.deleteRowFromId
 * @param {none}
 * @return {Number} Rows Length;
 */
PerfectGrid.prototype.deleteRedundantRows = function(){
	var i = this.rows.length - 1, del = false;
	while(i > -1){
		if(this.rows[i].element === undefined || !isHTMLElement(this.rows[i].element) || !inVisibleDOM(this.rows[i].element)){
			del = this.deleteRowFromId(i); }
		i -= 1; }
	return this.rows.length; };
/**
 * Perfect Grid elementExists
 * Simple boolean response to if Element exists already within this.findRowIdFromElement;
 * @method elementExists
 * @requires isHTMLElement
 * @dependencies findRowIdFromElement
 * @param {HTMLElement} elem Argument 1
 * @return {Boolean}
 */
PerfectGrid.prototype.elementExists = function(elem){ return (this.findRowIdFromElement(elem) === false) ? false : true; };
/**
 * Perfect Grid build
 * Builds the GridObjects and Arguments Objects necessary for operation
 * @method build
 * @requires PerfectGridArgs, isHTMLElement, GridObject
 * @uses PerfectGrid.elementExists
 * @uses PerfectGrid.findRowFromElement
 * @param {PerfectGridArgs | holder & box }
 * @return GridObjects
 */
PerfectGrid.prototype.build = function(){
	var args_obj = false, error_boo = false, obj = {}, element_arr = [], grid_returns_arr = [], grid_obj = null, len = 0;
	if(arguments && arguments.length > 0){
		args_obj = new PerfectGridArgs(arguments);
		if(args_obj !== false){
			obj.multiline = ('multiline' in args_obj.optional) ? args_obj.optional.multiline : this.multiline_boo;
			obj.margin = ('margin' in args_obj.optional) ? args_obj.optional.margin : this.minimum_margin;
			obj.resize = ('resize' in args_obj.optional) ? args_obj.optional.resize : this.fix_on_resize_boo;
			obj.method = ('method' in args_obj.optional) ? args_obj.optional.method : this.last_method_str;
			obj.refresh = ('refresh' in args_obj.optional) ? args_obj.optional.refresh : this.refresh_boo;
			if(isHTMLElement(args_obj.holder)){
				element_arr.push(args_obj.holder);
			} else if(typeof(args_obj.holder) === 'string'){ element_arr = $(args_obj.holder); }
			for(var i=0, max = element_arr.length; i < max; i+=1){
				obj.id = this.rows.length;
				obj.holder = element_arr[i];
				grid_obj = new GridObject(obj);
				if(grid_obj instanceof GridObject){
					if(!this.elementExists(obj.holder)){
						this.rows.push(grid_obj);
						len = this.rows.length - 1;
						this.rows[len].fix();
						grid_returns_arr.push(this.rows[len]);
					} else { grid_returns_arr.push(this.findRowFromElement(grid_obj.element)); }}}
			if(obj.refresh){
				obj.holder = args_obj.holder;
				obj.box = args_obj.box;
				var found = false;
				for(var j=0, jmax = this.args.length; j < jmax; j+= 1){
					if(this.args[j].holder === obj.holder){ found = true; break; }}
				if(!found){ this.args.push(obj); }}
		} else { error_boo = true; }
	} else { error_boo = true; }
	if(!error_boo && grid_returns_arr.length > 0){
		return (grid_returns_arr.length === 1) ? grid_returns_arr[0] : grid_returns_arr;
	} else {
		(new IMDebugger()).pass("PerfectGrid.build not supplied with valid objects");
		return false; }
};
/**
 * PerfectGrid refresh
 * @method refresh
 * @uses PerfectGrid.build
 * @param {none}
 * @return {none}
 */
PerfectGrid.prototype.refresh = function(){ 
	this.deleteRedundantRows();
	for(var i = 0, max = this.args.length; i < max; i += 1){ this.build(this.args[i]); }
};
/**
 * PerfectGrid resize
 * @event resize
 * @requires GridObject, isHTMLElement
 * @uses GridObject.fix
 * @param {none}
 * @return {Boolean} true | false, generally unnecessary
 */
PerfectGrid.prototype.resize = function(){
	var c = this, i = 0;
	if(this.fix_on_resize_boo && this.rows !== undefined && this.rows.length > 0){
		i = this.rows.length - 1;
		while(i > -1){
			if(this.rows[i].element !== undefined && isHTMLElement(this.rows[i].element)){
				if(this.rows[i].resize === true){ c.rows[i].fix(); }
			} else { this.deleteRowFromId(i); }
			i -= 1; }
		return true;
	} else { return false; }};

/**
 * PerfectGrid setResize
 * @method setResize
 * @param {boolean | none} sets resize on or off, none = off
 * 	@default {none}
 * @requires jQuery, jQuery.debounce
 */
PerfectGrid.prototype.setResize = function(b){
	var setter = (b !== undefined && b === false) ? false : true, c = this;
	if(setter){
		this.fix_on_resize_boo = true;
		$(window).resize($.debounce(500, function(){ c.resize(); })); //this uses debounce? use your own?
	} else { this.fix_on_resize_boo = false; }};
/**
 * GridObject
 * @class GridObject
 * @module GridObject
 * @submodule GridObject
 * @requires isHTMLElement, PerfectGrid
 * @constructor
 */
function GridObject(){
	this.to = ""; //used to hold resize timeout
	this.id = -1;
	this.resize = false;
	this.element = undefined;
	this.boxIdentifier = '*';
	this.type = 'justify';
	this.multiline = true;
	this.customMarginRight = 0;
	this.minimumMarginRight = 0;
	this.hideOverflow = false;
	this.numberOfItemsPerRow = 1;
	this.totalItems = 0;
	this.lastline = 0;
	this.last_method = 'strict';
	this.callForMore = false;
	this.callMoreAction = null;
	this.resizeHold = "";
	if(arguments && arguments.length && typeof arguments[0] === 'object'){
		var obj = arguments[0], c = this;
		if('holder' in obj){
			if(!isHTMLElement(obj.holder)){ 
				this.element = (typeof obj.holder === 'string' && $(obj.holder).length > 0) ? $(obj.holder)[0] : undefined;
			} else { this.element = obj.holder; }}
		if(this.element !== undefined){
			this.id = ('id' in obj) ? parseInt(obj.id) : this.id;
			this.resize = ('resize' in obj && (obj.resize === true || obj.resize === false)) ? obj.resize : this.resize;
			this.last_method = ('method' in obj && (obj.method === 'strict' || obj.method === 'loose')) ? obj.method : this.last_method;
			this.multiline = ('multiline' in obj && (obj.multiline === true || obj.multiline === false)) ? obj.multiline : this.multiline;
			this.multiline = ('row' in obj) ? false : this.multiline;
			this.multiline = ($(c.element).hasClass('perfectrow') || !this.multiline) ? false : this.multiline;
			if(!this.multiline){
				this.hideOverflow = true;
				$(c.element).css('height', $(c.element).children(c.boxIdentifier).outerHeight(false));
				$(c.element).css('overflow', 'hidden'); }
			this.boxIdentifier = ('box' in obj && $(this.element).children(obj.box).length > 0) ? obj.box : '*';
			this.totalItems = $(c.element).children(c.boxIdentifier).length;
			if('margin' in obj){
				this.minimumMarginRight = parseFloat(obj.margin);
			} else { this.minimumMarginRight = parseFloat($(c.element).children(c.boxIdentifier).css('margin-right')); }
			return this;
		} else {  return undefined; }}} //not a valid holder, so snapping;
/**
 * GridObject fix
 * @method fix
 * @param {none}
 * @return {none}
 */
GridObject.prototype.fix = function(){
	var c = this;
	$(c.element).children(c.boxIdentifier).each(function(i){ c.resolveItem($(this)[0], i); }); };
/**
 * GridObject getSpaceSize
 * @method getSpaceSize
 * @param {none}
 * @requires jQuery
 * @return {Number}
 * @notes Uses a 720/2048 space size (0.351562) rounded to 1dp
 */
GridObject.prototype.getSpaceSize = function(){
	var spaceSize = 0.3;
	return parseFloat($(this.element).css('font-size')) * spaceSize; };
/**
 * GridObject determineType
 * @method determineType
 * @param {none}
 * @return {string} 'float'|'justify' dependent on object style
 * @requires jQuery
 */
GridObject.prototype.determineType = function(){
	var c = this, elem_arr = $(c.element).children(c.boxIdentifier);
	if(elem_arr.css('display') === 'inline-block' && this.multiline){
		this.type = 'justify';
	} else if(elem_arr.css('display') === 'block' || !c.multiline){ this.type = 'float'; }
	return this.type; };
/**
 * GridObject getItemHeight
 * @method getItemHeight
 * @param {none}
 * @return {Number} maximum pixel height of items within row;
 * @requires jQuery, isHTMLElement
 */
GridObject.prototype.getItemHeight = function(){
	var c = this, largest = 0, rowelems_arr = [], i = 0;
	if(c.element !== undefined && isHTMLElement(c.element)){
		rowelems_arr = $(c.element).children(c.boxIdentifier);
		i = rowelems_arr.length - 1;
		while(i > -1){
			var h = Math.ceil($(rowelems_arr[i]).outerHeight(false));
			largest = (h > largest) ? h : largest;
			i -= 1; }
		return largest; 
	} else { 
		(new IMDebugger()).pass('Grid Element does not exist!');
		return 0; }};
/**
 * GridObject getItemWidth
 * @method getItemWidth
 * @requires jQuery
 * @param {none}
 * @return {Number} average pixel width of items within row
 */
GridObject.prototype.getItemWidth = function(){
	var c = this, fullWidth = 0, number = 0, rowelems_arr = [], rowlength_num = 0;
	if(this.element !== undefined && isHTMLElement(this.element)){
		rowelems_arr = $(c.element).children(c.boxIdentifier);
		rowlength_num = rowelems_arr.length;
		for(var i=0; i < rowlength_num; i += 1){ fullWidth += parseInt($(rowelems_arr[i]).outerWidth(false),10); }
		return (fullWidth > 0) ? Math.ceil(fullWidth/rowlength_num) : 0;
	} else { 
		(new IMDebugger()).pass('Row Element does does not exist!');
		return 0; }};
/**
 * GridObject calculateCustomMargin
 * @method calculateCustomMargin
 * @param {none}
 * @return {Number}
 * @requires jQuery
 * @dependencies getSpaceSize
 */
GridObject.prototype.calculateCustomMargin = function(){
	var c = this, cm = 0, first_jqobj = null, second_jqobj = null, firstpos_num = 0, elem_arr = $(c.element).children(c.boxIdentifier);
	first_jqobj = $(elem_arr[0]);
	second_jqobj = $(elem_arr[1]);
	firstpos_num = first_jqobj.position().left;
	firstpos_num += first_jqobj.outerWidth(true);
	cm = second_jqobj.position().left - firstpos_num;
	cm -= c.getSpaceSize();
	cm = Math.ceil(cm);
	return (cm < 0) ? 0 : cm; };
/**
 * GridObject resolveItem
 * @method resolveItem
 * @param {HTMLElement} item
 * @param {childNumber} number - potentially this could be done programmatically
 * @return {none}
 */
GridObject.prototype.resolveItem = function(item, childNumber){
	var on_id = childNumber, c = this;
	switch (childNumber){
		case 0:
			this.initialize();
			/* falls through */
		case 1:
			this.resolveFromSecondItem(item);
			/* falls through */
		default:
			this.defaultItemResolution(item);
			if((childNumber + 1) % this.numberOfItemsPerRow === 0){ this.lastOfRowResolution(item); }
			if(childNumber % this.numberOfItemsPerRow === 0){ this.firstOfRowResolution(item); }
			if(childNumber >= this.lastline && (childNumber !== (this.totalItems - 1)) || !this.multiline){ this.finalRowItemFix(item); }
			if(childNumber >= this.lastline && (childNumber === (this.totalItems - 1))){ 
				c.to = setTimeout(
					function(){ 
						c.resize = c.resizeHold;
						c.resizeHold = "";
						clearTimeout(c.to);
					}, 1000); }
			if(childNumber >= this.numberOfItemsPerRow){ this.overflowResolution(item); }
			break; }};
/**
 * GridObject initialize
 * @method initialize
 * @param {none}
 * @return {none}
 */
GridObject.prototype.initialize = function(){
	var c = this, priorIt = 0, width = 0, height = 0, padding_height, container_jqobj = $(this.element), children_jqobj = $(c.element).children(c.boxIdentifier);
	c.resizeHold = c.resize;
	c.resize = false;
	container_jqobj.remove('br.ie7breakpoints');
	children_jqobj.css('margin-right', 0);
	width = container_jqobj.width();
	if(!c.multiline){
		height = this.getItemHeight();
		padding_height = container_jqobj.innerHeight() - container_jqobj.height();
		container_jqobj.css('height', (height + padding_height) + 'px').css('min-height', (height + padding_height) + 'px'); }
	switch(this.determineType()){
		case 'justify':
			var actualSpaceSize = 0, actualWidth = 0;
			actualSpaceSize = c.getSpaceSize();
			actualWidth = width + actualSpaceSize; //as last space is not counted;
			this.numberOfItemsPerRow = Math.floor(actualWidth/(this.getItemWidth() + actualSpaceSize));
			this.customMarginRight = width - (this.getItemWidth() * this.numberOfItemsPerRow);
			this.customMarginRight /= this.numberOfItemsPerRow;
			if((this.customMarginRight + actualSpaceSize) < this.minimumMarginRight){ // attempt at fixing for lower margins
				var newMargin = 0;
				priorIt = 0;
				newMargin = this.minimumMarginRight - actualSpaceSize;
				children_jqobj.css('margin-right', newMargin + 'px');
				priorIt = this.numberOfItemsPerRow;
				this.numberOfItemsPerRow = Math.floor((actualWidth/(this.getItemWidth() + newMargin + actualSpaceSize)));
				if(this.numberOfItemsPerRow !== priorIt){
					this.customMarginRight = width - (this.getItemWidth() * this.numberOfItemsPerRow);
					this.customMarginRight /= this.numberOfItemsPerRow;
					newMargin = this.customMarginRight - actualSpaceSize;
					children_jqobj.css('margin-right', newMargin + 'px'); }
				children_jqobj.filter(':nth-of-type(' + (this.numberOfItemsPerRow) + 'n)').css('margin-right', '0');
				this.customMarginRight = newMargin; }
			this.lastline = this.totalItems % this.numberOfItemsPerRow;
			this.lastline = (this.lastline === 0) ? this.numberOfItemsPerRow : this.lastline;
			this.lastline = this.totalItems - this.lastline;
			break;
		case 'float':
			width -= 1; //used for rounding issues;
			c.numberOfItemsPerRow = Math.floor(width/(c.getItemWidth() + c.getSpaceSize()));
			c.customMarginRight = width - ((c.getItemWidth() + c.getSpaceSize()) * c.numberOfItemsPerRow);
			c.customMarginRight = c.customMarginRight/(c.numberOfItemsPerRow - 1);
			if(c.customMarginRight < c.minimumMarginRight){
				priorIt = 0;
				c.customMarginRight = c.minimumMarginRight;
				priorIt = c.numberOfItemsPerRow;
				c.numberOfItemsPerRow = Math.floor((width + c.customMarginRight)/(c.getItemWidth() + c.customMarginRight + c.getSpaceSize())); 
				if(priorIt !== c.numberOfItemsPerRow){
					c.customMarginRight = width - (c.getItemWidth() * c.numberOfItemsPerRow);
					c.customMarginRight = c.customMarginRight/(c.numberOfItemsPerRow - 1);
					c.customMarginRight = c.customMarginRight; }}
			break; }};
/**
 * GridObject resolveFromSecondItem
 * @method resolveFromSecondItem
 * @param {none}
 * @return {none} sets customMarginRight;
 * @dependencies calculateCustomMargin
 */
GridObject.prototype.resolveFromSecondItem = function(){
	if(this.type === 'justify' && this.last_method === 'loose'){ this.customMarginRight = this.calculateCustomMargin(); }};
/**
 * GridObject defaultItemResolution
 * @event defaultItemResolution
 * @param {HTMLElement} item
 * @requires jQuery
 * @return {none}
 */
GridObject.prototype.defaultItemResolution = function(item){
	item = $(item);
	item.css('visibility', 'visible').css('clear','none');
	switch (this.type){
		case 'justify':
			item.css('margin-left', 0);
			break;
		case 'float':
			item.css('margin-right', this.customMarginRight);
			break; }};
/**
 * GridObject overflowResolution
 * @event overflowResolution
 * @param {HTMLElement} item
 * @requires jQuery
 * @return {none}
 */
GridObject.prototype.overflowResolution = function(item){ 
	if(!this.multiline && this.hideOverflow){ 
		$(item).css('visibility', 'hidden').css('margin-right', 0); }};
/**
 * GridObject firstOfRowResolution
 * @method firstOfRowResolution
 * @param {HTMLElement} item
 * @requires jQuery
 * @return {none}
 */
GridObject.prototype.firstOfRowResolution = function(item){
	if(this.multiline){
		switch (this.type){
			case 'float':
				$(item).css('clear', 'left');
				if(navigator.appVersion.indexOf("MSIE 7.") !== -1 && !window.opera){ //ie7 fixes;
					this.resize = false;
					$(item).before('<br class="ie7breakpoints" clear="all" style="clear:both;" />'); } 
				break; }}};
/**
 * @event lastOfRowResolution
 * @param {HTMLElement} item Argument 1
 * @return {none}
 */
GridObject.prototype.lastOfRowResolution = function(item){
	switch (this.type){
		case 'float':
			$(item).css('margin-right', 0);
			break; }};
/**
 * @event finalRowItemFix
 * @param {HTMLElement} item Argument 1
 * @return {none}
 */
GridObject.prototype.finalRowItemFix = function(item){
	var item_jqobj = $(item), c = this, elemarr_jqobj = $(c.element).children(c.boxIdentifier), elem_jqobj = $(c.element), actualHeight = 0;
	if(this.multiline){
		switch (this.type){
			case 'justify':
				switch (this.last_method){
					case 'loose':
						item_jqobj.css('margin-right', this.customMarginRight);
						break;
					case 'strict':
						item_jqobj.css('margin-right', this.calculateExactMargin(item) + 'px');
						break; }
				break; }
	} else {
		actualHeight = elemarr_jqobj.outerHeight(true) - elemarr_jqobj.outerHeight(false);
		actualHeight = (isNaN(actualHeight)) ? 9 : actualHeight;
		actualHeight += parseInt(this.getItemHeight());
		elem_jqobj.css('height', actualHeight);
		elem_jqobj.css('min-height', actualHeight); }};
/**
 * GridObject findBoxId
 * @method findBoxId
 * @param {HTMLElement} elem
 * @return {Number | Boolean false}
 */
GridObject.prototype.findBoxId = function(elem){
	var c = this, _e = false, elem_arr = null;
	if(elem !== undefined && isHTMLElement(elem)){
		elem_arr = $(c.element).children(c.boxIdentifier);
		for(var i=0, max = elem_arr.length; i < max; i += 1){
			if(elem_arr[i] === elem){
				_e = i;
				break; }}
		return _e;
	} else {
		(new IMDebugger()).pass("GridObject.findBoxId must be supplied a HTML Element");
		return false; }};
/**
 * GridObject calculateExactMargin
 * @method calculateExactMargin
 * @param {HTMLELement} item
 * @return {Number}
 */
GridObject.prototype.calculateExactMargin = function (item){
	var on_id = this.findBoxId(item), c = this, firstRow_equivalent = on_id % this.numberOfItemsPerRow, currentLeft = 0, targetLeft = 0, children_jqobj = $(c.element).children(c.boxIdentifier);
	if(firstRow_equivalent === on_id){
		return this.minimumMarginRight;
	} else {
		targetLeft = $(children_jqobj[firstRow_equivalent + 1]).position().left;
		currentLeft = $(children_jqobj[on_id]).position().left + $(children_jqobj[on_id]).outerWidth();
		targetLeft -= currentLeft;
		targetLeft -= c.getSpaceSize(); }
	return targetLeft; };
/**
 * @class PerfectGridArgs
 * @module PerfectGrid
 * @submodule PerfectGridArgs
 * @constructor
 * @param {object|holder and box} Object ('holder','box' required: margin, multiline,resize,refresh,method optional);
 */
function PerfectGridArgs(){
	var g = false;
	this.holder = null;
	this.box = null;
	this.optional = {};
	if(arguments.length > 0){ 
		g = this.init(arguments);
		return (g === false) ? false : this;
	} else { return this; }}
/**
 * @method init
 * @param {object|holder and box} Object ('holder','box' required: margin, multiline,resize,refresh,method optional);
 * @return {Boolean} true|false
 */
PerfectGridArgs.prototype.init = function(args){
	var v;
	args = (args.length === 1 && typeof(args[0]) === 'object') ? args[0] : args;
	args = (args.length === 1 && typeof(args[0]) === 'object') ? args[0] : args;
	if(args.length === 2){
		this.holder = args[0];
		this.box = args[1];
	} else if(typeof(args) === 'object'){
		this.holder = ('holder' in args) ? args.holder : null;
		this.box = ('box' in args) ? args.box : null;
		if('margin' in args){ 
			v = (typeof(args.margin) === 'string') ? parseFloat(args.margin) : Number(args.margin);
			if(!isNaN(v)){ this.optional.margin = args.margin; }}
		if('multiline' in args){ this.optional.multiline = (args.multiline === false) ? false : true; }
		if('resize' in args){ this.optional.resize = (args.resize === false) ? false : true; }
		if('refresh' in args){ this.optional.refresh = (args.refresh === false) ? false : true; }
		if('method' in args){ this.optional.method = (args.method === 'strict' || args.method === 'loose') ? args.method : 'strict'; }
	}
	return (this.box !== null && this.holder !== null) ? true : false; };