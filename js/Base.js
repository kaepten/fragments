function ParseCoordinates() {
    var pageParserRegExp = /(id="geoMapsCoord\d*">)?\s*([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*\s*/gmi;
    $.fn.egrep = function(pat) {
        var out = [];
        var lastParent;
        var textNodes = function(n) {
            if (n.nodeType == 3) {
                var t = typeof pat == 'string' ? n.nodeValue.indexOf(pat) != -1 : pat.test(n.nodeValue);
                if (t) {
                    if (lastParent == undefined || lastParent != n.parentNode) {
                        lastParent = n.parentNode;
                        out.push(n.parentNode);
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
            var replaceHtml = $(n[i]).html().trim().replace(/(\r\n|\n|\r)/gm,"");

            for (var ii = 0; ii < validCoordinates.length; ++ii) {

                var coord = new Coordinate(replaceHtml);
                if (!coord.IsValid) {
                    alert('Fehler beim parsen der Koordinate!');
                }
                coords.push(coord);
                replaceHtml = '<span id="geoMapsCoord'+coordIndex+'" style="color:white;">'+replaceHtml+'&nbsp;('+ coord.Lv03.Format +')</span>';
                coordIndex++;
            }
            $(n[i]).html(replaceHtml);
        } catch(err) {
            alert(err);
        }
    }
    return coords;
}

function RenderCoordinatesToPageHTML(coordsList, coordFormat) {
    var pointCount = coordsList.length;
    for (var i = 0; i < pointCount; i++) {
        var ext = "";
        var p1 = new LatLon(Number(coordsList[i].Dec.Lat.Degree), Number(coordsList[i].Dec.Lon.Degree));
        for (var ii = 0; ii < pointCount; ii++) {
            if (i != ii) {
                var p2 = new LatLon(Number(coordsList[ii].Dec.Lat.Degree), Number(coordsList[ii].Dec.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);
                ext = ext + extPoints.format(ii, dist, Math.round(brng * 10) / 10);
            }
        }
        var box = html_coordBox.format(i, coordsList[i].Format(coordFormat), ext);
        $(".cordBoxList").append(box);
    }
}

function UpdateCoordinate(id, coords, descr) {
    var pointCount = coords.length;
    for (var i = 0; i < pointCount; i++) {
        var p1 = new LatLon(Number(coords[i].Dec.Lat.Degree), Number(coords[i].Dec.Lon.Degree));
        $("#geoMapsCoordBox-"+i).find('.coordinate').html(coords[i].Format(CoordinateFormat.Deg));
        for (var ii = 0; ii < pointCount; ii++) {
            if(i!=ii) {
                var p2 = new LatLon(Number(coords[ii].Dec.Lat.Degree), Number(coords[ii].Dec.Lon.Degree));
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

function SaveEditValues(element, coordList) {
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
    UpdateCoordinate(id, coordList, descr);
}


function SetCoordFormat(format)
{
    switch (format) {
        case 'Dec':
            return CoordinateFormat.Dec;
        case 'Deg':
            return CoordinateFormat.Deg;
        case 'Dms':
            return CoordinateFormat.Dms;
        case 'Lv03':
            return CoordinateFormat.LV03;
        case 'Lv95':
            return CoordinateFormat.LV95;
        default:
            return 'undefined';
    }
}