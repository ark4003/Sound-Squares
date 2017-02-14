//done through tutorial at http://blog.chrislowis.co.uk/2013/06/10/playing-multiple-notes-web-audio-api.html
"use strict"
var app = app || {};


var audCon = new AudioContext(); 

var duration = 1;

app.Ding = (function(audCon) {
	function Ding (){
		//all the oscillators making noise right now
		this.choir = [];
	};
	
	Ding.prototype.start = function(frequency, dingType){
		//console.log("start");
		
		this.frequency = frequency;
		
		//Sets the duration.  Feels weird to do it this way, but it's the only way I found that worked.
		duration = app.main.duration;
		
		//DEBUG: check to make sure that the notes are playing for the proper, consistent amount of time.
		//console.log("The duration here is "+duration);
		//console.log("Audcon's current time is "+ audCon.currentTime);
		//console.log("So this should stop when audcon is at "+ ((parseFloat(audCon.currentTime)+parseFloat(duration))) +"seconds.")
		
		//Oscillator
		var osc = audCon.createOscillator();
		//osc.type = osc.SINE;
		osc.type = dingType;
		//DEBUG: make sure the sound is the proper type
		//console.log("The current sound type is "+ dingType );
		osc.frequency.value = this.frequency;
		
		//amplifier
		var amp = audCon.createGain();
		amp.gain.value = 0.5;
		
		//connection
		osc.connect(amp);
		osc.connect(audCon.destination);
		
		//start the new node
		osc.start();
		
		//stop the new node after an amount of time = to duration has passed
		osc.stop((parseFloat(audCon.currentTime)+parseFloat(duration)));
		//DEBUG: make sure that the new oscillator is getting added to the array properly.
		//console.log("adding "+osc.frequency.value+"Hz player to choir")
		//adds the new oscillator to the array
		this.choir.push(osc);
		
		//console.log("STARTING CLASS choir length is "+this.choir.length);
		
		//delete any oscillators that have stopped playing.
		osc.onended = function(e){
			e.target._done = true;
			this.choir = this.choir.filter(function(n){
				return !n._done;
			});
			
			//DEBUG: making sure the oscillators are being properly deleted
			//console.log("ENDING CLASS choir length is "+this.choir.length);
		}.bind(this);
		
		//
		//console.log(this.choir.length);
		
	};
	
	//Kept in case I need it later, on the advice of my professor
	Ding.prototype.stop = function(){
		this.choir.forEach(function(osc, _){
			
		});
	};
		
		
	return Ding;
}) (audCon);