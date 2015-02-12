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
    '                <div class="coordinate">' +
    '                    {1}' +
    '                </div>' +
    '            </div>' +
    '            <div>' +
    '                <a class="cmd goto"><span class="glyphicon glyphicon-map-marker"></span></a>' +
    '                <a class="cmd calc"><span class="glyphicon glyphicon-new-window"></span></a>' +
    '                <a class="cmd edit"><span class="glyphicon glyphicon-edit"></span></a>' +
    '                <a class="cmd del"><span class="glyphicon glyphicon-remove-circle"></span></a>' +
    '                <div>' +
    '                    <a class="cmd order"><span class="fa fa-navicon"></span></a>' +
    '                </div>' +
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
    '    <div class="ext" style="display: none;">' +
    '        <table>{2}' +
    '        </table>' +
    '    </div>' +
    '</li>';

var extPoints = '<tr class="projectionPoint-{0}">' +
    '   <td><i class="fa fa-level-up fa-rotate-90 fa-lg"></i></td>' +
    '   <td class="pointId">{3}</td>' +
    '   <td><i class="fa fa-arrows-h"></i></td>' +
    '   <td><span  class="dist">{1}</span>km</td>' +
    '   <td><i class="fa fa-location-arrow"></i></td>' +
    '   <td><span class="angle">{2}</span>°</td>' +
    '   <td class="commands"><a class="cmd goto"><span class="glyphicon glyphicon-map-marker"></span></a> <a class="cmd showhide"><span class="glyphicon glyphicon-eye-close"></span><span style="display: none;" class="glyphicon glyphicon-eye-open green"></span></a></td>' +
    '</tr>';

var qualityMarker = '<i class="fa fa-adjust mid green" style="display: none;"></i><i class="fa fa-circle low orange" style="display: none;"></i><i class="fa fa-circle high green" style="display: none;"></i>&nbsp;{0}';

var siteCoords;
var geoMapsSettings;
var coordFormat;

$(document).ready(function () {
    InitUI();
    AppendDocumentHandler();
    // DrawWayPoints();
});

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
        SettingSite.SetProjectionShowLineTo(geoMapsSettings, coordId, projectionId);
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

    $("a.del").click(function () {
        var id = GetCoordId(this);
        SettingSite.DeleteCoord(geoMapsSettings, id);
        $("[id^=geoMapsCoordBox-" + id + "]").remove();
        DeleteSingleWayPoint(id);
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
}

function AppendDocumentHandler() {

    $("input[name=CoordFormat]").change(function () {
        coordFormat = GetCoordinateFormatObject($("input[name=CoordFormat]:checked").val());
        ChangeCoordinatesFormat(geoMapsSettings, coordFormat);
        SettingSite.SetCoordFormat(geoMapsSettings, coordFormat);
    });

    $("a.allShowHide").click(function () {
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
        if (Confirm('Sollen alle Koordinaten aus dem Calculator entfernt werden?\r\nDie Seite muss neu geladen werden um die vorhanenen Koordinaten wieder zu erkennen.')) {
            var ids = [];
            for (var coordIndex = 0; coordIndex < geoMapsSettings.siteSetting.coordSettings.length; coordIndex++) {
                if (!geoMapsSettings.siteSetting.coordSettings[coordIndex].isSiteFavorite) {
                    ids.push(geoMapsSettings.siteSetting.coordSettings[coordIndex].id);
                }
            }
            for (var idIndex = 0; idIndex < ids.length; idIndex++) {
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
        addNew();
    });

    $("#newCoordinate").keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
            errorFlag = true;
            addNew();
        } else {
            errorFlag = false;
        }
    });

    errorFlag = true;
    function addNew() {
        var newCoord = new Coordinate($("#newCoordinate").val());
        if (newCoord.IsValid || $("#newCoordinate").val().trim().length == 0) {
            $("#newCoordinate").removeClass("bgred");
            if ($("#newCoordinate").val().trim().length == 0) return;
            var newGUID = getGUID();
            var uiId = GetUiId();
            var siteCoord = new SettingCoord(newCoord.OriginCoordinateString, newGUID, uiId);

            AddNewCoordinateObject([siteCoord], geoMapsSettings);
            DrawSingleWayPoint(siteCoord);

            $("[id^=geoMapsCoordBox-]").remove();
            RenderCoordinatesToPageHTML(geoMapsSettings);
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
}

$(function () {
    // $(".cordBoxList").sortable({         stop: function (event, ui) {        },        start: function (event, ui) {        }    });

    $(".cordBoxList").on("sortstop", function (event, ui) {
        // console.log('stop: '+ui.item.index());
    });

    $(".cordBoxList").on("sortstart", function (event, ui) {
        // console.log('start: '+ui.item.index());
    });
});

