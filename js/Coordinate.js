var CoordinateFormat = {"Deg" : "Deg","Dec" : "Dec","Dms" : "Dms", "LV03" : "LV03","LV95" : "LV95","Unknown" : null};

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
    this.Y = "";
    this.X = "";

    this.Dec = "";
    this.Deg = "";
    this.Dms = "";
    this.Lv03 = "";
    this.Lv95 = "";

    this.IsWGS84 = false;
    this.IsSwissGrid = false;
    this.IsValid = false;

    this.Format = function (coordinateFormat) {
        switch (coordinateFormat) {
            case CoordinateFormat.Dec:
                return that.Dec.Format;
            case CoordinateFormat.Deg:
                return that.Deg.Format;
            case CoordinateFormat.Dms:
                return that.Dms.Format;
            case CoordinateFormat.LV03:
                return that.Lv03.Format;
            case CoordinateFormat.LV95:
                return that.Lv95.Format;
            default:
                return '';
        }
    }
    // initialize class (constructor
    ParsePoint(this.OriginCoordinateString);

    // private methods
    function CheckWGS84(){
        switch (that.OriginFormat) {
            case CoordinateFormat.Dec:
            case CoordinateFormat.Deg:
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
    function CreateObject(prefix, degree, minute, second, meter, parts, input) {
        return {
            Prefix : prefix,
            Degree : degree,
            Minute : minute,
            Second : second,
            Parts  : parts,
            Meter  : meter,
            Origin : input
        }
    }
    function CreateWGS84Object(partsLat, partsLon) {
        return {
            Lat : {
                Degree : partsLat[0],
                Minute : partsLat[1],
                Second : partsLat[2]
            },
            Lon : {
                Degree : partsLon[0],
                Minute : partsLon[1],
                Second : partsLon[2]
            },
            Format : ""
        }
    }
    function CreateSwissObject(prefix, x, y) {
        return {
            Prefix : prefix,
            X : x,
            Y : y
        }
    }
    function CalculateDmsObjects(){
        var _parseLat = Geo.parseDMS(that.Lat.Origin);
        var _parseLon = Geo.parseDMS(that.Lon.Origin);
        var partsLat = new Array();
        var partsLon = new Array();
        // dms
        Geo.toDMSCom(_parseLat,_parseLon,partsLat, partsLon,"dms",10);
        that.Dms = CreateWGS84Object(partsLat, partsLon);
        that.Dms.Format = CoordFormatParser.Parse(that.Dms,CoordFormatParser.DmsPattern);
        // dm
        Geo.toDMSCom(_parseLat,_parseLon,partsLat, partsLon,"dm",10);
        that.Deg = CreateWGS84Object(partsLat, partsLon);
        that.Deg.Format = CoordFormatParser.Parse(that.Deg,CoordFormatParser.DegPattern);
        // d
        Geo.toDMSCom(_parseLat,_parseLon,partsLat, partsLon,"d",10);
        that.Dec = CreateWGS84Object(partsLat, partsLon);
        that.Dec.Format = CoordFormatParser.Parse(that.Dec,CoordFormatParser.DecPattern);
    }
    function CalculateSwissGridObjects() {
        that.Lv03 = CreateSwissObject("",that.X.Meter, that.Y.Meter);
        that.Lv03.Format = CoordFormatParser.Parse(that.Lv03,CoordFormatParser.Lv03Pattern);
        that.Lv95 = CreateSwissObject("",that.X.Meter, that.Y.Meter);
        that.Lv95.Format = CoordFormatParser.Parse(that.Lv95,CoordFormatParser.Lv95Pattern);
    }
    function ParsePoint(pointString) {

        var coordString = pointString.trim();
        var pattdegRegExp=new RegExp(Parse.DegRegExp);
        var pattdecRegExp=new RegExp(Parse.DecRegExp);
        var pattdmsRegExp=new RegExp(Parse.DmsRegExp);
        var pattLV03RegExp=new RegExp(Parse.LV03RegExp);
        var pattLV95RegExp=new RegExp(Parse.LV95RegExp);

        if (pattdegRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Deg;
            var parts = Parse.Deg(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateObject(parts[2],parts[3],parseFloat(parts[4] +"."+parts[5]),null,null,parts,parts[1]);
            that.Lon = CreateObject(parts[7],parts[8],parseFloat(parts[9] +"."+parts[10]),null,null,parts,parts[6]);
            CalculateDmsObjects();
        } else if (pattdecRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Dec;
            var parts = Parse.Dec(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateObject(parts[2],parseFloat(parts[3] +"."+parts[4]),null,null,null,parts,parts[1]);
            that.Lon = CreateObject(parts[6],parseFloat(parts[7] +"."+parts[8]),null,null,null,parts,parts[5]);
            CalculateDmsObjects();
        } else if (pattdmsRegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.Dms;
            var parts = Parse.Dms(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Lat = CreateObject(parts[2],parts[3],parts[4],parseFloat(parts[5] +"."+parts[6]),null,parts,parts[1]);
            that.Lon = CreateObject(parts[8],parts[9],parts[10],parseFloat(parts[11] +"."+parts[12]),null,parts,parts[7]);
            CalculateDmsObjects();
        } else if (pattLV03RegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.LV03;
            var parts = Parse.LV03(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Y = CreateObject(null,null,null,null,parseFloat(parts[2] + parts[3] + "." + parts[4]),parts, parts[1]);
            that.X = CreateObject(null,null,null,null,parseFloat(parts[6] + parts[7] + "." + parts[8]),parts, parts[5]);
            CalculateSwissGridObjects();
        } else if (pattLV95RegExp.test(coordString)) {
            that.OriginFormat = CoordinateFormat.LV95;
            var parts = Parse.LV95(coordString);
            that.Out = Core.AllElementsAsString(parts, true);
            that.Y = CreateObject(null,null,null,null,parseFloat(parts[3] + parts[4] + "." + parts[5]),parts, parts[1]);
            that.X = CreateObject(null,null,null,null,parseFloat(parts[8] + parts[9] + "." + parts[10]),parts, parts[6]);
            CalculateSwissGridObjects();
        }

        that.IsWGS84 = CheckWGS84()
        that.IsSwissGrid = CheckSwissGrid();
        that.IsValid = CheckValid();

        if(that.IsValid && that.IsSwissGrid){
            var lat = CHtoWGSlat(that.Y.Meter,that.X.Meter);
            var lon = CHtoWGSlng(that.Y.Meter, that.X.Meter);
            var parts = Parse.Dec(lat +" "+lon);
            that.Lat = CreateObject(parts[2],parseFloat(parts[3] +"."+parts[4]),null,null,null,parts,parts[1]);
            that.Lon = CreateObject(parts[6],parseFloat(parts[7] +"."+parts[8]),null,null,null,parts,parts[5]);
            CalculateDmsObjects();
        } else if(that.IsValid && that.IsWGS84){
            var _parseLat = Geo.parseDMS(that.Lat.Origin);
            var _parseLon = Geo.parseDMS(that.Lon.Origin);
            var y = WGStoCHy(_parseLat, _parseLon);
            var x = WGStoCHx(_parseLat, _parseLon);
            var parts = Parse.LV03(y + " " + x);
            that.Y = CreateObject(null,null,null,null,parseFloat(parts[2] + parts[3] + "." + parts[4]),parts, parts[1]);
            that.X = CreateObject(null,null,null,null,parseFloat(parts[6] + parts[7] + "." + parts[8]),parts, parts[5]);
            CalculateSwissGridObjects();
        }

        return;
    }
}

var Parse = {
    DegRegExp : /^(([NS-]?)\s*(\d{1,3})\s*[°|\s]\s*(\d\d)[.,](\d*)\s*['\u2032]?)\s*(([EOW-]?)\s*(\d{1,3})\s*[°|\s]\s*(\d\d)[.,](\d*)\s*['\u2032]?)$/gmi, // DD°MM.MMMM
    DecRegExp : /^(([NS-])?\s*(\d{1,3})[.,](\d*)\s*°?)?\s*(([EOW-])?\s*(\d{1,3})[.,](\d*)\s*°?)?$/gmi, // DD.DDDDDD°
    DmsRegExp : /^(([NS-])\s*(\d{1,2})°\s*(\d{1,2})['′]\s*(\d{1,2})[.,]?(\d*)['|"|\u2033]+)\s*(([EOW-])\s*(\d{1,3})°\s*(\d{1,2})['′]\s*(\d{1,2})[.,]?(\d*)['|"|\u2033]+)/gmi, // DD°DD'DD.DD''
    LV03RegExp : /^((\d\d\d)[\s.]*(\d\d\d)[,.]?(\d*))[\s\/]*\s*((\d\d\d)[\s.]*(\d\d\d)[,.]?(\d*))$/gmi, // ddd ddd / ddd ddd
    LV95RegExp : /^((Ost)?\s*2[\s]*(\d\d\d)[\s.]*(\d\d\d)[,.]?(\d*))[\s\/]*\s*((Nord)?\s*1[\s]*(\d\d\d)[\s.]*(\d\d\d)[,.]?(\d*))$/gmi
};

Parse.Deg = function (degString) {
    // parse coord from format = DD°MM.MMMM (Deg)
    var myPattern = new RegExp(Parse.DegRegExp);
    var match = myPattern.exec(degString.toString());
    if (degString.match(Parse.DegRegExp)) {
        return match;
    }
    return "Error";
}
Parse.Dec = function (decString) {
    // parse coord from format = DD.DDDDDD° (Dec)
    var myPattern = new RegExp(Parse.DecRegExp);
    var match = myPattern.exec(decString.toString());
    if (decString.match(Parse.DecRegExp)) {
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
    DmsPattern : "[dms.lat.p:N,E,S,W] [dms.lat.d]° [dms.lat.m]′[dms.lat.s:0].[dms.lat.s:4]″ [dms.lon.p:N,E,S,W] [dms.lon.d]° [dms.lon.m]′[dms.lon.s:0].[dms.lon.s:4]″",
    DegPattern : "[lat.p][lat.d:,2]° [lat.m:0].[lat.m:3]′ :-: [lon.p][lon.d:,3]° [lon.m:0].[lon.m:3]′",
    DecPattern : "[dec.lat.p][dec.lat.d].[dec.lat.d:6]° [dec.lon.p][dec.lon.d:0].[dec.lon.d:6]°",
    Lv03Pattern : "[lv03.y:1-3,0] [lv03.y:4-6,0].[lv03.y:0,2] / [lv03.x:1-3,0] [lv03.x:4-6,0].[lv03.x:0,2]",
    Lv95Pattern : "2[lv95.y:0-3,0][lv95.y:3-6,0].[lv95.y:0,2] / 1[lv95.x:0-3,0][lv95.x:3-6,0].[lv95.x:0,2]",

    Parse : function(coord, coordFormatString)
    {
        var reg = /\[(dec|deg|dms)\.(\w{3})\.(\w{1,2})\:?(.*?)\]/gmi;
        var regSwiss = /\[(lv03|lv95)\.(x|y):((\d-\d|\d),?(\d)?)\]/gmi;

        var parseOutput = coordFormatString;
        while (formatStringParts = reg.exec(coordFormatString)) {

            switch (formatStringParts[1]) {
                case "dec":
                    parseOutput = this.FormatDms(parseOutput, formatStringParts, coord, "dec");
                    break;
                case "dms":
                    parseOutput = this.FormatDms(parseOutput, formatStringParts, coord, "dms");
                    break;
                case "deg":
                    parseOutput = this.FormatDms(parseOutput, formatStringParts, coord, "deg");
                    break;
            }
        }

        while (formatStringParts = regSwiss.exec(coordFormatString)) {
            switch(formatStringParts[1]) {
                case "lv03":
                    parseOutput = this.FormatSwiss(parseOutput, formatStringParts, coord, "lv03");
                    break;
                case "lv95":
                    parseOutput = this.FormatSwiss(parseOutput, formatStringParts, coord, "lv95");
                    break;
            }
        }
        return parseOutput;
    },

    FormatDms : function(coordFormatString, inputValue, coord, dmsType)  {
        var outValue = "";
        var dir = "";
        switch (inputValue[3]) {
            case "p":
                // lat=='' ? '' : (deg<0 ? 'S ' : 'N ')
                if(inputValue[2] == "lat")
                {
                    if(inputValue[4]==null || inputValue[4] == "") {
                        coordFormatString = coordFormatString.replace(/\[d\w{2}\.lat\.p\]/gi, coord.Lat.Degree<0 ? "-" : "");
                    }
                    else {
                        var directions = inputValue[4].split(",");
                        var dir = coord.Lat.Degree<0 ? directions[2] : directions[0];
                        coordFormatString = coordFormatString.replace(/\[d\w{2}\.lat\.p:?(.*?)\]/gi, dir);
                    }
                }
                if(inputValue[2] == "lon")
                {
                    if(inputValue[4]==null || inputValue[4] == "") {
                        coordFormatString = coordFormatString.replace(/\[d\w{2}\.lon\.p\]/gi, coord.Lon.Degree<0 ? "-" : "");
                    } else {
                        var directions = inputValue[4].split(",");
                        var dir = coord.Lon.Degree<0 ? directions[3] : directions[1];
                        coordFormatString = coordFormatString.replace(/\[d\w{2}\.lon\.p:?(.*?)\]/gi, dir);
                    }
                }
                break;
            case "d":
                dir = "lat";
                if(inputValue[2] == dir) {
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lat.Degree, dir, dmsType,"d");
                }
                dir = "lon";
                if(inputValue[2] == dir){
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lon.Degree, dir, dmsType,"d");
                }
                break;
            case "m":
                dir = "lat";
                if(inputValue[2] == dir) {
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lat.Minute, dir, dmsType,"m");
                }
                dir = "lon";
                if(inputValue[2] == dir){
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lon.Minute, dir, dmsType,"m");
                }
                break;
            case "s":
                dir = "lat";
                if(inputValue[2] == dir) {
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lat.Second, dir, dmsType,"s");
                }
                dir = "lon";
                if(inputValue[2] == dir){
                    coordFormatString = this.FormatReplace(coordFormatString, inputValue[4], coord.Lon.Second, dir, dmsType,"s");
                }
                break;
        }
        return coordFormatString;
    },

    FormatSwiss : function(coordFormatString, inputValue, coord, type){
        switch (inputValue[2]) {
            case "x":
                coordFormatString = this.FormatReplaceSwiss(coordFormatString, inputValue,coord.X);
                break;
            case "y":
                coordFormatString = this.FormatReplaceSwiss(coordFormatString, inputValue,coord.Y);
                break;
        }
        return coordFormatString;
    },

    FormatReplace : function(coordFormatString, decimalNumber, currentValue, dir, type, part) {
        currentValue = Math.abs(currentValue); // Vorzeichen entfernen
        if(decimalNumber != null && decimalNumber != "")
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
        else if (decimalNumber == null || decimalNumber == "")
        {
            dezNumber = runde(currentValue, Number(decimalNumber));
        }
        var re = new RegExp('\\['+type+'\\.'+dir+'\\.'+part+'\\:?'+decimalNumber+'\\]','g');
        return coordFormatString.replace(re, dezNumber);
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
