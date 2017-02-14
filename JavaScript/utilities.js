//utilities.js

"use strict";

function getMouse(event){
	var mouse = {};
	mouse.x = event.pageX - event.target.offsetLeft;
	mouse.y = event.pageY - event.target.offsetTop;
	return mouse; 
}