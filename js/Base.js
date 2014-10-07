function ParseCoordinates() {
    var pageParserRegExp = /(?!id="geoMapsCoord1"\s*)([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)['|′]*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)['|′]*/gmi;
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

function RenderCoordinatesToPageHTML(coordsList, settings) {
    var pointCount = coordsList.length;
    for (var i = 0; i < pointCount; i++) {
        var ext = "";
        var p1 = new LatLon(Number(coordsList[i].Lat.Degree), Number(coordsList[i].Lon.Degree));
        for (var ii = 0; ii < pointCount; ii++) {
            if (i != ii) {
                var p2 = new LatLon(Number(coordsList[ii].Lat.Degree), Number(coordsList[ii].Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);
                ext = ext + extPoints.format(ii, dist, Math.round(brng * 10) / 10);
            }
        }
        var box = html_coordBox.format(i, coordsList[i].GetFormat(settings.siteSetting.coordinateFormatType), ext, settings.siteSetting.coordSettings[i].description);
        $(".cordBoxList").append(box);
    }
}

function ChangeCoordinatesFormat(coords, formatType) {
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        $("#geoMapsCoordBox-"+i).find('.coordinate').html(coords[i].GetFormat(formatType));
    }
}

function UpdateCoordinate(id, coords, descr, formatType) {
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        var p1 = new LatLon(Number(coords[i].Lat.Degree), Number(coords[i].Lon.Degree));
        $("#geoMapsCoordBox-"+i).find('.coordinate').html(coords[i].GetFormat(formatType));
        for (var ii = 0; ii < pointCount; ii++) {
            if(i!=ii) {
                var p2 = new LatLon(Number(coords[ii].Lat.Degree), Number(coords[ii].Lon.Degree));
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

function SaveEditValues(element, coordList, formatType, geoMapsSettings) {
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
    coordList[id] = coord;
    UpdateCoordinate(id, coordList, descr, formatType);
    SettingCalculator.Set(geoMapsSettings, "description", descr, id);
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