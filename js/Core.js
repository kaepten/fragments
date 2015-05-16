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

    var fill = c.xCount(width - len);

    var start = align === LEFT ? fill.length :
        align === CENTER ? fill.length - (width - len   -1) / 2 : 0;

    return (fill + this + fill).substr(start, width);
};

String.prototype.xCount = function(num) {
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

Core.AppendLinkCursor = function(element)
{
    element.hover(function() {
        $(this).css('cursor','pointer');
    }, function() {
        $(this).css('cursor','auto');
    });
};


/**
 * @param {number} n The max number of characters to keep.
 * @return {string} Truncated string.
 */
String.prototype.trunc = String.prototype.trunc ||
function(n) {
    return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
};


// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
Core.StringDivider = function (str, width, spaceReplacer) {
    if (str.length > width) {
        var p = width;
        for (; p > 0 && (str[p] != ' ' && str[p] != '-'); p--) {
        }
        if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
                left = str.substring(0, p + 1);
            } else {
                left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
        }
    }
    return str;
}

Core.Confirm = function(questionString) {
    "use strict";
    return confirm(questionString);
}

/**
 * Rundet eine Zahl X auf n Nachkommastellen
 * @param x
 * @param n
 * @returns {*}
 */
Core.Round = function runde(x, n) {
    if (n < 1 || n > 14) return Math.round(x);
    var e = Math.pow(10, n);
    var k = (Math.round(x * e) / e).toString();
    if (k.indexOf('.') == -1) k += '.';
    k += e.toString().substring(1);
    return k.substring(0, k.indexOf('.') + n+1);
}

/**
 * Fügt einer Zahl Tausender Trennzeichen hinzu. Kommastelle als Punkt!
 * @param number
 * @returns {*}
 * @constructor
 */
Core.Trenner = function(number) {
    // Info: Die '' sind zwei Hochkommas
    var nachkomma = "";
    if(number.indexOf(".") > -1) {
        nachkomma = number.split(".")[1];
        number = number.split(".")[0];
    }

    number = '' + number;
    if (number.length > 3) {
        var mod = number.length % 3;
        var output = (mod > 0 ? (number.substring(0,mod)) : '');
        for (i=0 ; i < Math.floor(number.length / 3); i++) {
            if ((mod == 0) && (i == 0)) {
                output += number.substring(mod + 3 * i, mod + 3 * i + 3);
            } else {
                // hier wird das Trennzeichen festgelegt mit '.'
                output += "'" + number.substring(mod + 3 * i, mod + 3 * i + 3);
            }
        }
        if(nachkomma.length > 0) {
            return(output +"."+nachkomma);
        } else {
            return (output);
        }
    }
    else return number;
}