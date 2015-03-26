"use strict";
/* global $, jquery, isHTMLElement, convertToPixelNumberComplex */
/* convertToPixel, convertToPixelComplex
 * requires JQuery due to convertToPixelComplex
 * isHTMLElement
*/
function convertToPixelNumber(n){
	var obj = {};
	if(arguments && arguments.length === 2){ obj = arguments[1]; }
	if(n !== 0){
		if(isFinite(n) && !isNaN(parseFloat(n))){ 
			return parseFloat(n);
		} else if(n.indexOf && n.indexOf('px') !== -1){ 
			return parseFloat(n);
		} else if(n === 'auto'){
			return 0;
		} else { return convertToPixelNumber.prototype.complex(n, obj); }
	} else { return 0; }}
	
convertToPixelNumber.prototype.complex = function(n, obj){
	obj = (obj !== undefined && isHTMLElement(obj)) ? obj : $('body')[0];
	var dim_arr = ['rem', 'ex', 'ch', 'em', 'vh', 'vw', 'vmin', 'vmax', 'mm', 'cm', 'in', 'pt', 'pc', 'px', 'mozmm'];
	var good = false;
	for(var i=0, imax = dim_arr.length; i<imax; i += 1){ 
		if(n.indexOf(dim_arr[i]) !== -1){
			good = true;
			break; }}
	if(good){
		var testObj = $('<div style="visibility: hidden; position:absolute; top: 0; left: 0; width:'+n+';display:block;" id="convertToPixelComplex_obj"></div>');
		$(obj).append(testObj);
		var realValue = $('#convertToPixelComplex_obj').innerWidth();
		n = parseFloat(realValue);
		$('#convertToPixelComplex_obj').remove(); }
	return n; };


