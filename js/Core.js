var Core = {};

Core.AllElementsAsString = function (array, htmlLineBreaks) {
    var myArray = array;
    var result = "";
    var breakSymbol = " - ";
    if(htmlLineBreaks)
    {
        var breakSymbol = "<br>";
    }

    for (var i = 0; i < myArray.length; i++) {

        result = result + breakSymbol + i + " = " + array[i];

    }
    return result;
};

Core.Fill = function(str, char, length, left){
    var retStr = str;
    if(str.toString().length < length)
    {
        retStr = str.toString();
        for(var i = 0; i<(length -str.toString().length); i++){
            if(left)
            {
                retStr = char + retStr;
            }
            else
            {
                retStr = retStr + char;
            }
        }
    }
    return retStr;
};


String.prototype.format = function() {
    // var input = "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET");
    // console.log(input);
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};

if (!String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}

//String.prototype.trim = function () {
  //  return this.replace(/^\s*/, "").replace(/\s*$/, "");
//};

// String.format(width [, char , align])
// returns a string with a fixed length,
// filled with char (default = " ")
// align = CENTER, LEFT, RIGHT
var CENTER = 'CENTER';
var LEFT = 'LEFT';
var RIGHT = 'RIGHT';
String.prototype.fill = function(width, c , align) {
    if(!this.length || !width || width < 0) return '';
    var len = this.length ;
    if(width < len) return this.substr(0, width);
    if(!c) c = " ";
    if(!align) align = LEFT;

    var fill = c.x(width - len);

    var start = align === LEFT ? fill.length :
        align === CENTER ? fill.length - (width - len   -1) / 2 : 0;

    return (fill + this + fill).substr(start, width);
};

String.prototype.x = function(num) {
    if(!num || num < 0) return '';
    var tmp = this;
    while(--num) { tmp += this; };
    return tmp;
};

var idList = [1];
function getGUID(){
    /*
    var oldId = _globalCoordinateUiIdList[_globalCoordinateUiIdList.length-1];
    var newId = ++oldId;
    _globalCoordinateUiIdList.push(newId);
    return newId;
    */

    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};
