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
    console.log("Render");
    var coordsCount = settings.siteSetting.coordSettings.length;
    for (var currentCoordIndex = 0; currentCoordIndex < coordsCount; currentCoordIndex++) {
        var currentCoord = settings.siteSetting.coordSettings[currentCoordIndex];
        var ext = "";
        var p1 = new LatLon(Number(currentCoord.coordinate.Lat.Degree), Number(currentCoord.coordinate.Lon.Degree));
        for (var lineToCoordinateIndex = 0; lineToCoordinateIndex < coordsCount; lineToCoordinateIndex++) {
            if (currentCoord.id != settings.siteSetting.coordSettings[lineToCoordinateIndex].id) {
                var currentProjCoord = settings.siteSetting.coordSettings[lineToCoordinateIndex].coordinate;
                var p2 = new LatLon(Number(currentProjCoord.Lat.Degree), Number(currentProjCoord.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);
                ext = ext + extPoints.format(settings.siteSetting.coordSettings[lineToCoordinateIndex].id, dist, Math.round(brng * 10) / 10, settings.siteSetting.coordSettings[lineToCoordinateIndex].uiId);
            }
        }
        var shortDesc = 'Koordinate : ' + currentCoord.uiId; // TODO in Methode auslagern
        if(currentCoord.description != '') {
            shortDesc = currentCoord.description;
        }
        var box = html_coordBox.format(currentCoord.id, Coordinate.GetFormat(settings.siteSetting.coordinateFormatType,currentCoord.coordinate), ext, shortDesc, currentCoord.uiId);
        $(".cordBoxList").append(box);
    }
    for (var i = 0; i < coordsCount; i++) {
        if (geoMapsSettings.siteSetting.coordSettings[i].isSiteFavorite) {
            $("#geoMapsCoordBox-" + geoMapsSettings.siteSetting.coordSettings[i].id).find('.glyphicon-heart-empty').toggle();
            $("#geoMapsCoordBox-" + geoMapsSettings.siteSetting.coordSettings[i].id).find('.glyphicon-heart').toggle();
        }
        if (geoMapsSettings.siteSetting.coordSettings[i].isExpandet) {
            $("#geoMapsCoordBox-" + geoMapsSettings.siteSetting.coordSettings[i].id).find('.ext').toggle();
            $("#geoMapsCoordBox-" + geoMapsSettings.siteSetting.coordSettings[i].id).find('.glyphicon-chevron-down').toggle();
            $("#geoMapsCoordBox-" + geoMapsSettings.siteSetting.coordSettings[i].id).find('.glyphicon-chevron-up').toggle();
        }
        for(var index=0; index<geoMapsSettings.siteSetting.coordSettings[i].showLineTo.length; index++) {
            if(geoMapsSettings.siteSetting.coordSettings[i].showLineTo[index].isShown) {
                $('#geoMapsCoordBox-'+geoMapsSettings.siteSetting.coordSettings[i].id+' .projectionPoint-'+geoMapsSettings.siteSetting.coordSettings[i].showLineTo[index].coordId+' .glyphicon-eye-close').toggle();
                $('#geoMapsCoordBox-'+geoMapsSettings.siteSetting.coordSettings[i].id+' .projectionPoint-'+geoMapsSettings.siteSetting.coordSettings[i].showLineTo[index].coordId+' .glyphicon-eye-open').toggle();
            }
        }
    }
}

function ChangeCoordinatesFormat(settings, formatType) {
    for (var i = 0; i < settings.siteSetting.coordSettings.length; i++) {
        $("#geoMapsCoordBox-"+settings.siteSetting.coordSettings[i].id).find('.coordinate').html(Coordinate.GetFormat(formatType, settings.siteSetting.coordSettings[i].coordinate));
    }
}

function UpdateCoordinate(id, settings, descr, formatType) {
    // update ui für Coordinate
    $("#geoMapsCoordBox-"+id).find('.description').html(descr);
    $("#geoMapsCoordBox-"+id).find('div.edit').toggle();
    // update sämtliche line-To Einträge
    var coords = settings.siteSetting.coordSettings;
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        var p1 = new LatLon(Number(coords[i].coordinate.Lat.Degree), Number(coords[i].coordinate.Lon.Degree));
        $("#geoMapsCoordBox-"+coords[i].id).find('.coordinate').html(Coordinate.GetFormat(formatType, coords[i].coordinate));
        for (var ii = 0; ii < pointCount; ii++) {
            if(i!=ii) {
                var p2 = new LatLon(Number(coords[ii].coordinate.Lat.Degree), Number(coords[ii].coordinate.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);

                $("#geoMapsCoordBox-"+coords[ii].id).find('.projectionPoint-'+coords[ii].id+' .dist').html(dist);
                $("#geoMapsCoordBox-"+coords[ii].id).find('.projectionPoint-'+coords[ii].id+' .angle').html(Math.round(brng*10)/10);
            }
        }
    }
}

function GetCoordId(element) {
    var idElement = $(element).closest('[id^=geoMapsCoordBox-]');
    var currentId = $(idElement).attr('id');
    var myRegexp = /.*?-([A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12})/i;
    var match = myRegexp.exec(currentId);
    if(match == null) {
        myRegexp = /.*?-(\d+)/i;
        match = myRegexp.exec(currentId);
    }
    return match[1];
}

function GetProjectionId(element) {
    var idElement = $(element).closest('[class^=projectionPoint-]');
    var currentId = $(idElement).attr('class');
    var myRegexp = /.*?-([A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12})/i;
    var match = myRegexp.exec(currentId);
    if(match == null) {
        myRegexp = /.*?-(\d+)/i;
        match = myRegexp.exec(currentId);
    }
    return match[1];
}

function SaveEditValues(element, formatType, settings) {
    var coord = new Coordinate($(element).closest('div.edit').find('input.coordValue').val());
    var descr = $(element).closest('div.edit').find('input.coordDesc').val();
    if (!coord.IsValid) {
        alert('FEHLER beim Parsen der Eingabe!');
        $('div.edit').find('input.coordValue').addClass("bgred");
        return;
    } else {
        $('div.edit').find('input.coordValue').removeClass("bgred");
    }
    var tmpID = GetCoordId(element);
    if(descr=='') {
        var coordSet = SettingSite.GetSettingCoord(geoMapsSettings, tmpID);
        descr = 'Koordinate : ' + coordSet.uiId; // TODO in Methode auslagern
    }

    SettingSite.SetSettingCoord(settings, tmpID, coord, descr);
    UpdateCoordinate(GetCoordId(element), settings, descr, formatType);
}

function GetCoordinateFormatObject(format) {
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

function Confirm(questionString) {
    "use strict";
    return confirm(questionString);
}