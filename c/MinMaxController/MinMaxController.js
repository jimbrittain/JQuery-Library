"use strict";
/*global $, isHTMLElement */

function MinMaxController(o){
	this.max = 0;
	this.min = 0;
	this.step = 1;
	this.min_element = "";
	this.max_element = "";
	this.beenSet = false;
	this.rounding = 0;
	if(o !== undefined){ this.init(o); }}
MinMaxController.prototype.setMinimumElement = function(e){
	if(e !== undefined && isHTMLElement(e)){
		this.min_element = e;
		if(!this.beenSet){ this.setMinMax(this.min_element); }}};
MinMaxController.prototype.setMaximumElement = function(e){
	if(e !== undefined && isHTMLElement(e)){
		this.max_element = e;
		if(!this.beenSet){ this.setMinMax(this.max_element); }}};
MinMaxController.prototype.setMinMax = function(o){
	if(!this.beenSet){
		var elem = "";
		var min = -1;
		var max = -1;
		var step = 1;
		var round = 0;
		if(typeof o === "object"){
			elem = ('element' in o && o.element !== undefined && isHTMLElement(o.element)) ? o.element : "";
			min = ('min' in o) ? o.min : ((elem !== "") ? $(elem).attr('min') : -1);
			max = ('max' in o) ? o.max : ((elem !== "") ? $(elem).attr('max') : -1);
			round = ('rounding' in o) ? o.rounding : (('round' in o) ? o.round : 0);
			step = ('step' in o) ? o.step : ((elem !== "") ? $(elem).attr('step') : 1); }
		if(min !== -1 && max !== -1){
			this.max = Number(max);
			this.min = Number(min);
			this.step = Number(step);
			this.round = Number(round);
			this.beenSet = true;
			return true;
		} else { return false; }
	} else { return false; }};
MinMaxController.prototype.init = function(a){
	if(typeof a === 'object'){
		if('minimum_element' in a){ this.setMinimumElement(a.minimum_element); 
		} else if('min_element' in a){ this.setMinimumElement(a.min_element); }
		if('maximum_element' in a){ this.setMaximumElement(a.maximum_element); 
		} else if('max_element' in a){ this.setMaximumElement(a.max_element); }
		if('step' in a){ this.step = Number(a.step); }
		if('round' in a){ this.rounding = Number(a.round); }
		if('min' in a){ this.min = Number(a.min); }
		if('max' in a){ this.max = Number(a.max); }}
	this.calc();
	var c = this;
	$(this.min_element).bind('change', function(){ c.change(this); });
	$(this.max_element).bind('change', function(){ c.change(this); });
};
MinMaxController.prototype.calc = function(){
	if(this.beenSet){
		var currentMin = ('value' in this.min_element) ? this.min_element.value : $(this.min_element).attr('value');
		var currentMax = ('value' in this.max_element) ? this.max_element.value : $(this.max_element).attr('value');
		currentMin = Number(currentMin);
		currentMax = Number(currentMax);
		$(this.min_element).attr('max', (currentMax - this.step));
		$(this.max_element).attr('min', (currentMin + this.step));}};
MinMaxController.prototype.valueChange = function(val, dflt){
	if(isNaN(Number(val))){
		val = dflt;
	} else {
		val = Number(val);
		val = (this.rounding > 0) ? val * (this.rounding * 10) : val;
		val = Math.round(val);
		val = (this.rounding > 0) ? val / (this.rounding * 10) : val; }
	return Number(val); }; 

MinMaxController.prototype.change = function(elem){
	var testNumber = 0;
	if(elem === this.min_element){
		var onMin = ('value' in this.min_element) ? this.min_element.value : $(this.min_element).attr('value');
		onMin = Number(onMin);
		testNumber = this.valueChange(onMin, this.min);
		if(testNumber !== onMin){
			onMin = testNumber;
			this.min_element.value = onMin; }
		if(onMin < this.min){ this.min_element.value = this.min; }
		if(onMin > (this.max - this.step)){ this.min_element.value = (this.max - this.step); }
		if(this.max_element.value < onMin){ this.max_element.value = onMin + this.step; }
		if(this.max_element.value < this.max){ this.max_element.value = this.max; }
		this.calc();
	} else if(elem === this.max_element){
		var onMax = ('value' in this.max_element) ? this.max_element.value : $(this.max_element).attr('value');
		onMax = Number(onMax);
		testNumber = this.valueChange(onMax, this.max);
		if(testNumber !== onMax){
			onMax = testNumber;
			this.max_element.value = onMax; }
		if(onMax > this.max){ this.max_element.value = this.max; }
		if(onMax < (this.min + this.step)){ this.max_element.value = (this.min + this.step); }
		if(this.min_element.value > onMax){ this.min_element.value = (onMax - this.step); }
		this.calc();
	}};