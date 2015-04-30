var CoordinateFormat = {"Dmm" : "Dmm","Ddd" : "Ddd","Dms" : "Dms", "LV03" : "LV03","LV95" : "LV95","Unknown" : null};
var Direction = {"East" : "E", "South" : "S", "West" : "W", "North" : "N"};
var Dezimalstellen = 10;

// Breitengrad, Längengrad = latitude, longitude = lat, lon = Nord|Süd, Ost|West (N 47 ..., E 8 ...)
// Breitengrad, Längengrad = Nord, Ost = Y, X = (200000 600000)

function Coordinate(coordinateString)
{
    // private properties
    var that = this;

    // public properties
    this.OriginCoordinateString = coordinateString;

    this.OriginFormat = CoordinateFormat.Unknown;
    this.Lat = "";
    this.Lon = "";
    this.Lv03 = {X:"",Y:""};
    this.Lv95 = {X:"",Y:""};

    this.IsWGS84 = false;
    this.IsSwissGrid = false;
    this.IsValid = false;

    // initialize class (constructor
    ParsePoint(this.OriginCoordinateString);

    this.FormatDms = CoordFormatParser.Parse(this,CoordFormatParser.DmsPattern);
    this.FormatDmm = CoordFormatParser.Parse(this,CoordFormatParser.DmmPattern);
    this.FormatDdd = CoordFormatParser.Parse(this,CoordFormatParser.DddPattern);
    this.FormatLv03 = CoordFormatParser.Parse(this,CoordFormatParser.Lv03Pattern);
    this.FormatLv95 = CoordFormatParser.Parse(this,CoordFormatParser.Lv95Pattern);

    var i = 0;

    this.ToFormat = function(formatString){
        // freier Formatstring -> für Parser
        return CoordFormatParser.Parse(that,formatString);
    };

    // private methods
    function CheckWGS84(){
        switch (that.OriginFormat) {
            case CoordinateFormat.Ddd:
            case CoordinateFormat.Dmm:
            case CoordinateFormat.Dms:
                return true;
            default:
                return false;
        }
    }
    function CheckSwissGrid() {
        switch (that.OriginFormat) {
            case CoordinateFormat.LV03:
            case CoordinateFormat.LV95:
                return true;
            default:
                return false;
        }
    }
    function CheckValid(){
        if(!that.IsSwissGrid && !that.IsWGS84)
        {
            return false;
        }
        return true;
    }
    function CreateWGS84Object(degree, minute, second, input) {
        return {
            Degree : degree,
            Minute : minute,
            Second : second,
            Origin : input
        }
    }
    function CreateLVObject(meter, input) {
        return {
            Meter : meter,
            Origin : input
        }
    }

    function CalculateDmsObjects(){
        var _parseLat = Geo.parseDMS(that.Lat.Origin);
        var _parseLon = Geo.parseDMS(that.Lon.Origin);
        var partsLats = new Array();
        var partsLons = new Array();
        var partsLatm = new Array();
        var partsLonm = new Array();
        var partsLatd = new Array();
        var partsLond = new Array();

        var lats = Geo.toDMS(_parseLat,"dms",Dezimalstellen, partsLats);
        var lons = Geo.toDMS(_parseLon,"dms",Dezimalstellen, partsLons);
        that.Lat.Second = partsLats[2];
        that.Lon.Second = partsLons[2];

        var lats = Geo.toDMS(_parseLat,"dm",Dezimalstellen, partsLatm);
        var lons = Geo.toDMS(_parseLon,"dm",Dezimalstellen, partsLonm);
        that.Lat.Minute = partsLatm[1];
        that.Lon.Minute = partsLonm[1];

        var latd = Geo.toDMS(_parseLat,"d",Dezimalstellen, partsLatd);
        var lond = Geo.toDMS(_parseLon,"d",Dezimalstellen, partsLond);
        that.Lat.Degree = partsLatd[0];
        that.Lon.Degree = partsLond[0];

        return;
    }

    function ParsePoint(pointString) {

        var coordString = pointString.trim();
        var pattdmmRegExp=new RegExp(Parse.DmmRegExp);
        var pattdddRegExp=new RegExp(Parse.DddRegExp);
        var pattdmsRegExp=new RegExp(Parse.DmsRegExp);
        var pattLV03RegExp=new RegExp(Parse.LV03RegExp);
        var pattLV95RegExp=new RegExp(Parse.LV95RegExp);

        if (pattdmmRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Dmm;
            var parts = Parse.Dmm(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateWGS84Object(Number(parts[3]),parseFloat(parts[4] +"."+parts[5]),0,parts[1]);
            that.Lon = CreateWGS84Object(Number(parts[9]),parseFloat(parts[10] +"."+parts[11]),0,parts[7]);
            CalculateDmsObjects();
        } else if (pattdddRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Ddd;
            var parts = Parse.Ddd(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateWGS84Object(parseFloat(parts[3] +"."+parts[4]),0,0,parts[1]);
            that.Lon = CreateWGS84Object(parseFloat(parts[8] +"."+parts[9]),0,0,parts[6]);
            CalculateDmsObjects();
        } else if (pattdmsRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Dms;
            var parts = Parse.Dms(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateWGS84Object(parts[3],parts[4],parseFloat(parts[5] +"."+parts[6]),parts[1]);
            that.Lon = CreateWGS84Object(parts[10],parts[11],parseFloat(parts[12] +"."+parts[13]),parts[8]);
            CalculateDmsObjects();
        } else if (pattLV03RegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.LV03;
            var parts = Parse.LV03(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lv03.Y = CreateLVObject(parseFloat(parts[2] + parts[3] + "." + parts[5]),parts[1]);
            that.Lv03.X = CreateLVObject(parseFloat(parts[7] + parts[8] + "." + parts[10]),parts[6]);
        } else if (pattLV95RegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.LV95;
            var parts = Parse.LV95(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lv95.Y = CreateLVObject(parseFloat(parts[3] + parts[4] + "." + parts[5]),parts[1]);
            that.Lv95.X = CreateLVObject(parseFloat(parts[8] + parts[9] + "." + parts[10]),parts[6]);
        }

        that.IsWGS84 = CheckWGS84()
        that.IsSwissGrid = CheckSwissGrid();
        that.IsValid = CheckValid();

        TransformAllCoordinatesInEachOther();
        return;
    }

    function TransformAllCoordinatesInEachOther() {
        if(that.IsValid){
            if(that.OriginFormat == CoordinateFormat.LV95) {
                //var req = new Request(Number(that.Lon.Degree), Number(that.Lat.Degree), NavrefFormats.LV95, NavrefFormats.LV03);
                //var response = CallNAVREFHandler(req, NAVREFCallBackHandler);
                var lat = CHtoWGSlat(that.Lv95.Y.Meter,that.Lv95.X.Meter);
                var lon = CHtoWGSlng(that.Lv95.Y.Meter,that.Lv95.X.Meter);
                var parts = Parse.Ddd(lat +" "+lon);
                that.Lat = CreateWGS84Object(parseFloat(parts[1]), 0, 0, parts[1]);
                that.Lon = CreateWGS84Object(parseFloat(parts[6]), 0, 0, parts[6]);
                CalculateDmsObjects();
            } else if(that.OriginFormat == CoordinateFormat.LV03) {
                var lat = CHtoWGSlat(that.Lv03.Y.Meter,that.Lv03.X.Meter);
                var lon = CHtoWGSlng(that.Lv03.Y.Meter,that.Lv03.X.Meter);
                var parts = Parse.Ddd(lat +" "+lon);
                that.Lat = CreateWGS84Object(parseFloat(parts[1]), 0, 0, parts[1]);
                that.Lon = CreateWGS84Object(parseFloat(parts[6]), 0, 0, parts[6]);
                CalculateDmsObjects();
            } else if(that.IsWGS84) {
                var _parseLat = Geo.parseDMS(that.Lat.Origin);
                var _parseLon = Geo.parseDMS(that.Lon.Origin);
                var y = WGStoCHy(_parseLat, _parseLon);
                var x = WGStoCHx(_parseLat, _parseLon);
                var parts = Parse.LV03(y + " " + x);
                that.Lv03.Y = CreateLVObject(parseFloat(parts[2] + parts[3] + "." + parts[5]), parts[1]);
                that.Lv03.X = CreateLVObject(parseFloat(parts[7] + parts[8] + "." + parts[10]), parts[6]);
                //var req = new Request(Number(that.Lon.Degree), Number(that.Lat.Degree), NavrefFormats.Ddd, NavrefFormats.LV95);
                //var response = CallNAVREFHandler(req, NAVREFCallBackHandler);
            }
        }
    }

    function NAVREFCallBackHandler(coord, req) {
        if(req.Output == NavrefFormats.LV95) {
            that.Lv95.Y = coord.easting;
            that.Lv95.X = coord.northing;
        }
        if(req.Output == NavrefFormats.LV03) {
            that.Lv03.Y = coord.easting;
            that.Lv03.X = coord.northing;
        }
    }
}

Coordinate.GetFormat = function(formatConst, coordinate){
    // Konstantes Format
    if(formatConst ==CoordinateFormat.Ddd)
    {
        return coordinate.FormatDdd;
    }
    if(formatConst ==CoordinateFormat.Dmm)
    {
        return coordinate.FormatDmm;
    }
    if(formatConst ==CoordinateFormat.Dms)
    {
        return coordinate.FormatDms;
    }
    if(formatConst ==CoordinateFormat.LV03)
    {
        return coordinate.FormatLv03;
    }
    if(formatConst ==CoordinateFormat.LV95)
    {
        return coordinate.FormatLv95;
    }
    return 'undefined';
};


var Parse = {
    DddRegExp : /^(([NS-])?\s*(\d{1,2})[.,]+(\d*)\s*[:d°]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[.,]+(\d*)\s*[:d°]?)\s*([EOW])?$/gmi,
    DmmRegExp : /^(([NS-])?\s*(\d{1,2})[\s:d°]+\s*(\d{1,2})[.,]?(\d*)\s*[:'´’\u2032]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[\s:d°]+\s*(\d{1,2})[.,]?(\d*)\s*[:'´’\u2032]?)\s*([EOW])?$/gmi,
    DmsRegExp : /^(([NS-])?\s*(\d{1,2})[\s:d°]+\s*(\d{1,2})\s*[:'´’\u2032]?\s*(\d{1,2})[.,]?(\d*)\s*[:“"\u2033]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[\s:d°]+\s*(\d{1,2})\s*[:'´’\u2032]?\s*(\d{1,2})[.,]?(\d*)\s*[:“"\u2033]?)\s*([EOW])?$/gmi,
    LV03RegExp : /^((\d\d\d)[\s,.]*(\d\d\d)([,.](\d*))?)[\s\/]*\s*((\d\d\d)[\s,.]*(\d\d\d)([,.](\d*))?)$/gmi,
    LV95RegExp : /^((Ost|E|East|O)?\s*2[\s]*(\d\d\d)[\s,.]*(\d\d\d)[,.]?(\d*))[\s\/]*\s*((Nord|N|North)?\s*1[\s]*(\d\d\d)[\s,.]*(\d\d\d)[,.]?(\d*))$/gmi
};

var PageParse = {
    DddRegExp : /(([NS-])?\s*(\d{1,2})[.,]+(\d*)\s*[:d°]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[.,]+(\d*)\s*[:d°]?)\s*([EOW])?/gmi,
    DmmRegExp : /(([NS-])?\s*(\d{1,2})[\s:d°]+\s*(\d{1,2})[.,]?(\d*)\s*[:'´’\u2032]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[\s:d°]+\s*(\d{1,2})[.,]?(\d*)\s*[:'´’\u2032]?)\s*([EOW])?/gmi,
    DmsRegExp : /(([NS-])?\s*(\d{1,2})[\s:d°]+\s*(\d{1,2})\s*[:'´’\u2032]?\s*(\d{1,2})[.,]?(\d*)\s*[:“"\u2033]?)\s*([NS])?[\s,/\\]*(([EOW-])?\s*(\d{1,3})[\s:d°]+\s*(\d{1,2})\s*[:'´’\u2032]?\s*(\d{1,2})[.,]?(\d*)\s*[:“"\u2033]?)\s*([EOW])?/gmi,
    LV03RegExp : /((\d\d\d)[\s,.]*(\d\d\d)([,.](\d*))?)[\s\/]*\s*((\d\d\d)[\s,.]*(\d\d\d)([,.](\d*))?)/gmi,
    LV95RegExp : /((Ost|E|East|O)?\s*2[\s]*(\d\d\d)[\s,.]*(\d\d\d)[,.]?(\d*))[\s\/]*\s*((Nord|N|North)?\s*1[\s]*(\d\d\d)[\s,.]*(\d\d\d)[,.]?(\d*))/gmi
};

Parse.Dmm = function (dmmString) {
    // parse coord from format = DD°MM.MMMM (Dmm)
    var myPattern = new RegExp(Parse.DmmRegExp);
    var match = myPattern.exec(dmmString.toString());
    if (dmmString.match(Parse.DmmRegExp)) {
        return match;
    }
    return "Error";
}
Parse.Ddd = function (dddString) {
    // parse coord from format = DD.DDDDDD° (Ddd)
    var myPattern = new RegExp(Parse.DddRegExp);
    var match = myPattern.exec(dddString.toString());
    if (dddString.match(Parse.DddRegExp)) {
        return match;
    }
    return "Error";
}
Parse.Dms = function (dmsString) {
    // parse coord from format = DD° DD' DD.DDD'' (Dms)
    var myPattern = new RegExp(Parse.DmsRegExp);
    var match = myPattern.exec(dmsString.toString());
    if (dmsString.match(Parse.DmsRegExp)) {
        return match;
    }
    return "Error";
}
Parse.LV03 = function (swissString) {
    // parse coord from format = dddddd / dddddd (swiss)
    var myPattern = new RegExp(Parse.LV03RegExp);
    var match = myPattern.exec(swissString.toString());
    if (swissString.match(Parse.LV03RegExp)) {
        return match;
    }
    return "Error";
}
Parse.LV95 = function (swissString) {
    // parse coord from format = dddddd / dddddd (swiss)
    var myPattern = new RegExp(Parse.LV95RegExp);
    var match = myPattern.exec(swissString.toString());
    if (swissString.match(Parse.LV95RegExp)) {
        return match;
    }
    return "Error";
}

var CoordFormatParser = {
    DmsPattern : "[lat.p:N,S] [lat.d:0,2]° [lat.m:0]′ [lat.s:0].[lat.s:3]″ [lon.p:E,W] [lon.d:0,3]° [lon.m:0]′ [lon.s:0].[lon.s:3]″",
    DmmPattern : "[lat.p:N,S] [lat.d:0,2]° [lat.m:0].[lat.m:4]′ [lon.p:E,W] [lon.d:0,3]° [lon.m:0].[lon.m:4]′",
    DddPattern : "[lat.p:N,S] [lat.d:0,2].[lat.d:6]° [lon.p:E,W] [lon.d:0,3].[lon.d:6]°",
    Lv03Pattern : "[lv03.y:1-3,0] [lv03.y:4-6,0].[lv03.y:0,2] / [lv03.x:1-3,0] [lv03.x:4-6,0].[lv03.x:0,2]",
    Lv95Pattern : "N 2[lv95.y:0-3,0][lv95.y:3-6,0].[lv95.y:0,2] E 1[lv95.x:0-3,0][lv95.x:3-6,0].[lv95.x:0,2]",

    Parse : function(coord, coordFormatString)
    {
        var reg = /\[(lat|lon)\.(\w{1})\:?(.*?)\]/gmi;
        var regSwiss = /\[(lv03|lv95)\.(x|y):((\d-\d|\d),?(\d)?)\]/gmi;
        var parseOutput = coordFormatString;
        while (formatStringParts = reg.exec(coordFormatString)) {
            parseOutput = this.FormatWgs84(parseOutput, formatStringParts, coord);
        }
        while (formatStringParts = regSwiss.exec(coordFormatString)) {
            switch(formatStringParts[1]) {
                case "lv03":
                    parseOutput = this.FormatSwiss(parseOutput, formatStringParts, coord, CoordinateFormat.LV03);
                    break;
                case "lv95":
                    parseOutput = this.FormatSwiss(parseOutput, formatStringParts, coord, CoordinateFormat.LV95);
                    break;
            }
        }
        return parseOutput;
    },

    FormatWgs84 : function(coordFormatString, inputValue, coord)  {
        switch (inputValue[2]) {
            case "p":
                if(inputValue[3]==null || inputValue[3] == "") {
                    var re = new RegExp('\\['+inputValue[1]+'\\.p\\]','gi');
                    coordFormatString = coordFormatString.replace(re, coord.Lat.Degree<0 ? "-" : "");
                }
                else {
                    var re = new RegExp('\\['+inputValue[1]+'\.p:?(.*?)\\]','gi');
                    var directions = inputValue[3].split(",");
                    var testValue = inputValue[1]=="lat" ? coord.Lat.Degree : coord.Lon.Degree;
                    var dir = testValue<0 ? directions[1] : directions[0];
                    coordFormatString = coordFormatString.replace(re, dir);
                }
                break;
            case "d":
            case "m":
            case "s":
                coordFormatString = this.FormatReplace(coordFormatString, inputValue, coord);
                break;
        }
        return coordFormatString;
    },
    FormatSwiss : function(coordFormatString, inputValue, coord, type){
        var typedCoord;
        if(type == CoordinateFormat.LV03) {
            typedCoord = coord.Lv03;
        } else if(type == CoordinateFormat.LV95) {
            typedCoord = coord.Lv95;
        }
        switch (inputValue[2]) {
            case "x":
                coordFormatString = this.FormatReplaceSwiss(coordFormatString, inputValue,typedCoord.X.Meter);
                break;
            case "y":
                coordFormatString = this.FormatReplaceSwiss(coordFormatString, inputValue,typedCoord.Y.Meter);
                break;
        }
        return coordFormatString;
    },
    FormatReplace : function(coordFormatString, inputValue, coord) {
        var decimalNumber = inputValue[3];
        var part = inputValue[2];
        var dir = inputValue[1];
        var currentValue = 0;
        var replacePattern = inputValue[0];
        var reP = new RegExp(/^(\d*)?(,(\d*))?$/gi);
        var z = reP.exec(decimalNumber);
        var padding = 0;
        if(z) {
            decimalNumber = Number(z[1]);
            if(z[3]){
                padding = Number(z[3]);
            }
        }
        else {
            decimalNumber = Number(decimalNumber);
        }

        var coordDirValue = null;
        if(inputValue[1]=="lat") {
            coordDirValue = coord.Lat;
        } else {
            coordDirValue = coord.Lon;
        }
        switch (part) {
            case "d":
                currentValue = coordDirValue.Degree;
                break;
            case "m":
                currentValue = coordDirValue.Minute;
                break;
            case "s":
                currentValue = coordDirValue.Second;
                break;
        }
        currentValue = Math.abs(currentValue); // Vorzeichen entfernen
        var dezNumber = 0;
        if(!isNaN(decimalNumber) && decimalNumber != null)
        {
            decimalNumber = Number(decimalNumber);
            if(decimalNumber==0)
            {
                dezNumber = String(currentValue).split(".")[0];
            } else {
                dezNumber = runde(currentValue, decimalNumber);
                dezNumber = String(dezNumber).split(".")[1];
            }
        }
        else if (decimalNumber == null || isNaN(decimalNumber))
        {
            dezNumber = runde(currentValue, 0);
        }
        var re = new RegExp('\\['+dir+'\\.'+part+'\\:?'+decimalNumber+'\\]','g');
        if(padding > 0) {
            dezNumber = String(dezNumber).fill(padding, '0',RIGHT);
        }
        return coordFormatString.replace(replacePattern, dezNumber);
    },
    FormatReplaceSwiss : function(coordFormatString, inputValue, xyValue){
        var cut = false;
        var decNumber = -1;
        var fromTo = inputValue[4].split("-");
        if(inputValue[5] != undefined){
            if(inputValue[5] == 0) { cut = true; }
            decNumber = inputValue[5];
            if(fromTo[0]==0 || fromTo[1]== 6){
                if(!cut) {
                    xyValue = runde(Number(xyValue), Number(decNumber));
                }
            }
        } else {
            xyValue = Math.round(xyValue);
            // alert("round:"+xyValue);
        }
        if(fromTo.length > 1) {
            coordFormatString = coordFormatString.replace(inputValue[0], String(xyValue).substring(fromTo[0]-1,fromTo[1]));
        }  else {
            coordFormatString = coordFormatString.replace(inputValue[0], String(xyValue).split(".")[1]);
        }
        return coordFormatString;
    }
};
