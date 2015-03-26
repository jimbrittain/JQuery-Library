"use strict";
/*global navigator, document, window, $, isHTMLElement*/
/**
 * jq.ZIndexFix.js
 * Requires
 * 		jQuery
 * 		isHTMLElement
 * ZIndexFix for IE7 and below
 * @author JDB - jim@immaturedawn.co.uk 2013
 * @url - http://www.immaturedawn.co.uk
 * @license - Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * @copyright - Immature Dawn 2011, 2013
 * @version - 0.2
 * Based on code created by R Avasthi at http://richa.avasthi.name/blogs/tepumpkin/2008/01/11/ie7-lessons-learned/
 * Known Issues - fails if document does not have a stylesheet;
 */
function ZIndexFix(){
	if(ZIndexFix.prototype.singletonInstance){ return ZIndexFix.prototype.singletonInstance; }
	ZIndexFix.prototype.singletonInstance = this;
	this.onTopClassExists = false;
	this.create();}
ZIndexFix.prototype.isTargetBrowser = function(){
	var isMsie = ('userAgent' in navigator && navigator.userAgent.indexOf('MSIE') !== -1 && !('opera' in window)) ? true : false;
	var av = (isMsie) ? parseFloat(navigator.appVersion.substring(navigator.appVersion.indexOf('MSIE') + 4)) : 10;
	return (isMsie && av < 8) ? true : false; };
ZIndexFix.prototype.create = function(){
	if(!this.onTopClassExists){
		if(this.isTargetBrowser()){
			if(document.styleSheets && document.styleSheets.length > 0){
				document.styleSheets[document.styleSheets.length - 1].addRule('.on-top', 'z-index:10000');
				this.onTopClassExists = true;
				return true;
			} else { return false; }
		} else { return false; }
	} else { return true; }};
ZIndexFix.prototype.enter = function(elem){
	if(isHTMLElement(elem) && this.create()){
		$(elem).parents().each(function(){
			var p= $(this);
			var pos = p.css("position");
			if(pos === "relative" || pos === "absolute" || pos === "fixed"){ $(this).addClass('on-top'); }
		});}};
ZIndexFix.prototype.leave = function(elem){
	if(isHTMLElement(elem) && this.create()){
		$(elem).parents().each(function(){
			if($(this).hasClass('on-top')){ $(this).removeClass('on-top'); }
		});}};
