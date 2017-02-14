//main.js
/* would like to get done: 
	make sound frequencies dynamic
	Make sounds sound better
	Make the square frequencies harmonize better
	make the screen look nicer
	Let user control length of time a sound is played
	let the user change the number of squares and columns
	POSSIBLY allow toggling squares via click and drag?
*/

"use strict";
var app = app || {};

app.main = {
   //properties.  Will probably change later---------------------------------------------------
	WIDTH : screen.availHeight,
	HEIGHT: screen.availHeight*0.80, 
	canvas: undefined,
	ctx: undefined,
	
	
	
	//Array names are because each element in squareGroup is a group
	squareGroups: [], //contains arrays of squares grouped in columns.  Goes left to right.  a group of groups.  Shortened to "Col" to help prevent typos
	
	
	//NUMBER of groups and NUMBER of squares.  Normal is 10, currently trying 13
	groupTot: 13,
	squareTot: 13,
	
	//the period of time between switches
	interval: 1.0,
	
	//how long any note plays
	duration: 1.0,
	
	//which oscillator type is made
	dingType: 'square',
	
	//the currently playing group of squares
	currentGroup: 0,
	
	//how long it's been since the "play" method has been called
	timeSinceLastPlay:0,
	lastTime: 0,

	//TODO: whenever a ding is started, set this as equal to choir.length+1 and use it for placement in the choir array, similar to the use of "NOTE" in the tutorial.
	nametag: 0,//CURRENTLY UNUSED used to give any square a temporary number.
	
	
   //methods-------------------------------------------------------------------
	init : function(){
		//give canvas its properties
		this.canvas = document.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		
		
		//generate the initial square groups
		this.squareGroups = this.makeGroups(this.groupTot, this.squareTot);//we'll start with a 10 by 10 grid.
		
		
		//enable mouse clicking
		this.canvas.onmousedown = this.mouseClickDown.bind(this);
		
		
		//lets user change the type of sound played
		document.querySelector('#soundType').onchange = function(newType){
			app.main.dingType = newType.target.value;
		};
		
		//lets user change how fast it cycles through sounds.
		document.getElementById('speedSlider').onchange = function(e){
			app.main.interval = e.target.value;
			//until the current value for interval is displayed for the user and a seperate entry for duration is made, this will also set duration
			//TODO: make this done via its own, seperate method.
			app.main.duration = e.target.value;
		};
		
		
		this.update();
		
		
		
	},
	
	update: function(){
		requestAnimationFrame(this.update.bind(this));
		this.drawSquares(this.ctx);
		
		var dt = this.calculateDeltaTime();
		this.timeSinceLastPlay += dt;
		//DEBUG: checking group iteration
			//console.log("Time since last play is "+this.timeSinceLastPlay);
			//console.log("Current interval is " + this.interval);
			//console.log("Current Column is: " + this.currentGroup);
		if(this.timeSinceLastPlay >= this.interval){
			this.timeSinceLastPlay = 0;
			this.play();
		}
		
	},
	
	
	//from Boomshine assignment
	calculateDeltaTime: function(){ 
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		this.lastTime = now; 
		return 1/fps;
	},
	
	
	//Makes the groups.  Also contains all the functions and variables used by those groups
	makeGroups: function(groupNum, squareNum){ 
		
		//goes through this group and draws all the squares in it by using squareDraw
		var groupDraw = function(ctx){
			ctx.save();
			// /*
			for(var i =0; i<this.length; i++){
				var g = this[i];
				g.draw(ctx);
			}
			//*/
			ctx.restore();
		};
		
		//check the first element of each column's x value to see if it might have been clicked
		var clicked = function(mouse){
			//DEBUG: sees where mouse clicked
				//console.log("clicked"+this[0].x);
			if (this[0].x < mouse.x && (this[0].x + this[0].width) > mouse.x){
				//if the place clicked WAS in this colum, find which element was clicked.
				for(var i =0; i<this.length; i++){
					var g = this[i];
					//this is the similar function for the square itself
					g.clickNarrow(mouse);
				}
			}
		};
		
	  
		//beginning of the function to play music with squares.  Looks for active squares.
		var pipeUp = function() {
			for(var i =0; i<this.length; i++){
					//check if square number "i" is active
					var g = this[i];
					if(g.active == true){
						//play that square
						g.pipette();
					}
			}
		};

	  
		var outerArray = [];
		
		//make all the squares within the groups
		for(var i=0; i<groupNum;i++){
			//object literal for the groups
			var gro = {};
			//
			gro = this.makeSquares(i, squareNum);
			gro.draw = groupDraw;
			gro.clickCheck = clicked;
			gro.soundOn = pipeUp;
			Object.seal(gro);
			outerArray.push(gro);
		}
		return outerArray;
	},
	
	//makes all the squares for a SPECIFIC group.
	makeSquares: function(colNum, squareNum){
		
		//draw a specific square
		var squareDraw = function(ctx){
			ctx.save();
			
			//let user know whether a square is active or not
			if (this.active == true){
				ctx.fillStyle = "red";
			}
			else{
				ctx.fillStyle = "black";
			}
			
			//draw the square
			ctx.fillRect(this.x,this.y,this.width,this.height);
			ctx.restore();
		};
		
		//find which box was clicked
		var clickedFinal = function(mouse){
			if ((this.x < mouse.x && (this.x + this.width) > mouse.x) && (this.y < mouse.y && (this.y + this.height) > mouse.y)){
				//console.log("FOUND IT!");
				//toggles the square's activity
				if (this.active == true){
					this.active = false;
				}
				else if (this.active == false){
					this.active = true;
				}
			}
			//this.draw();
		};
		
		//final function in the pipe set.  
		var pipeFinal = function(){
			
			//creates a new oscillator
			var pipe = new app.Ding();
			//starts the oscillator and gives it a frequency based on the square's position.  It stops and deletes itself on its own.
			pipe.start(this.toneValue, app.main.dingType);
			
			//DEBUG: use to find current sound type and make sure the arrays are the proper length
				//console.log("the current ding type is "+ app.main.dingType)
				//console.log("tone value is "+ this.toneValue+" hertz");
				//console.log("RED choir length is"+ pipe.choir.length)
		}
		
		//the array containing the squares for this particular column.
		var innerArray = [];
		for(var i=0; i<squareNum;i++){
			var square = {}; //a square.  
			//Square positioning and size based on screen size and number of squares.
			square.x = ((colNum)*(app.main.canvas.width / app.main.groupTot)+5);
			square.y = ((i)*(app.main.canvas.height / app.main.squareTot)+5);;
			square.width = ((app.main.canvas.width / app.main.groupTot)-10);
			square.height = ((app.main.canvas.height / app.main.squareTot)-10);
			
			square.draw = squareDraw;
			square.clickNarrow = clickedFinal;
			
			//used for startin dat ding
			square.pipette = pipeFinal; 
			
			//The tone this particular square will play.  Measured in Hertz.  
			//TODO: make the amount it increments based on squareTot
			//TODO: make the value HIGHEST at the start and LOWEST at the end
			
			//NORMAL
			//square.toneValue = ((i*50)+50);
			
			//CHROMATIC
			square.toneValue = (440*Math.pow(2, i/12));
			
			//whether square is on.  Changes on click.
			square.active = false;  
			
			//prevents me from adding any more properties
			Object.seal(square);
			innerArray.push(square);
		}
		return innerArray;
	},
	
	//draws the squares
	drawSquares : function(ctx){
		//goes through all the columns
		for(var i =0; i<this.squareGroups.length; i++){
			ctx.save(); 
			//if the current column is the one playing give it a shadow
				if(this.currentGroup == i){
					ctx.shadowColor = "blue";
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = 30;
				}
			//"Erase" previously drawn shadows
				else{
					ctx.shadowColor = "white";
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
					ctx.shadowBlur = 30;
				}
				var g = this.squareGroups[i];
				g.draw(ctx);
			ctx.restore();
		}
	},
	
	play : function(){
		
		//DEBUG: show the duration a note is held
		//console.log("Current duration is "+app.main.duration)
		
		//advance the active column being checked for playing squares
		this.currentGroup ++;
		
		//DEBUG: make sure groups are incrementing correctly
		//console.log(this.currentGroup);
		//console.log(this.groupTot);
		
		//make it wrap around back to zero
		if(this.currentGroup >= this.groupTot){
			this.currentGroup = 0;
		}
		//console.log("Current Column is: " + this.groupTot);
		
		//get the NEW active column
		var g = this.squareGroups[this.currentGroup];
		
		//Play all active squares within that column
		g.soundOn();
	},
	
	//name is pretty self explanatory.  This lets you click things.
	mouseClickDown: function(event){
		var mouse = getMouse(event);
		//TODO bonus: figure out a way to activate and deactivate squares by clicking and holding
		for(var i =0; i<this.squareGroups.length; i++){
			//if getmouse x is greater than the x of the first square and less than the first square's x + width:{
				//cycle through the squares comparing the mouse click to each square's x and y and, if true, switch whether the square is activated or not, draw the new square, and stop checking.
			//}
			var g = this.squareGroups[i];
			g.clickCheck(mouse);
		}
		//console.log("clicked"+mouse.x+" "+ mouse.y);
	},
	
	
};// end of app.main