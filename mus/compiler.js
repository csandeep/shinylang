/*
compiler.js - compiler for the MUS language
*/

var compile = function (musexpr) {
    notes = [];
    startTime = {timer:0};
    listNotes(notes,startTime, 0, musexpr);

    return notes;
};

var listNotes = function (notes, startTime, isPar, expr){
    if(expr.tag == "note"){
        expr.start = startTime.timer;
        
        if(!isPar){
            startTime.timer += expr.dur;
        }
        
        notes.push(expr);
    }
    
    if(expr.tag == "seq"){
        listNotes(notes, startTime, 0, expr.left);
        listNotes(notes, startTime, 0, expr.right);
    }
    
    if(expr.tag == "par"){
        listNotes(notes, startTime, 1, expr.left);
        listNotes(notes, startTime, 0, expr.right);        
    }
    
    return notes;
};

var endTime = function (time, expr) {
    if(expr.tag == 'note'){
        return time + expr.dur;
    }
    
    return time + endTime(0,expr.left) + endTime(0,expr.right);
};

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


