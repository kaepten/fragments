function ParseCoordinates() {
    var pageParserRegExp = /(?!id="geoMapsCoord1"\s*)([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d*)['|′]*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d*)['|′]*/gmi;
    $.fn.egrep = function(pat) {
        var out = [];
        var lastParent;
        var textNodes = function(n) {
            if (n.nodeType == 3) {
                var t = typeof pat == 'string' ? n.nodeValue.indexOf(pat) != -1 : pat.test(n.nodeValue);
                if (t) {
                    if (lastParent == undefined || lastParent != n.parentNode) {
                        lastParent = n.parentNode;

                        var idElement = $(n).closest('[id^=GeoMapsCalculator]'); // koordinaten im Calculator auslassen
                        if(idElement.length==0) {
                            out.push(n.parentNode);
                        }
                    }
                }
            }
            else {
                $.each(n.childNodes, function(a, b) {
                    textNodes(b);
                });
            }
        };
        this.each(function() {
            textNodes(this);
        });
        return out;
    };

    var n = $('body').egrep(pageParserRegExp);
    var coords = new Array();
    var coordIndex = 0;
    for (var i = 0; i < n.length; ++i) {
        try {
            var validCoordinates = ($(n[i]).html()).match(pageParserRegExp);
            var replaceHtml = replaceHtml = $(n[i]).html();  // .trim().replace(/(\r\n|\n|\r)/gm,"");
            var idSpan = $(n[i]);
            if(idSpan[0].id.contains('geoMapsCoord')) { // die seite wurde bereits geparst und ids verteilt
                var coord = new Coordinate(validCoordinates[0]);
                coords.push(coord);
                coordIndex++;
            }
            else {
                for (var ii = 0; ii < validCoordinates.length; ++ii) {
                    var coord = new Coordinate(validCoordinates[ii]);
                    if (!coord.IsValid) {
                        alert('Fehler beim parsen der Koordinate!');
                    }
                    coords.push(coord);
                    replaceHtml = replaceHtml.replace(validCoordinates[ii], '<span id="geoMapsCoord' + coordIndex + '" style="color:white;">' + validCoordinates[ii] + '</span>&nbsp;(' + coord.FormatLv03 + ')');
                    coordIndex++;
                }
                $(n[i]).html(replaceHtml);
            }
        } catch(err) {
            alert(err);
        }
    }
    return coords;
}

function RenderCoordinatesToPageHTML(settings) {
    var pointCount = settings.siteSetting.coordSettings.length;
    for (var i = 0; i < pointCount; i++) {
        var currentCoord = new Coordinate(settings.siteSetting.coordSettings[i].pointOrigin);
        var ext = "";
        var p1 = new LatLon(Number(currentCoord.Lat.Degree), Number(currentCoord.Lon.Degree));
        for (var ii = 0; ii < pointCount; ii++) {
            if (i != ii) {
                var currentProjCoord = new Coordinate(settings.siteSetting.coordSettings[ii].pointOrigin);
                var p2 = new LatLon(Number(currentProjCoord.Lat.Degree), Number(currentProjCoord.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);
                ext = ext + extPoints.format(ii, dist, Math.round(brng * 10) / 10);
            }
        }
        var box = html_coordBox.format(i, Coordinate.GetFormat(settings.siteSetting.coordinateFormatType,settings.siteSetting.coordSettings[i].coordinate), ext, settings.siteSetting.coordSettings[i].description);
        $(".cordBoxList").append(box);
    }
    for (var i = 0; i < pointCount; i++) {
        if (geoMapsSettings.siteSetting.coordSettings[i].isSiteFavorite) {
            $("#geoMapsCoordBox-" + i).find('.glyphicon-heart-empty').toggle();
            $("#geoMapsCoordBox-" + i).find('.glyphicon-heart').toggle();
        }
        if (geoMapsSettings.siteSetting.coordSettings[i].isExpandet) {
            $("#geoMapsCoordBox-" + i).find('.ext').toggle();
            $("#geoMapsCoordBox-" + i).find('.glyphicon-chevron-down').toggle();
            $("#geoMapsCoordBox-" + i).find('.glyphicon-chevron-up').toggle();
        }
        for(var index=0; index<geoMapsSettings.siteSetting.coordSettings[i].showLineTo.length; index++) {
            if(geoMapsSettings.siteSetting.coordSettings[i].showLineTo[index].isShown) {
                $('#geoMapsCoordBox-'+i+' .projectionPoint-'+index+' .glyphicon-eye-close').toggle();
                $('#geoMapsCoordBox-'+i+' .projectionPoint-'+index+' .glyphicon-eye-open').toggle();
            }
        }
    }
}
//TODO : prüfen, was coords ist!
function ChangeCoordinatesFormat(coords, formatType) {
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        $("#geoMapsCoordBox-"+i).find('.coordinate').html(Coordinate.GetFormat(formatType, coords[i]));
    }
}

function UpdateCoordinate(id, settings, descr, formatType) {
    var coords = settings.siteSetting.coordSettings;
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        var p1 = new LatLon(Number(coords[i].coordinate.Lat.Degree), Number(coords[i].coordinate.Lon.Degree));
        $("#geoMapsCoordBox-"+i).find('.coordinate').html(Coordinate.GetFormat(formatType, coords[i].coordinate));
        for (var ii = 0; ii < pointCount; ii++) {
            if(i!=ii) {
                var p2 = new LatLon(Number(coords[ii].coordinate.Lat.Degree), Number(coords[ii].coordinate.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);

                $("#geoMapsCoordBox-"+i).find('.projectionPoint-'+ii+' .dist').html(dist);
                $("#geoMapsCoordBox-"+i).find('.projectionPoint-'+ii+' .angle').html(Math.round(brng*10)/10);
            }
        }
    }
    $("#geoMapsCoordBox-"+id).find('.description').html(descr);
    $("#geoMapsCoordBox-"+id).find('div.edit').toggle();
}

function GetCoordId(element) {
    var idElement = $(element).closest('[id^=geoMapsCoordBox-]');
    var currentId = $(idElement).attr('id');
    var myRegexp = /.*?-(\d)+/i;
    var match = myRegexp.exec(currentId);
    return match[1];
}

function GetProjectionId(element) {
    var idElement = $(element).closest('[class^=projectionPoint-]');
    var currentId = $(idElement).attr('class');
    var myRegexp = /.*?-(\d)+/i;
    var match = myRegexp.exec(currentId);
    return match[1];
}

function SaveEditValues(element, formatType, geoMapsSettings) {
    var coord = new Coordinate($(element).closest('div.edit').find('input.coordValue').val());
    var descr = $(element).closest('div.edit').find('input.coordDesc').val();
    if (!coord.IsValid) {
        alert('FEHLER beim Parsen der Eingabe!');
        $('div.edit').find('input.coordValue').addClass("bgred");
        // $('div.edit').find('input.coordValue').val($(element).closest('.coordBox').find('.coordinate').html().trim());
        return;
    }
    else
    {
        $('div.edit').find('input.coordValue').removeClass("bgred");
    }
    var id = GetCoordId(element);
    geoMapsSettings.siteSetting.coordSettings[id].coordinate = coord;
    UpdateCoordinate(id, geoMapsSettings, descr, formatType);
    SettingCalculator.Set(geoMapsSettings, "description", descr, id);
    SettingCalculator.Set(geoMapsSettings, "pointOrigin", coord.OriginCoordinateString, id);
}

function SetCoordFormat(format) {
    switch (format) {
        case 'Ddd':
            return CoordinateFormat.Ddd;
        case 'Dmm':
            return CoordinateFormat.Dmm;
        case 'Dms':
            return CoordinateFormat.Dms;
        case 'LV03':
            return CoordinateFormat.LV03;
        case 'LV95':
            return CoordinateFormat.LV95;
        default:
            return 'undefined';
    }
}

if (!String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}