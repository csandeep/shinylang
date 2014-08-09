/*
compiler.js - compiler for the MUS language
*/

/* compileT 
 * @input music expression
 * @input mutable result array
 * @input timer object
 *
 * returns a list of notes to be played in sequence
 */
var compileT = function(expr, result, timer) {
    switch( expr.tag ){
        case "note":
            expr.start = timer.getTime();
            timer.incrTime(expr.dur);

            result.push( expr );
            break;
        case "seq":
            compileT(expr.left, result, timer);
            compileT(expr.right, result, timer);
            break;
        case "par":
            parTimer = new ParallelTimer(timer.getTime());
            compileT(expr.left, result, parTimer);            
            compileT(expr.right, result, parTimer);

			// next set of note(s) will start when the last of the parallel notes end
            timer.incrTime( parTimer.getAltTime() );
            break;
    }
};

/*
 * compile - compiles music expressions to notes
 */
var compile = function (musexpr) {
    allNotes = [];
    timer = new Timer(0);

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
 * Timer - keep track of sequential note start time
 */
var Timer = function(startTime) {
    this.startTime = startTime;
};

Timer.prototype.getTime = function(){
  return this.startTime;  
};

Timer.prototype.setTime = function(newTime){
    this.startTime = newTime;
};

Timer.prototype.incrTime = function(incr){
  this.startTime += incr;  
};

/*
 * ParallelTimer - keep track of parallel note start time
 */
var ParallelTimer = function(startTime){
    Timer.call(this, startTime);
    this.altTime = 0;
};

ParallelTimer.prototype = Object.create(Timer.prototype);
ParallelTimer.constructor = ParallelTimer;
ParallelTimer.prototype.incrTime = function(incr){
    if( this.altTime < incr ){
        this.altTime = incr;
    }
};

ParallelTimer.prototype.getAltTime = function(){
  return this.altTime;  
};


