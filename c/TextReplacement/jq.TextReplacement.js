"use strict";
/*global $, IMDebugger, isHTMLElement, document, console */
function TextReplacement(args){
	this.containerCSSString = "";
	this.dynamicValue = true;
	this._view = null;
	this._tying = null;
	this._valid = null;
	this.elementsResolved = []; 
	this.init(args);
	//need to add a document ready firing, and an if added new content firing check;
}
TextReplacement.prototype.init = function(obj){
	if(typeof obj === "object"){
		this.containerCSSString = ('container' in obj && (typeof obj.container === "string")) ? obj.container : "";
		this.dynamicValue = ('dynamic' in obj && obj.dynamic) ? true : false;
		this._valid = ('valid' in obj && (typeof obj.valid === "function")) ? obj.valid : null;
		this._view = ('view' in obj && (typeof obj.view === "function")) ? obj.view : null;
		this._tying = ('tying' in obj && (typeof obj.tying === "function")) ? obj.tying : null; }
	if(this.containerCSSString !== ""){
		var c = this;
		$(document).ready(function(){ c.process(); }); }};
TextReplacement.prototype.dynamicTying = function(el){
	if(this.dynamicValue && (typeof this._tying === 'function')){
		return this._tying(el);
	} else { 
		(new IMDebugger()).pass("This instance of Replacement Graphic is not set up for dynamic value settings. Either set dynamicValue to false or include a valid dynamic function."); 
	}};
TextReplacement.prototype.process = function(){
	var c = this;
	$(this.containerCSSString).each(function(){ if(!c.elementResolved(this)){ c.resolveElement(this); }});};
TextReplacement.prototype.resolveElement = function(el){
	if(el !== undefined && isHTMLElement(el)){
		if(!this.elementResolved(el)){
			try {
				var val = null;
				if(this.dynamicValue){
					val = this.dynamicTying(el); }
				val = this.validReturn(val);
				var replacementCode = this.viewCode(val);
				if(replacementCode !== undefined && isHTMLElement(replacementCode)){
					this.addToResolved(el);
					$(el).replaceWith(replacementCode);
					return true;
				} else {
					(new IMDebugger()).pass("TextReplacement.resolveElement: viewCode must return a valid HTMLElement.");
					return false; }
			} catch(e) {}
			 return false; 
		} else { return false; }
	} else { 
		(new IMDebugger()).pass("TextReplacement.resolveElement: Requires valid HTMLElement");
	}};
TextReplacement.prototype.elementResolved = function(el){
	if(isHTMLElement(el)){
		var doesExist = false;
		for(var i=0, max = this.elementsResolved.length; i < max; i += 1){
			if(this.elementResolved[i] === el){
				doesExist = true;
				break; }}
		return doesExist;
	} else { 
		(new IMDebugger()).pass("TextReplacement.elementProcessed: Requires valid HTMLElement");
	}};
TextReplacement.prototype.addToResolved = function(el){
	if(!this.elementResolved(el)){
		this.elementsResolved.push(el);
		return true;
	} else { return false; }};
TextReplacement.prototype.viewCode = function(val){
	if(typeof this._view === "function"){
		return this._view(val);
	} else {
		(new IMDebugger()).pass("TextReplacement.viewCode: No valid view code has been supplied");
	}};
TextReplacement.prototype.validReturn = function(val){
	if(typeof this._valid === "function"){
		return this._valid(val);
	} else { return val; }};
