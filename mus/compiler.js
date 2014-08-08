/*
compiler.js - compiler for the MUS language
*/

/* compileT 
 * @input music expression
 * @input mutable result array
 *
 * returns a list of notes to be played in sequence
 */
var compileT = function(expr, result) {
    if( expr.tag == 'note' ) {
        result.push( expr );
        return;
    }

    compileT(expr.left, result);
    compileT(expr.right, result);
};

/*
 * compile - compiles music expressions to notes
 */
var compile = function (musexpr) {
    allNotes = [];
    compileT(musexpr, allNotes);
    time = 0;
    
    allNotes.map( function(expr) {
	    expr.start = time;
	    time+= expr.dur;
	});
    
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


