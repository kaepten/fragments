// ==UserScript==
// @name        GoogleMaps Div
// @namespace   c-dev
// @description GoogleMaps Div
// @include     *.geocaching.com/*
// @include     *.c-dev.ch/*
// @version     1
// @grant       none
// @require     https://gist.githubusercontent.com/arantius/3123124/raw/grant-none-shim.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @require		http://cloud.github.com/downloads/enriquez/ezpz-tooltip/jquery.ezpz_tooltip.js
// ==/UserScript==

// if (window.top != window.self) { return; } // don't run on frames or iframes

GM_addStyle('#example-content-1 {    display: none; position: absolute; padding: 10px; border: 1px solid black;    background-color: white;}');

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

$ = jQuery.noConflict(true);

$(document).ready(
    function() {
        InsertCoordsPopups();

        return;
        $("body").prepend('<span class="tooltip-target" id="example-target-1">First Target</span><div class="tooltip-content" id="example-content-1" style="background: red">Content for first</div>');
        $(".tooltip-target").ezpz_tooltip({
            stayOnContent: true,
            offset:-10
        }); // configuration of pop-up
    });


function InsertCoordsPopups() {
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
    var pageParserRegExp = /(id="geoMapsCoord\d*">)?\s*([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*\s*/gmi;
    var n = $('body').egrep(pageParserRegExp);
    var popIndex = 0;
    for (var i = 0; i < n.length; ++i) {
        try {
            var coordText = ($(n[i]).html());
            var validCoordinates = coordText.match(pageParserRegExp);
            var replaceHtml = $(n[i]).html();
            for (var ii = 0; ii < validCoordinates.length; ++ii) {
                // WrapCoodinate(replaceHtml, validCoordinates[ii], popIndex);
                // InsertPopUp(popIndex, validCoordinates[ii]);
                console.log(replaceHtml + " " + validCoordinates[ii]);
                popIndex++;
            }
            $(n[i]).html(replaceHtml);
        } catch(err) {
            console.log('## ERROR ## ' + coordText);
            console.log(err);
        }
    }
}

var counter = GM_getValue('counter', 0);
console.log('This script has been run ' + counter + ' times.');
GM_setValue('counter', ++counter);

// var newCSS = GM_getResourceText("customCSS");
// GM_addStyle(newCSS);
// GM_addStyle("#map-canvas { width: 350px; height: 350px; padding: 0.5em; background-color: black}");



var sidepopCss = "right: -400px; position: absolute; z-index: 90000;  width: 450px; height:100%; top:1px; bottom: 0px; background-color: yellow; border: black solid";
var sidepop = "<div id='sidepop' style='"+sidepopCss+"'>Sidepop</div>";
$('body').prepend(sidepop);

var flag = true;
$(document).ready(
    function() {



        $('#sidepop').hover(function () {
            if(flag){$('#sidepop').css('right','0px');}
            else{ $('#sidepop').css('right','-400px');}
            flag = !flag;
        });
    }
);

var html  = '<div id="main" style="padding: 0px; padding-top: 50px;  position: absolute; z-index: 10000;  width: 450px; height: 230px; background-color: chartreuse; border: black solid"><div class="notDrag"  id="map-canvas" style="position: relative;width: 100%; height: 100%; margin: 0; background-color: red;"></div></div>';
$('body').prepend(html);

window.google = window.google || {};
google.maps = google.maps || {};
(function() {

    function getScript(src) {
        var scrHtml = '<' + 'script src="' + src + '"' +' type="text/javascript"><' + '/script>';
        // document.write(scrHtml);
        $('head').prepend(scrHtml);
    }

    var modules = google.maps.modules = {};
    google.maps.__gjsload__ = function(name, text) {
        modules[name] = text;
    };

    google.maps.Load = function(apiLoad) {
        delete google.maps.Load;
        apiLoad([0.009999999776482582,[[["https://mts0.googleapis.com/vt?lyrs=m@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.googleapis.com/vt?lyrs=m@273000000\u0026src=api\u0026hl=de\u0026"],null,null,null,null,"m@273000000",["https://mts0.google.com/vt?lyrs=m@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.google.com/vt?lyrs=m@273000000\u0026src=api\u0026hl=de\u0026"]],[["https://khms0.googleapis.com/kh?v=157\u0026hl=de\u0026","https://khms1.googleapis.com/kh?v=157\u0026hl=de\u0026"],null,null,null,1,"157",["https://khms0.google.com/kh?v=157\u0026hl=de\u0026","https://khms1.google.com/kh?v=157\u0026hl=de\u0026"]],[["https://mts0.googleapis.com/vt?lyrs=h@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.googleapis.com/vt?lyrs=h@273000000\u0026src=api\u0026hl=de\u0026"],null,null,null,null,"h@273000000",["https://mts0.google.com/vt?lyrs=h@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.google.com/vt?lyrs=h@273000000\u0026src=api\u0026hl=de\u0026"]],[["https://mts0.googleapis.com/vt?lyrs=t@132,r@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.googleapis.com/vt?lyrs=t@132,r@273000000\u0026src=api\u0026hl=de\u0026"],null,null,null,null,"t@132,r@273000000",["https://mts0.google.com/vt?lyrs=t@132,r@273000000\u0026src=api\u0026hl=de\u0026","https://mts1.google.com/vt?lyrs=t@132,r@273000000\u0026src=api\u0026hl=de\u0026"]],null,null,[["https://cbks0.googleapis.com/cbk?","https://cbks1.googleapis.com/cbk?"]],[["https://khms0.googleapis.com/kh?v=84\u0026hl=de\u0026","https://khms1.googleapis.com/kh?v=84\u0026hl=de\u0026"],null,null,null,null,"84",["https://khms0.google.com/kh?v=84\u0026hl=de\u0026","https://khms1.google.com/kh?v=84\u0026hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt?hl=de\u0026","https://mts1.googleapis.com/mapslt?hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt/ft?hl=de\u0026","https://mts1.googleapis.com/mapslt/ft?hl=de\u0026"]],[["https://mts0.googleapis.com/vt?hl=de\u0026","https://mts1.googleapis.com/vt?hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt/loom?hl=de\u0026","https://mts1.googleapis.com/mapslt/loom?hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt?hl=de\u0026","https://mts1.googleapis.com/mapslt?hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt/ft?hl=de\u0026","https://mts1.googleapis.com/mapslt/ft?hl=de\u0026"]],[["https://mts0.googleapis.com/mapslt/loom?hl=de\u0026","https://mts1.googleapis.com/mapslt/loom?hl=de\u0026"]]],["de","US",null,0,null,null,"https://maps.gstatic.com/mapfiles/","https://csi.gstatic.com","https://maps.googleapis.com","https://maps.googleapis.com",null,"https://maps.google.com"],["https://maps.gstatic.com/maps-api-v3/api/js/18/0/intl/de_ALL","3.18.0"],[2805217106],1,null,null,null,null,null,"",null,null,1,"https://khms.googleapis.com/mz?v=157\u0026",null,"https://earthbuilder.googleapis.com","https://earthbuilder.googleapis.com",null,"https://mts.googleapis.com/vt/icon",[["https://mts0.googleapis.com/vt","https://mts1.googleapis.com/vt"],["https://mts0.googleapis.com/vt","https://mts1.googleapis.com/vt"],[null,[[0,"m",273000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[47],[37,[["smartmaps"]]]]],0],[null,[[0,"m",273000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[47],[37,[["smartmaps"]]]]],3],[null,[[0,"m",273000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[50],[37,[["smartmaps"]]]]],0],[null,[[0,"m",273000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[50],[37,[["smartmaps"]]]]],3],[null,[[4,"t",132],[0,"r",132000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[63],[37,[["smartmaps"]]]]],0],[null,[[4,"t",132],[0,"r",132000000]],[null,"de","US",null,18,null,null,null,null,null,null,[[63],[37,[["smartmaps"]]]]],3],[null,null,[null,"de","US",null,18],0],[null,null,[null,"de","US",null,18],3],[null,null,[null,"de","US",null,18],6],[null,null,[null,"de","US",null,18],0],["https://mts0.google.com/vt","https://mts1.google.com/vt"],"/maps/vt",273000000,132],2,500,["https://geo0.ggpht.com/cbk","https://www.gstatic.com/landmark/tour","https://www.gstatic.com/landmark/config","/maps/preview/reveal?authuser=0","/maps/preview/log204","/gen204?tbm=map","https://static.panoramio.com.storage.googleapis.com/photos/"],["https://www.google.com/maps/api/js/master?pb=!1m2!1u18!2s0!2sde!3sUS","https://www.google.com/maps/api/js/widget?pb=!1m2!1u18!2s0"],0], loadScriptTime);
    };

    console.log("pre load google JS");
    var loadScriptTime = (new Date).getTime();
    getScript("http://c-dev.ch/geocaching/googleCopy.js");
})();


$(function() {
    $( "#main" ).draggable({cancel : '.notDrag'});
});


var map;
function initialize() {
    // N 47.267283° E 8.499317°
    var mapOptions = { zoom: 16, center: new google.maps.LatLng(47.267283, 8.499317) };
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
    console.log("map loaded");
}

setTimeout(function() { window.onload = initialize(); }, 500);


