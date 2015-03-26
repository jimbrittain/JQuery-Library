"use strict";
/* global $, isHTMLElement, document, findForm */
/**
 * jq.placeholder.js
 * Javascript/JQuery Placeholder Support
 * Requires isHTMLElement.js (on findForm)
 * Requires findForm.js
 *
 * @author JDB - jim@immaturedawn.co.uk 2013
 * @url - http://www.immaturedawn.co.uk
 * @license - Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * @copyright - Immature Dawn 2013
 * @version - 0.1.2
 * to call new JqueryPlaceHolder
 */
function JqueryPlaceTarget(e){
	this.target = e;
	this.element = e; //need to process so is a tag
	this.elementRevise(); }
JqueryPlaceTarget.prototype.elementRevise = function(){ //lazy element revision. Should be improved with initial reg check;
	var identifierArray = [], e = -1;
	if(this.element.indexOf(' ') !== -1){
		identifierArray = this.element.split(' ');
	} else { identifierArray = [this.element]; }
	var noneTags = [':', '.', '#', '>', '[', ']'];
	for(e = identifierArray.length - 1; e > -1; e -= 1){
		for(var n=0, nmax = noneTags.length; n < nmax; n += 1){
			if(identifierArray[e].indexOf(noneTags[n]) !== -1){
				identifierArray[e] = identifierArray[e].substring(0, identifierArray[e].indexOf(noneTags[n]));
				if(identifierArray[e].length === 0){ break; }}}}
	for(e=identifierArray.length - 1; e>-1; e -= 1){
		if(identifierArray[e].length > 0){
			this.element = identifierArray[e];
			break; }}};
function JqueryPlaceCheck(e){
	this.element = e;
	this.tested = false;
	this.needs = false; }
JqueryPlaceCheck.prototype.needed = function(){ return (!this.tested) ? this.checkNeeds() : this.needs; };
JqueryPlaceCheck.prototype.checkNeeds = function(){
	if(!this.tested){
		this.needs = true;
		this.tested = false;
		var elementCheck = document.createElement(this.element);
		if(elementCheck.attributes && elementCheck.attributes.length > 0 && elementCheck.attributes.getNamedItem){
			this.tested = true;
			this.needs = (elementCheck.attributes.getNamedItem('placeholder')) ? false : true; }
		if(!this.tested && elementCheck.hasOwnProperty){
			this.tested = true;
			this.needs = (elementCheck.hasOwnProperty('placeholder') || ('placeholder' in elementCheck)) ? false : true; }
		if(!this.tested){
			var placeholderText = "cheese";
			if(elementCheck.setAttribute){
				elementCheck.setAttribute('placeholder', placeholderText);
			} else {
				elementCheck = document.createElement('<' + this.element + '>');
				var placeCheck = document.createAttribute('placeholder');
				placeCheck.nodeValue = placeholderText;
				elementCheck.setAttributeNode(placeCheck); }
			if(elementCheck.placeholder && elementCheck.placeholder === placeholderText){
				this.needs = false;
			} else {
				if(elementCheck.hasAttribute){
					if(elementCheck.hasAttribute('placeholder')){
						if(elementCheck.getAttribute && elementCheck.getAttribute('placeholder') === placeholderText){ this.needs = false;
						} else if(elementCheck.getAttributeNode && elementCheck.getAttributeNode('placeholder').value === placeholderText){ this.needs = false; }}}}
			this.tested = true; }
		if(!this.needs){
			try {
				var testElement = ('createElement' in document) ? document.createElement(this.element) : $('<' + this.element+ '>')[0];
				$(testElement).attr('placeholder', 'text');
				testElement = null;
			} catch(e) { this.needs = true; }}}
	return this.needs; };
function JqueryPlaceholder(){
	if(JqueryPlaceholder.prototype.singletonInstance){ return JqueryPlaceholder.prototype.singletonInstance; }
	JqueryPlaceholder.prototype.singletonInstance = this;
	this.elements = [
		new JqueryPlaceCheck('input'),
		new JqueryPlaceCheck('textarea')
	];
	this.targets = [
		{ name: 'input[type="text"]', element: 'input'},
		{ name: 'input[type="search"]', element: 'input'}, 
		{ name: 'input[type="number"]', element: 'input'}, 
		{ name: 'input[type="email"]', element: 'input'}, 
		{ name: 'textarea', element: 'textarea' }
	];
	this.elementsProcessed = [];
	this.init(); }
JqueryPlaceholder.prototype.elementProcessed = function(elem){
	var exists = false;
	for(var i=0, max = this.elementsProcessed.length; i < max; i += 1){
		if(this.elementsProcessed[i] === elem){
			exists = true;
			return true; }}
	return exists; };
JqueryPlaceholder.prototype.elementNeeds = function(name){
	var tagName = name.toLowerCase();
	var the_id = -1;
	var found = false;
	for(var e=0, max = this.elements.length; e<max; e += 1){
		if(this.elements[e].element === tagName){
			found = true;
			the_id = e;
			break; }}
	if(!found){
		this.elements.push(new JqueryPlaceCheck(tagName));
		the_id = this.elements.length - 1; }	
	return this.elements[the_id].needed(); };
JqueryPlaceholder.prototype.process = function(t){
	if(!(t instanceof JqueryPlaceTarget) && ((t instanceof Object) && !('element' in t))){ t = new JqueryPlaceTarget(t); }
	if(this.elementNeeds(t.element)){
		var processor = this;
		$(t.name).each(function(i){
			if(!processor.elementProcessed(this)){
				var jText = ($(this).attr('placeholder')) ? $(this).attr('placeholder') : null;
				var pText = ('getAttribute' in this) ? this.getAttribute('placeholder') : null;
				var oText = ('attributes' in this && 'placeholder' in this.attributes) ? this.attributes.placeholder : null;
				jText = (jText !== null && typeof jText === 'object' && 'value' in jText) ? jText.value.toString() : ((typeof jText === 'string') ? jText.toString() : "null");
				pText = (pText !== null && typeof pText === 'object' && 'value' in pText) ? pText.value.toString() : ((typeof pText === 'string') ? pText.toString() : "null");
				oText = (oText !== null && typeof oText === 'object' && 'value' in oText) ? oText.value.toString() : ((typeof oText === 'string') ? oText.toString() : "null");
				var newText = (pText !== "null") ? pText : ((jText !== "null") ? jText : ((oText !== "null") ? oText : "null"));
				if(newText !== "null"){
					processor.create(this, newText);
					processor.elementsProcessed.push(this); }}}); }};
JqueryPlaceholder.prototype.firstrun = function(){
	for(var t=0, max = this.targets.length; t < max; t += 1){ this.process(this.targets[t]); }
	this.condenseLabelIntoInput(); };
JqueryPlaceholder.prototype.condenseLabelIntoInput = function(){
	var processor = this;
	$('label.condense').each(function(i){
		var theLabel = $(this);
		var theTargetId = theLabel.attr('for');
		var theTarget = $('#' + theTargetId);
		if(theTarget.get(0).tagName.toLowerCase() === 'input' || theTarget.get(0).tagName.toLowerCase() === 'textarea'){ //check theTarget is valid;
			if(processor.elementNeeds(theTarget.get(0).tagName)){
				processor.create(theTarget, theLabel.text());
			} else {
				var error = false;
				var htmlRef = theTarget.get(0);
				if(htmlRef.placeholder){
					try {
						htmlRef.placeholder = theLabel.text();
					} catch(e) { error = true; }
				} else {
					try{
						theTarget.attr('placeholder', theLabel.text());
					} catch(e) { error = true; }}
				if(error){ processor.create(theTarget, theLabel.text()); }
			}
			try{ $(this).attr('aria-role', 'label'); } catch(e){}
			$(this).css('display', 'none'); } }); };
JqueryPlaceholder.prototype.create = function(elem, txt){
	var obj = $(elem);
	var e2 = elem;
	var objForm = findForm(elem);
	if(objForm !== null && isHTMLElement(objForm)){
		var c = this;
		$(objForm).submit(function(){ return c.checkSubmission(e2); });}
	if(obj.attr('value') === '' || obj.attr('value') === txt){
		obj.attr('value', txt).data('allowChange', true);
		if(!obj.hasClass('placeholder')){ obj.addClass('placeholder'); }
	} else {
		obj.data('allowChange', false);
		if(obj.hasClass('placeholder')){ obj.removeClass('placeholder'); }}
	obj
		.data('dormantText', txt)
		.bind('select focus dragstart', function(e){ 
			if($(this).data('allowChange') && ($(this).attr('value') === $(this).data('dormantText'))){
				$(this).attr('value', '');
				if($(this).hasClass('placeholder')){ $(this).removeClass('placeholder'); }}})
		.blur(function(e){
			var theVal = (this.value && this.value.length > 0) ? this.value : $(this).attr('value');
			if(theVal === ''){
				$(this)
					.attr('value', $(this).data('dormantText'))
					.data('allowChange', true);
				if(!$(this).hasClass('placeholder')){ $(this).addClass('placeholder'); }}})
		.change(function(e){
			if($(this).data('allowChange')) {
				if($(this).attr('value') !== '' && ($(this).attr('value') !== $(this).data('dormantText'))) {
					$(this).data('allowChange', false); }}})
		.keydown(function(e){
			$(this).data('allowChange', false);
			if($(this).hasClass('placeholder')){ $(this).addClass('placeholder'); }}); };
JqueryPlaceholder.prototype.init = function(){
	var processor = this;
	$(document).ready(function(){ processor.firstrun(); }); };
JqueryPlaceholder.prototype.checkSubmission = function(elem){
	var theVal = "";
	var obj = null;
	if(elem !== null && isHTMLElement(elem)){
		obj = $(elem);
		if(elem.value && elem.value.length && elem.value.length > 0){
			theVal = elem.value;
		} else if(obj.attr('value') && obj.attr('value').length > 0){
			theVal = obj.attr('value');
		} else if('getAttribute' in elem && elem.getAttribute('value') && elem.getAttribute('value').length > 0){
			theVal = elem.getAttribute('value'); }}
	if(obj !== null && theVal !== ""){
		var dt = obj.data('dormantText');
		if(dt !== null && theVal.indexOf(dt) !== -1){
			var pos = theVal.indexOf(dt);
			var revised = theVal.substring(0, pos) + theVal.substring(pos + dt.length);
			obj.attr('value', revised);
			if(revised.length === 0){ return false; }}
		return true;
	} else { return false; }};
var jqPlace = new JqueryPlaceholder();
