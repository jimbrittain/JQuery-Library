"use strict";
/* jshint  -W083 */
/* global $, document, WhenWindowLoads */
/* notes. Need to replace WhenWindowLoads with fetter*/
function FirstWordPseudo(selector_name, replacement_classname){
	this.parse_arr = [];
	this.selectors = [];
	this.rules = [];
	this.sel = "";
	this.cssSel = "";
	this.rep = "";
	this.cssRep = "";
	this.needSheet = true;
	this.wl = new WhenWindowLoads();
	var c = this;
	this.wl.add(function(){ c.init(selector_name, replacement_classname); }); }

FirstWordPseudo.prototype.init = function(selector_name, replacement_classname){
	this.sel = selector_name;
	this.cssSel = '::' + this.sel;
	this.rep = replacement_classname;
	this.cssRep = ' .' + this.rep;
	this.classNeeded = true;
	this.cssNeeded = false;
	try {
		var n = $('*' + this.cssSell);
		if(n.length > 0){ this.classNeeded = false; }
	} catch(e) { this.classNeeded = true;  }
	var s = $('link[rel="stylesheet"]');
	for(var i = 0,imax=s.length; i < imax; i += 1){
		this.parse_arr.push(s[i]); }
	if(this.parse_arr.length > 0){ this.cycle(); }};

FirstWordPseudo.prototype.cycle = function(){
	var s = '', h = '', c = this;
	if(this.parse_arr.length > 0){
		s = this.parse_arr.shift();
		h = $(s).attr('href');
		$.ajax({
			url: h, 
			dataType: 'text',
			error: function(){ c.cycle(); },
			success: function(d,s,x){
				var str = "";
				if(x.responseText){ str = x.responseText; }
				if(typeof str === "string" && str.length > 0){ c.parseCSS(str); }
				c.cycle(); }});
	} else { this.create(); }};


FirstWordPseudo.prototype.create = function(){
	if(this.selectors.length < 1){ return false; }
	var s = null, cl = (document.styleSheets) ? document.styleSheets.length : document.sheets.length;
	if($('#fwp_stylesheet').length !== 1){
		var ns = $('<style id="fwp_stylesheet" type="text/css"></style>');
		$('head').append(ns);
		var nl = (document.styleSheets) ? document.styleSheets.length : document.sheets.length;
		if(cl !== nl){ s = (document.styleSheets) ? document.styleSheets[cl] : document.sheets[cl]; }
	} else { s = $('#fwp_stylesheet')[0]; }
	var rules =  (s.cssRules) ? s.cssRules : s.rules;
	for(var i=0; i < this.selectors.length; i += 1){
		this.selectors[i] = this.selectors[i].replace(this.cssSel, this.cssRep);
		if(s.insertRule){
			try { s.insertRule(this.selectors[i] + ' {' + this.rules[i] + '}', rules.length); } catch(e){}
		} else if(s.addRule){
			try { s.addRule(this.selectors[i], this.rules[i]); } catch(e){}
		} else { break; }}
	for(var n=0,nmax = this.selectors.length ; n < nmax; n += 1){ this.selectors[n] = this.selectors[n].replace(this.cssRep, ''); }
	this.createSpans(); };

FirstWordPseudo.prototype.parseCSS = function(str){
	var elems = [], currentPos = 0;
	var r = new RegExp("(/\\*(.|\\n)*?\\*/)", 'gm');
	str = str.replace(r, '');
	while(str.indexOf('/*') !== -1){ str = str.substring(0, (str.indexOf('/*') - 2)); }
	while(str.indexOf(this.cssSel, currentPos) !== -1 && currentPos < str.length){
		currentPos = str.indexOf(this.cssSel, currentPos);
		var priorSubString = str.substring(0, currentPos);
		if(str.indexOf('}', currentPos) !== -1){
			var startPos = (priorSubString.indexOf('}') !== -1) ? priorSubString.lastIndexOf('}') + 1 : 0;
			var endPos = (str.indexOf('}', currentPos));
			var cssString = str.substring(startPos, endPos);
			if(cssString.indexOf('{') !== -1){
				var propertyString = cssString.substring(cssString.indexOf('{') + 2, (cssString.length -1));
				var classString = cssString.substring(0, cssString.indexOf('{') - 1);
				classString = classString.replace(/^\s*/, '');
				classString = classString.replace(/\s*$/, '');
				this.selectors.push(classString);
				this.rules.push(propertyString); }}
		currentPos += this.cssSel.length; }
	this.selectors = this.selectors.concat(elems); };

FirstWordPseudo.prototype.createSpans = function(){
	var c = this;
	for(var m = 0; m < this.selectors.length; m += 1){
		var theSelector = this.selectors[m];
		while(theSelector.indexOf(':') !== -1){
			var startPos = theSelector.indexOf(':');
			var endPos = theSelector.indexOf(' ', startPos);
			endPos = (endPos === -1) ? theSelector.length : endPos;
			theSelector = theSelector.substring(0, startPos) + theSelector.substring(endPos); }
		$(theSelector).each(function(){
			if($(this).children(c.cssRep).length < 1 && $(this).text().length > 0){
				var fullText = $(this).text();
				var textArray = fullText.split(/\s+/);
				var toMatch = textArray[0];
				var cl = $(this).contents().length, i = 0;
				var strPos = 0;
				while(toMatch.length > 0 && i < cl){
					var charChild = ($(this).contents())[0], childText = $(charChild).text(), childTextArray = childText.split(/\s+/);
					for(var j = 0, jmax = childTextArray.length; j < jmax; j += 1){
						if(childTextArray[j].length >= toMatch.length){
							var fullElem = $(charChild).html(), useParent = false;
							if(fullElem === null || fullElem === undefined){
								useParent = true;
								fullElem = $(charChild).parent().html(); }
							var findTextPos = fullElem.indexOf(toMatch, strPos);
							var remainder = fullElem.substring(findTextPos + toMatch.length);
							fullElem = fullElem.substring(0, findTextPos);
								fullElem += '<span class="' + c.rep + '">';
								fullElem += toMatch;
								fullElem += '</span>';
								fullElem += remainder;
							var tarElem = (useParent) ? $(charChild).parent() : $(charChild);
							tarElem.empty().html(fullElem);
							strPos = findTextPos;
							toMatch = "";
						} else {
							var currentMatch = toMatch.substring(0, childTextArray[j].length);
							toMatch = toMatch.substring(childTextArray[j].length);
							$(charChild).wrap('<span class="' + c.rep + '" />"');
							strPos += currentMatch.length;
						}
						strPos += childTextArray.length + 12 + c.rep.length + 4;
						if(toMatch.length <= 0){ j = jmax; }}
					i += 1;
				}}});}};
