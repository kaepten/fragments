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

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};