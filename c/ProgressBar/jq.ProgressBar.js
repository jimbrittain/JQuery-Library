"use strict";
/* global isHTMLElement, IMDebugger, console, jQuery, $, setTimeout, clearTimeout, setInterval, clearInterval  */
function ProgressBar(){
	this.enabled = false;
	this.oncomplete = "";
	this.onerror = "";
	this.progress = "";
	this.progressInterval = null;
	this.container = "";
	this.element = "";
	this.max = 100;
	this.min = 0;
	this.error = false;
	this.errortime = 5000;
	this.loadtime = 500;
	this.error_timeout = null;
	this.complete = false;
	this.removeOnComplete = true;
	this.current = 0;
	this.visual = false;
	this.method = "html5"; }

ProgressBar.prototype.init = function(containerElement){
	if(isHTMLElement(containerElement)){
		this.container = containerElement;
		this.element = this.create();
	} else if(typeof containerElement === "object"){
		var o = containerElement;
		this.container = ('container' in o && isHTMLElement(o.container)) ? o.container : "";
		this.oncomplete = ('oncomplete' in o && typeof o.oncomplete === 'function') ? o.oncomplete : "";
		this.onerror = ('onerror' in o && typeof o.onerror === 'function') ? o.onerror : "";
		this.progress = ('progress' in o && typeof o.progress === 'function') ? o.progress : "";
		var max = ('max' in o) ? o.max : (('maximum' in o) ? o.maximum : "");
		var min = ('min' in o) ? o.min : (('minimum' in o) ? o.minimum : "");
		if(max !== ""){ this.setMaximum(max); }
		if(min !== ""){ this.setMinimum(min); }
		if(this.progress !== ""){
			this.enabled = true;
			if(this.container !== null){ this.create(); }
		} else {
			(new IMDebugger()).pass("The Progress Bar was not supplied a valid progress definer");
		}}};

ProgressBar.prototype.create = function(){
	if(this.container !== "" && isHTMLElement(this.container)){
		var e = $('<progress class="progressbar" />')[0];
		var okay = false;
		okay = ('hasOwnProperty' in e && e.hasOwnProperty('max')) ? true : okay; 
		okay = (!okay && 'hasAttribute' in e && e.hasAttribute('max')) ? true : okay;
		if(!okay && 'attributes' in e && e.attributes.length > 0){
			for(var i = 0, imax = e.attributes.length; i < imax; i += 1){
				if('nodeName' in e.attributes[i] && e.attributes[i].nodeName === 'max'){
					okay = true;
					/* jshint -W069 */
					break; } else if(e.attributes['max']){ okay = true; break; }}}
		okay = (!okay && 'max' in e) ? true : okay;
		this.method = (okay) ? "html5" : "html4";
		switch(this.method){
			case 'html4':
				e = $('<div class="progressbar"><div /></div>');
				break;
			case 'html5':
				e = $(e);
				e.attr('max', '100');
				e.attr('value', '0');
				e = e[0];
				break; }
		$(this.container).append(e);
		this.element = $(this.container).find('.progressbar')[0];
		this.visual = true; }};

ProgressBar.prototype.visualProgression = function(){
	if(this.visual){
		var c = this;
		switch(this.method){
			case 'html5':
				$(this.element).attr('value', c.current);
				break;
			case 'html4':
				$(this.element).find('div')
					.css('width', c.current + '%')
					.attr('title', c.current + '%');
				break; }}};

ProgressBar.prototype.begin = function(){
	if(this.enabled){
		this.setProgressInterval();
		this.setErrorTimeout(); }};

ProgressBar.prototype.setProgressInterval = function(){
	var c = this;
	this.progressInterval = setInterval(function(){ c.determineProgress(); }, c.loadtime);};

ProgressBar.prototype.clearProgressInterval = function(){
	if(this.progressInterval !== null){
		clearInterval(this.progressInterval);
		this.progressInterval = null; }};

ProgressBar.prototype.clean = function(){
	this.clearProgressInterval(); 
	this.clearErrorTimeout();
	if(this.visual && this.element !== "" && this.container !== null){ 
		var c = this;
		$(c.element).remove();}};

ProgressBar.prototype.setMaximum = function(n){
	if(typeof n === 'number'){
		if(this.min !== ""){
			if(typeof this.min === 'number' && n > this.min){
				this.max = n;
				return true;
			} else {
				(new IMDebugger()).pass("The maximum value is less or equal to the minimum value");
				return false; }
		} else {
			this.max = n;
			return true; }
	} else {
		(new IMDebugger()).pass("The maximum value must be a number");
		return false; }};

ProgressBar.prototype.setMinimum = function(n){
	if(typeof n === 'number'){
		if(this.max !== ""){
			if(typeof this.max === "number" && n < this.max){
				this.min = n;
				return true;
			} else {
				(new IMDebugger()).pass("The minimum value is greater or equal to the maximum value");
				return false; }
		} else {
			this.min = n;
			return true; }
	} else {
		(new IMDebugger()).pass("The minimum value must be a number");
		return false; }};

ProgressBar.prototype.determineError = function(n){
	this.error = true;
	if(typeof this.onerror === 'function'){ this.onerror(); }
	this.clean();
	(new IMDebugger()).pass("Progress bar has encountered a timeout after " + (this.errortime/1000) + " seconds, the error functionality has fired");
};

ProgressBar.prototype.determineProgress = function(){
	var n = this.progress();
	if(typeof n === "number"){
		if(n >= this.max){
			this.completed();
		} else {
			n = this.calculateProgress(n);
			if(n !== this.current){ this.clearErrorTimeout(); }
			this.current = n;
			this.visualProgression();
			if(n >= 100){
				this.completed();
			} else {
				if(this.error_timeout === null){ this.setErrorTimeout(); }}}}};

ProgressBar.prototype.completed = function(){
	this.current = 100;
	this.visualProgression();
	this.complete = true;
	this.clean();
	if(typeof this.oncomplete === 'function'){ this.oncomplete(); }};

ProgressBar.prototype.calculateProgress = function(n){
	//error checks?
	return Math.round(((n - this.min)/(this.max - this.min)) * 100); };

ProgressBar.prototype.setErrorTimeout = function(){
	this.clearErrorTimeout();
	var c = this;
	var current = c.current;
	this.error_timeout = setTimeout(
		function(){ 
			if(c.completed){
				c.clean();
				this.error = false;
			} else {
				c.determineError(c.current);
				c.clean();
				(new IMDebugger()).pass("All Stop Error");
			}}, c.errortime); };

ProgressBar.prototype.clearErrorTimeout = function(){
	if(this.error_timeout !== null){
		clearTimeout(this.error_timeout);
		this.error_timeout = null; }};
