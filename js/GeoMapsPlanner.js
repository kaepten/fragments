$("#sidebarcontrol").click(function () {
    $("#sidebar").toggle();
    if($( "#sidebar" ).is( ":hidden" ))
    {
        $("#sidebarcontrol").removeClass("sidebarcontrol").addClass("sidebarcontrolCollapsed");
        $(this).find(".glyphicon").removeClass("glyphicons-chevron-right").addClass("glyphicon-chevron-left");
    }
    else
    {
        $("#sidebarcontrol").removeClass("sidebarcontrolCollapsed").addClass("sidebarcontrol");
        $(this).find(".glyphicon").removeClass("glyphicon-chevron-left").addClass("glyphicons-chevron-right");
    }
});

Core.AppendLinkCursor($("#sidebarcontrol"));

//region HTML Fragmente für Koordinaten-Box

var html_coordBox = '<li id="geoMapsCoordBox-{0}"  class="coordBox">' +
    '    <div class="clearfix main">' +
    '        <div class="marker">' +
    '            <!--<img src="media/coordMarker.svg" alt="">-->{4}' +
    '        </div>' +
    '        <div class="content">' +
    '            <div class="description">' +
    '               {3}' +
    '            </div>' +
    '            <div class="left">' +
    '                <div>' +
    '                    <a class="cmd updown"><span class="glyphicon glyphicon-chevron-down" style="display:none"></span><span class="glyphicon glyphicon-chevron-up"></span></a>' +
    '                </div>' +
    '                <div class="coordinate" id="plannerCoordinate{4}">{1}</div>' +
    '            </div>' +
    '            <div>' +
    '                <a class="cmd goto"><span class="glyphicon glyphicon-map-marker"></span></a>' +
    '                <a class="cmd calc"><span class="glyphicon glyphicon-new-window"></span></a>' +
    '                <a class="cmd edit"><span class="glyphicon glyphicon-edit"></span></a>' +
    '                <a class="cmd del"><span class="glyphicon glyphicon-remove-circle"></span></a>' +
    //'                <div>' +
    // '                    <a class="cmd order"><span class="fa fa-navicon"></span></a>' +
    // '                </div>' +
    '                <div>' +
    '                    <a class="cmd fav"><span class="glyphicon glyphicon-heart-empty"></span><span style="display: none;" class="glyphicon glyphicon-heart red"></span></a>' +
    '                </div>' +
    '            </div>' +
    '        </div>' +
    '    </div>' +
    '    <div class="edit" style="display: none;">' +
    '       <table>' +
    '           <tr><td>Beschreibung : </td><td><input class="coordDesc" type="text" value=""> </td></tr>' +
    '           <tr><td>Koordinate : </td><td><input class="coordValue" type="text" value=""> </td></tr>' +
    '           <tr><td></td><td> <button type="button" class="btn btn-default btn-xs save">Speichern</button>  <button type="button" class="btn btn-default btn-xs cancel">Verwerfen</button></td></tr>' +
    '       </table>' +
    '    </div>' +
    '    <div class="calc" style="display: none;">' +
    '       <table>' +
    '           <tr><td>Distanz : </td><td><input class="coordDist" type="text" value=""> </td></tr>' +
    '           <tr><td>Richtung : </td><td><input class="coordAngle" type="text" value=""> </td></tr>' +
    '           <tr><td></td><td> <button type="button" class="btn btn-default btn-xs save">Erstellen</button>  <button type="button" class="btn btn-default btn-xs cancel">Verwerfen</button></td></tr>' +
    '       </table>' +
    '    </div>' +
    '    <div class="ext" style="display: none;">' +
    '        <table>{2}' +
    '        </table>' +
    '    </div>' +
    '</li>';

var extPoints = '<tr class="projectionPoint-{0}">' +
    '   <td><i class="fa fa-level-up fa-rotate-90 fa-lg"></i></td>' +
    '   <td class="pointId">{3}</td>' +
    '   <td><i class="fa fa-arrows-h"></i></td>' +
    '   <td><span  class="dist">{1}</span>m</td>' +
    '   <td><i class="fa fa-location-arrow"></i></td>' +
    '   <td><span class="angle">{2}</span>°</td>' +
    '   <td class="commands"><a class="cmd gotoProjection"><span class="glyphicon glyphicon-map-marker"></span></a> <a class="cmd showhide"><span class="glyphicon glyphicon-eye-close"></span><span style="display: none;" class="glyphicon glyphicon-eye-open green"></span></a></td>' +
    '</tr>';

var qualityMarker = '<i class="fa fa-adjust mid green" style="display: none;"></i><i class="fa fa-circle low orange" style="display: none;"></i><i class="fa fa-circle high green" style="display: none;"></i>&nbsp;{0}';

//endregion

var siteCoords;
var geoMapsSettings;
var coordFormat;

//region Funktionen zum Parsen der HTML Seite nach Koordinaten

/**
 * Fügt die Werte zweier Arrays mit Coordinaten-Objekte zusammen (Distinct)
 * @param {Array}sourceArray
 * @param {Array} targetArray
 * @returns {Array}
 */
function MergeCoordinateArray(sourceArray, targetArray) {

    var outerArray = new Array();
    var innerArray = new Array();

    if(sourceArray.length == 0) {
        return targetArray;
    } else if(targetArray.length == 0) {
        return sourceArray;
    }

    var mergedArray = new Array();
    mergedArray = mergedArray.concat(sourceArray);
    for (var i = 0; i < sourceArray.length; ++i) {
        for (var ii = 0; ii < targetArray.length; ++ii) {
            if(sourceArray[i].OriginCoordinateString == targetArray[ii].OriginCoordinateString) {
                continue;
            }
            else{
                mergedArray.push(targetArray[ii]);
            }
        }
    }
    return mergedArray;
}

/**
 * Parst die HTML Seite nach allen unterschiedlichen Koordinaten-Formate
 * @returns {Array} Koordinaten
 */
function ParseAllCoordinatesFormats() {
    var coords = new Array();
    // coords = MergeCoordinateArray(coords, ParseCoordinates(PageParse.DddRegExp));
    coords = MergeCoordinateArray(coords,ParseCoordinates(PageParse.DmmRegExp));
    // coords = MergeCoordinateArray(coords,ParseCoordinates(PageParse.DmsRegExp));
    // coords = MergeCoordinateArray(coords,ParseCoordinates(PageParse.LV03RegExp));
    // coords = MergeCoordinateArray(coords,ParseCoordinates(PageParse.LV95RegExp));
    return coords;
}

/**
 * Parst Koordinaten auf der aktuellen HTML Seite entsprechend dem Regulären Ausdruck
 * @param parserRegEx Regulärer Ausdruck, welcher verwendet wird
 * @return {Array} Koordinaten Objekte
 */
function ParseCoordinates(parserRegEx) {
    // var pageParserRegExp = /(?!id="geoMapsCoord1"\s*)([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d*)['|′]*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d*)['|′]*/gmi;
    var pageParserRegExp =  parserRegEx;
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
            if(idSpan[0].id.contains('geoMapsCoord') || idSpan[0].id.contains('plannerCoordinate')) { // plannerCoordinate die seite wurde bereits geparst und ids verteilt
                //var coord = new Coordinate(validCoordinates[0]);
                //coords.push(coord);
                //coordIndex++;
            }
            else {
                for (var ii = 0; ii < validCoordinates.length; ++ii) {
                    var coord = new Coordinate(validCoordinates[ii]);
                    if (!coord.IsValid) {
                        alert('Fehler beim parsen der Koordinate!');
                    }
                    coords.push(coord);
                    // replaceHtml = replaceHtml.replace(validCoordinates[ii], '<span id="geoMapsCoord' + coordIndex + '" style="color:white;">' + validCoordinates[ii] + '</span>&nbsp;(' + coord.FormatLv03 + ')');
                    replaceHtml = replaceHtml.replace(validCoordinates[ii], '<span id="geoMapsCoord' + coordIndex + '">' + validCoordinates[ii] + '</span>');
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

//endregion

/**
 * Rendert die Koordinaten-Boxen für jede Koordinate der Settings
 * @param settings
 */
function RenderCoordBoxToPageHTML(settings) {
    var coordsCount = settings.siteSetting.coordSettings.length;
    for (var currentCoordIndex = 0; currentCoordIndex < coordsCount; currentCoordIndex++) {
        var currentCoord = settings.siteSetting.coordSettings[currentCoordIndex];
        var ext = "";
        var p1 = new LatLon(Number(currentCoord.coordinate.Lat.Degree), Number(currentCoord.coordinate.Lon.Degree));
        for (var lineToCoordinateIndex = 0; lineToCoordinateIndex < coordsCount; lineToCoordinateIndex++) {
            if (currentCoord.id != settings.siteSetting.coordSettings[lineToCoordinateIndex].id) {
                var currentProjCoord = settings.siteSetting.coordSettings[lineToCoordinateIndex].coordinate;
                var p2 = new LatLon(Number(currentProjCoord.Lat.Degree), Number(currentProjCoord.Lon.Degree));
                var dist = Core.Trenner(Core.Round(p1.distanceTo(p2),2));          // in m
                var brng = p1.bearingTo(p2);
                ext = ext + extPoints.format(settings.siteSetting.coordSettings[lineToCoordinateIndex].id, dist, Math.round(brng * 10) / 10, settings.siteSetting.coordSettings[lineToCoordinateIndex].uiId);
            }
        }
        if(currentCoord.description == '') {
            currentCoord.description = 'Point:' + currentCoord.uiId;
        }
        var box = html_coordBox.format(currentCoord.id, Coordinate.GetFormat(settings.siteSetting.coordinateFormatType,currentCoord.coordinate), ext, qualityMarker.format(currentCoord.description), currentCoord.uiId);
        $(".cordBoxList").append(box);
        SetCoordinateQualityState(currentCoord, settings.siteSetting.coordinateFormatType);
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

/**
 * Setzt die Qualitäts-Stati
 * @param coordSetting
 * @param siteFormat
 * @returns {string}
 */
function SetCoordinateQualityState(coordSetting, siteFormat) {
    if(siteFormat == coordSetting.coordinate.OriginFormat) {
        SetCoordinateQualityStateUI('high',coordSetting.id);
        return;
    }

    switch (siteFormat) {
        case CoordinateFormat.Ddd:
        case CoordinateFormat.Dmm:
        case CoordinateFormat.Dms:
            if(coordSetting.coordinate.IsWGS84) {
                SetCoordinateQualityStateUI('mid',coordSetting.id);
            } else {
                SetCoordinateQualityStateUI('low',coordSetting.id);
            }
            return ;
        case CoordinateFormat.LV03:
        case CoordinateFormat.LV95:
            if(coordSetting.coordinate.IsWGS84) {
                SetCoordinateQualityStateUI('low',coordSetting.id);
            } else {
                SetCoordinateQualityStateUI('mid',coordSetting.id);
            }
            return;
        default:
            return 'undefined';
    }

    // <i class="fa fa-adjust"></i>&nbsp;<i class="fa fa-circle-o"></i>&nbsp;<i class="fa fa-circle"></i>&nbsp;<i class="fa fa-square"></i>
    return qualityMarker.format('');
}

/**
 * Setzt die Qualitäts-Stati im UI
 * @param state
 * @param coordinateId
 */
function SetCoordinateQualityStateUI(state, coordinateId) {
    switch(state) {
        case 'high':
            $('#geoMapsCoordBox-'+coordinateId+' .fa-adjust.mid').hide();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.low').hide();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.high').show();
            break;
        case 'mid':
            $('#geoMapsCoordBox-'+coordinateId+' .fa-adjust.mid').show();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.low').hide();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.high').hide();
            break;
        case 'low':
            $('#geoMapsCoordBox-'+coordinateId+' .fa-adjust.mid').hide();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.low').show();
            $('#geoMapsCoordBox-'+coordinateId+' .fa-circle.high').hide();
            break;
    }
}

/**
 * Wechselt die Darstellung der Coordinaten (CoordBox)
 * @param settings
 * @param formatType
 * @constructor
 */
function ChangeCoordinatesFormatUI(settings, formatType) {
    for (var i = 0; i < settings.siteSetting.coordSettings.length; i++) {
        $("#geoMapsCoordBox-"+settings.siteSetting.coordSettings[i].id).find('.coordinate').html(Coordinate.GetFormat(formatType, settings.siteSetting.coordSettings[i].coordinate));
        SetCoordinateQualityState(settings.siteSetting.coordSettings[i],formatType);
    }
}

/**
 * Aktualisiert die CoordBox(en)
 * @param id
 * @param settings
 * @param descr
 * @param formatType
 */
function UpdateCoordinateUI(id, settings, descr, formatType) {
    // update ui für Coordinate
    $("#geoMapsCoordBox-"+id).find('.description').html(qualityMarker.format(descr));
    $("#geoMapsCoordBox-"+id).find('div.edit').toggle();
    // update sämtliche line-To Einträge
    var coords = settings.siteSetting.coordSettings;
    var pointCount = coords.length;
    var lastCoord;
    for (var i = 0; i < pointCount; i++) {
        var p1 = new LatLon(Number(coords[i].coordinate.Lat.Degree), Number(coords[i].coordinate.Lon.Degree));
        $("#geoMapsCoordBox-"+coords[i].id).find('.coordinate').html(Coordinate.GetFormat(formatType, coords[i].coordinate));
        SetCoordinateQualityState(coords[i], settings.siteSetting.coordinateFormatType);
        for (var ii = 0; ii < pointCount; ii++) {
            if(i!=ii) {
                var p2 = new LatLon(Number(coords[ii].coordinate.Lat.Degree), Number(coords[ii].coordinate.Lon.Degree));
                var dist = p1.distanceTo(p2);          // in km
                var brng = p1.bearingTo(p2);

                $("#geoMapsCoordBox-"+coords[ii].id).find('.projectionPoint-'+coords[ii].id+' .dist').html(dist);
                $("#geoMapsCoordBox-"+coords[ii].id).find('.projectionPoint-'+coords[ii].id+' .angle').html(Math.round(brng*10)/10);

                lastCoord = coords[ii];
            }
        }
    }
    map.UpdateWayPoint(id);
}

/**
 * Ermittelt die ID der Koordinate anhand des UI Element
 * @param elementUi
 * @returns {*}
 * @constructor
 */
function GetCoordId(elementUi) {
    var idElement = $(elementUi).closest('[id^=geoMapsCoordBox-]');
    var currentId = $(idElement).attr('id');
    var myRegexp = /.*?-([A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12})/i;
    var match = myRegexp.exec(currentId);
    if(match == null) {
        myRegexp = /.*?-(\d+)/i;
        match = myRegexp.exec(currentId);
    }
    return match[1];
}

/**
 * Ermittelt die Id der Projektions Koordinate
 * @param elementUi
 * @returns {*}
 */
function GetProjectionId(elementUi) {
    var idElement = $(elementUi).closest('[class^=projectionPoint-]');
    var currentId = $(idElement).attr('class');
    var myRegexp = /.*?-([A-Za-z0-9]{8}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12})/i;
    var match = myRegexp.exec(currentId);
    if(match == null) {
        myRegexp = /.*?-(\d+)/i;
        match = myRegexp.exec(currentId);
    }
    return match[1];
}

/**
 * Speichern der Koordinaten Eigenschaften der CoordBox
 * @param elementUi
 * @param formatType
 * @param settings
 */
function SaveEditValues(elementUi, formatType, settings) {
    var coord = new Coordinate($(elementUi).closest('div.edit').find('input.coordValue').val());
    var descr = $(elementUi).closest('div.edit').find('input.coordDesc').val();
    if (!coord.IsValid) {
        alert('FEHLER beim Parsen der Eingabe!');
        $('div.edit').find('input.coordValue').addClass("bgred");
        return;
    } else {
        $('div.edit').find('input.coordValue').removeClass("bgred");
    }
    var tmpID = GetCoordId(elementUi);
    if(descr=='') {
        var coordSet = SettingSite.GetSettingCoordObject(geoMapsSettings, tmpID);
        descr = 'Koordinate : ' + coordSet.uiId;
    }

    SettingCoord.Set(settings, tmpID, coord, descr);
    UpdateCoordinateUI(GetCoordId(elementUi), settings, descr, formatType);
}

/**
 * Projektions Koordinate erstellen
 * @param elementUi
 * @param coordFormat
 * @param geoMapsSettings
 */
function CreateProjection(elementUi, coordFormat, geoMapsSettings) {
    "use strict";
    var dist = $(elementUi).closest('div.calc').find('input.coordDist').val();
    var angle = $(elementUi).closest('div.calc').find('input.coordAngle').val();

    var id = GetCoordId(elementUi);
    var coordObj = SettingSite.GetSettingCoordObject(geoMapsSettings, id);

    var p1 = new LatLon(Number(coordObj.coordinate.Lat.Degree), Number(coordObj.coordinate.Lon.Degree));
    var p2 = p1.destinationPoint(dist, angle);

    var newCoord = new Coordinate(p2.lat + " " + p2.lon);
    if (newCoord.IsValid) {
        CreateAndAddNewCoordinate(newCoord, geoMapsSettings);
        $("[id^=geoMapsCoordBox-]").remove();
        RenderCoordBoxToPageHTML(geoMapsSettings);
        AppendCoordBoxHandler();
    }

}

/**
 * Konvertiert string Formatangaben zum typsicheren Objekt Formatangabe
 * @param {string} format
 * @returns {CoordinateFormat}
 */
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

/**
 * Fügt den CoordBox die Handler an
 */
function AppendCoordBoxHandler() {

    $("[id^=geoMapsCoordBox-] .updown").click(function () {
        var id = GetCoordId(this);
        var el = $(this).closest('[id^=geoMapsCoordBox-]').find('.ext');
        if (SettingSite.GetSettingCoordObject(geoMapsSettings, id).isExpandet) {
            el.hide(200);
        } else {
            el.show(200);
        }
        $(this).find('.glyphicon-chevron-down').toggle();
        $(this).find('.glyphicon-chevron-up').toggle();
        SettingCoord.SetExpandet(geoMapsSettings, id, !SettingSite.GetSettingCoordObject(geoMapsSettings, id).isExpandet);
    });

    $("[id^=geoMapsCoordBox-] .fav").click(function () {
        var id = GetCoordId(this);
        $(this).find('.glyphicon-heart-empty').toggle();
        $(this).find('.glyphicon-heart').toggle();
        SettingCoord.SetFavorite(geoMapsSettings, id, !SettingSite.GetSettingCoordObject(geoMapsSettings, id).isSiteFavorite);
    });

    $("[id^=geoMapsCoordBox-] .showhide").click(function () {
        $(this).find('.glyphicon-eye-close').toggle();
        $(this).find('.glyphicon-eye-open').toggle();
        var coordId = GetCoordId(this);
        var projectionId = GetProjectionId(this); // gegenseite auch ein/ausblenden
        $('#geoMapsCoordBox-' + projectionId + ' .projectionPoint-' + coordId + ' .glyphicon-eye-close').toggle();
        $('#geoMapsCoordBox-' + projectionId + ' .projectionPoint-' + coordId + ' .glyphicon-eye-open').toggle();
        var isShown = SettingSite.SetProjectionShowLineTo(geoMapsSettings, coordId, projectionId);

        var cord1 = SettingSite.GetSettingCoordObject(geoMapsSettings, coordId);
        var cord2 = SettingSite.GetSettingCoordObject(geoMapsSettings, projectionId);
        map.ShowHideLine(isShown, cord1, cord2);
    });

    $("a.gotoProjection").click(function () {
        var projectionId = GetProjectionId(this); // gegenseite auch ein/ausblenden
        var coordObj = SettingSite.GetSettingCoordObject(geoMapsSettings, projectionId);
        map.ZoomToPoint(coordObj);
    });

    $("a.goto").click(function () {
        var id = GetCoordId(this); // gegenseite auch ein/ausblenden
        var coordObj = SettingSite.GetSettingCoordObject(geoMapsSettings, id);
        map.ZoomToPoint(coordObj);
    });

    $("a.calc").click(function () {
        var id = GetCoordId(this);
        var coordObj = SettingSite.GetSettingCoordObject(geoMapsSettings, id);
        // $(this).closest('.coordBox').find('input.coordDist').val(coordObj.coordinate.OriginCoordinateString);
        // $(this).closest('.coordBox').find('input.coordAngle').val(coordObj.description);
        var el = $(this).closest('.coordBox').find('div.calc');
        if (el.is(":visible")) {
            el.hide(200);
        } else {
            el.show(200);
        }
    });

    $("div.calc .cancel").click(function () {
        $('div.calc').find('input.coordValue').removeClass("bgred");
        $(this).closest('.coordBox').find('div.calc').toggle();
    });

    $("div.calc .save").click(function () {
        CreateProjection(this, coordFormat, geoMapsSettings);
    });

    $('div.calc').find('input.coordDesc').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            SaveEditValues(this, coordFormat, geoMapsSettings);
        }
    });

    $('div.calc').find('input.coordValue').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            SaveEditValues(this, coordFormat, geoMapsSettings);
        }
    });

    $("a.edit").click(function () {
        var id = GetCoordId(this);
        var coordObj = SettingSite.GetSettingCoordObject(geoMapsSettings, id);
        $(this).closest('.coordBox').find('input.coordValue').val(coordObj.coordinate.OriginCoordinateString);
        $(this).closest('.coordBox').find('input.coordDesc').val(coordObj.description);
        var el = $(this).closest('.coordBox').find('div.edit');
        if (el.is(":visible")) {
            el.hide(200);
        } else {
            el.show(200);
        }
    });

    $("div.edit .cancel").click(function () {
        $('div.edit').find('input.coordValue').removeClass("bgred");
        $(this).closest('.coordBox').find('div.edit').toggle();
    });

    $("div.edit .save").click(function () {
        SaveEditValues(this, coordFormat, geoMapsSettings);
    });

    $('div.edit').find('input.coordDesc').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            SaveEditValues(this, coordFormat, geoMapsSettings);
        }
    });

    $('div.edit').find('input.coordValue').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            SaveEditValues(this, coordFormat, geoMapsSettings);
        }
    });

    $("a.del").click(function () {
        var id = GetCoordId(this);
        DeleteCoordinate(id);
    });
}

/**
 * Fügt alle Handler für die Seite
 */
function AppendDocumentHandler() {

    $("input[name=CoordFormat]").change(function () {
        coordFormat = GetCoordinateFormatObject($("input[name=CoordFormat]:checked").val());
        ChangeCoordinatesFormatUI(geoMapsSettings, coordFormat);
        SettingSite.SetCoordFormat(geoMapsSettings, coordFormat);
    });

    $("a.allShowHide").click(function () {
        for(var idx=0; idx<geoMapsSettings.siteSetting.coordSettings.length; idx++) {
            for(var idxx=0; idxx<geoMapsSettings.siteSetting.coordSettings[idx].showLineTo.length; idxx++) {
                if(geoMapsSettings.siteSetting.coordSettings[idx].showLineTo[idxx].isShown) {
                    map.RemoveLine(geoMapsSettings.siteSetting.coordSettings[idx].id, geoMapsSettings.siteSetting.coordSettings[idx].showLineTo[idxx].coordId);
                }
            }
        }
        var showElements = $(".coordBox .ext .showhide");
        for (var i = 0; i < showElements.length; i++) {
            var elO = showElements.eq(i).find(".glyphicon-eye-open");
            var elC = showElements.eq(i).find(".glyphicon-eye-close");
            if (elO.css("display") != "none") {
                elO.toggle();
                elC.toggle();
            }
        }
        SettingSite.HideAllShowLineTo(geoMapsSettings);
    });

    $("a.delSettings").click(function () {
        DeleteGeoMapsSettings();
    });

    $("a.allDelete").click(function () {
        if (Core.Confirm('Sollen alle Koordinaten aus dem Calculator entfernt werden?\r\nDie Seite muss neu geladen werden um die vorhanenen Koordinaten wieder zu erkennen.')) {
            var ids = [];
            for (var coordIndex = 0; coordIndex < geoMapsSettings.siteSetting.coordSettings.length; coordIndex++) {
                if (!geoMapsSettings.siteSetting.coordSettings[coordIndex].isSiteFavorite) {
                    ids.push(geoMapsSettings.siteSetting.coordSettings[coordIndex].id);
                }
            }
            for (var idIndex = 0; idIndex < ids.length; idIndex++) {
                map.DeleteSingleWayPointById(ids[idIndex]);
                SettingSite.DeleteCoord(geoMapsSettings, ids[idIndex]);
                $("[id^=geoMapsCoordBox-" + ids[idIndex] + "]").remove();
            }
        } else {
            // Do nothing!
        }

    });

    $("a.allUpDown").click(function () {
        var downElements = $(".coordBox .ext");
        for (var i = 0; i < downElements.length; i++) {
            var element = downElements.eq(i);
            if (element.css("display") != "none") {
                element.css("display", "none");
            }
            var id = GetCoordId(element);
            SettingCoord.SetExpandet(geoMapsSettings, id, false);
        }
        var downIcon = $(".coordBox .updown");
        for (var i = 0; i < downIcon.length; i++) {
            var element = downIcon.eq(i);
            if ($(element).find('.glyphicon-chevron-down').css("display") == "inline-block") {
                $(element).find('.glyphicon-chevron-up').toggle();
                $(element).find('.glyphicon-chevron-down').toggle();
            }
        }
    });

    $("a.newCoord").click(function () {
        errorFlag = true;
        AddNewCoordBox();
    });

    $("#newCoordinate").keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            errorFlag = true;
            AddNewCoordBox();
        } else {
            errorFlag = false;
        }
    });

    errorFlag = true;
}

function DeleteCoordinate(id) {
    "use strict";
    SettingSite.DeleteCoord(geoMapsSettings, id);
    $("[id^=geoMapsCoordBox-" + id + "]").remove();
    $("[class^=projectionPoint-" + id + "]").remove();
    map.DeleteSingleWayPointById(id);
}

function SetMainCoord(position) {
    "use strict";
    $("#newCoordinate").val(position);
}

function AddNewCoordBox() {
    var newCoord = new Coordinate($("#newCoordinate").val());
    if (newCoord.IsValid || $("#newCoordinate").val().trim().length == 0) {
        $("#newCoordinate").removeClass("bgred");
        if ($("#newCoordinate").val().trim().length == 0) return;

        CreateAndAddNewCoordinate(newCoord, geoMapsSettings);

        $("[id^=geoMapsCoordBox-]").remove();
        RenderCoordBoxToPageHTML(geoMapsSettings);
        AppendCoordBoxHandler();
        $("#newCoordinate").val('');
    } else {
        $("#newCoordinate").addClass("bgred");
        setTimeout(function () {
            console.log("error : " + errorFlag);
            if (errorFlag) {
                $("#newCoordinate").val('');
            }
            $("#newCoordinate").removeClass("bgred");
        }, 2000);
        return;
    }
}

/**
 * Erzeugt eine neue Koordinate und fügt sie den Settings hinzu
 * @param newCoord
 * @param geoMapsSettings
 */
function CreateAndAddNewCoordinate(newCoord, geoMapsSettings) {
    "use strict";
    var newGUID = getGUID();
    var uiId = GetUiId();
    var siteCoord = new SettingCoord(newCoord.OriginCoordinateString, newGUID, uiId);

    AddNewCoordinateObject([siteCoord], geoMapsSettings);
    map.AddSingleWayPoint(siteCoord);
}

/**
 * Initialisiert das UI
 */
function InitUI() {
    $("[id^=geoMapsCoordBox-]").remove();
    siteCoords = ParseAllCoordinatesFormats();
    geoMapsSettings = LoadGeoMapsSiteSettings(document.URL, siteCoords);
    coordFormat = geoMapsSettings.siteSetting.coordinateFormatType;
    $("input[name=CoordFormat][value=" + coordFormat + "]").prop('checked', true);
    RenderCoordBoxToPageHTML(geoMapsSettings);
    AppendCoordBoxHandler();
}

var map;

$(document).ready(function () {
    InitUI();
    AppendDocumentHandler();
    map = new Map_OL3();


        var layers ={};
        displayLayer = function(layerBodId, visible) {
            layers[layerBodId].setVisible(visible);
        };

        var tpl =
            '<div class="checkbox">' +
            '<label>{label}' +
            '<input type="checkbox" onclick="displayLayer(\'{layerBodId}\', this.checked)"/>' +
            '</label>' +
        '</div>';

        var nano = function(template, data) {
            return template.replace(/\{([\w\.]*)\}/g,
                function (str, key) {
                    var keys = key.split("."), value = data[keys.shift()];
                    $.each(keys, function () {
                        value = value[this];
                    });
                    return (value === null || value === undefined) ? "" : value;
                }
            );
        };

    Core.AppendLinkCursor($('.checkbox-tree'));
    $('.checkbox-inhalt').hide();

    $('.checkbox-tree').bind('click', function(evt) {
            var display = $('.checkbox-inhalt').css('display');
            if (display === 'block') {
                $('.checkbox-inhalt').hide();
            } else {
                $('.checkbox-inhalt').show();
            }
            $(this).find('.glyphicon-chevron-down').toggle();
            $(this).find('.glyphicon-chevron-up').toggle();
        });

        var catalogConfig = [
            {layerBodId: 'ch.bafu.bundesinventare-amphibien', label: 'Amphibien Ortsfeste Objekte'},
            {layerBodId: 'ch.bafu.bundesinventare-amphibien_wanderobjekte', label: 'Amphibien Wanderobjekte'},
            {layerBodId: 'ch.bafu.bundesinventare-auen', label: 'Auengebiete'},
            {layerBodId: 'ch.bafu.bundesinventare-bln', label: 'BLN'},
            {layerBodId: 'ch.bafu.bundesinventare-flachmoore', label: 'Flachmoore'},
            {layerBodId: 'ch.bafu.bundesinventare-hochmoore', label: 'Hochmoore'}
        ];

        for (var i=0; i < catalogConfig.length; i++) {
            var item = catalogConfig[i];
            $('.checkbox-inhalt').append(nano(tpl, item));
            layers[item.layerBodId] = ga.layer.create(item.layerBodId);
            layers[item.layerBodId].setVisible(false);
            map.AddLayer(layers[item.layerBodId]);
        }


    map.DrawWayPoints(geoMapsSettings);
});

/**
 * jQuery Sortable UI Elemente
 */
$(function () {
    // $(".cordBoxList").sortable({         stop: function (event, ui) {        },        start: function (event, ui) {        }    });

    $(".cordBoxList").on("sortstop", function (event, ui) {
        // console.log('stop: '+ui.item.index());
    });

    $(".cordBoxList").on("sortstart", function (event, ui) {
        // console.log('start: '+ui.item.index());
    });
});


