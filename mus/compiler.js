/*
compiler.js - compiler for the MUS language
*/

/* compileT 
 * @input music expression
 * @input mutable result array
 * @input Timer object
 *
 * returns a list of notes to be played in sequence
 */
var compileT = function(expr, result, timer) {
    switch( expr.tag ){
        case "note":
			{
				var note = cloneNote(expr);// deep copied and scoped to this block
				note.start = timer.getTime();
				note.pitch = convertPitch( note.pitch );
				timer.incrTime(note.dur);

				result.push( note );
			}
            break;
        case "seq":
            compileT(expr.left, result, timer);
            compileT(expr.right, result, timer);
            break;
        case "par":
            parTimer = new Timer(timer.getTime(), true);
            compileT(expr.left, result, parTimer);            
            compileT(expr.right, result, parTimer);

			// next set of note(s) will start when the last of the parallel notes end
            timer.incrTime( parTimer.getAltTime() );
            break;
		case "rest":
			timer.incrTime( expr.duration );
			break;
		case "repeat":
			note = expr.section;
			for(i=0; i < expr.count ; i++) {				
				compileT(note, result, timer);
			}
			break;
    }
};

/*
 * compile - compiles music expressions to notes
 */
var compile = function (musexpr) {
    allNotes = [];
    timer = new Timer(0, false);

    compileT(musexpr, allNotes, timer);

    return allNotes;
};

/*
 * entTime - calculate end time of a given music expression
 */
var endTime = function (time, expr) {
    if(expr.tag == 'note'){
        return time + expr.dur;
    }
    
    return time + endTime(0,expr.left) + endTime(0,expr.right);
};

/*
 * reverse - reverses a music expression
 */
var reverse = function(expr) {
    if(expr.tag == "note"){
        return expr;
    }
    
    var newExpr = { tag:'seq',
                   left: reverse(expr.right),
                   right: reverse(expr.left)
                  };
    
    return newExpr;
};

/*
 * concertPitch - MIDI note numbers for pitches
 * @input pitch
 * @return MIDI note number
 * formula: 12 + 12 * octave + letterPitch
 */
var convertPitch = function(pitch){
	// cheat sheet
	letterPitch = {c:0, d:2, b:11, g:7, a:10 , f:5 , e:4};
	
	return 12 + (12 * pitch[1]) + letterPitch[pitch[0]];
};

/*
 * Timer - keep track of sequential note start time
 * @input start time
 * @input is this a parallel note ? bool
 */
var Timer = function(startTime, par) {
    this.startTime = startTime;
	this.altTime = 0;
	this.isParallel = par;
};

Timer.prototype.getTime = function(){
  return this.startTime;  
};

Timer.prototype.setTime = function(newTime){
    this.startTime = newTime;
};

Timer.prototype.incrTime = function(incr){
	if( this.isParallel ) {
		if( this.altTime < incr ){
	        this.altTime = incr;
	    }
	}else{
		this.startTime += incr;
	}
  
};

Timer.prototype.getAltTime = function(){
  return this.altTime;  
};

/*
 * cloneNote - deep copy a note object
 */
var cloneNote = function(expr) {
	return { tag: expr.tag , dur: expr.dur, pitch: expr.pitch };
}

/*
 * Test
 */
var melody_mus = 
    { tag: 'seq',
      left: 
      {  tag: 'par',
         left:  { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } 
	  },
      right:
      {  tag: 'seq',
         left:  { tag: 'repeat', section: { tag: 'note', pitch: 'c4', dur: 250 }, count: 3 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } 
	  } 
	};

console.log(melody_mus);
console.log(compile(melody_mus));

