<?php
/*

UserFrosting Version: 0.2.2
By Alex Weissman
Copyright (c) 2014

Based on the UserCake user management system, v2.0.2.
Copyright (c) 2009-2012

UserFrosting, like UserCake, is 100% free and open-source.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// require_once("../models/config.php");

// Request method: GET
//$ajax = checkRequestMode("get");

//if (!securePage(__FILE__)){
   //  apiReturnError($ajax);
// }

// setReferralPage(getAbsoluteDocumentPath(__FILE__));

ini_set("display_errors", "off");
ini_set("display_startip_errors", "off");
$test = $_POST['geoMapsPlannerParams'];
if(!isset($test) or empty($test))
{
echo "Unerlaubter Zugriff!";
die();
}
?>

<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>GeoMaps Planner</title>

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js"></script>

    <script type="text/javascript" src="js/Coordinate.js"></script>
    <script type="text/javascript" src="js/Core.js"></script>
    <script type="text/javascript" src="js/Geo.js"></script>
    <script type="text/javascript" src="js/wgs84_ch1903.js"></script>
    <script type="text/javascript" src="js/latlon.js"></script>
    <script type="text/javascript" src="js/settings.js"></script>

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:600, 400,300' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Yanone+Kaffeesatz:400,200,300' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="archive/ol3/ol.css" type="text/css">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">

    <link rel="stylesheet" href="css/glyphicon.css">
    <link rel="stylesheet" href="css/fragment.css">

    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min.js"></script>

    <style>
        .tbody {
            /*font-family: 'Open Sans', sans-serif;*/
            font-family: 'Yanone Kaffeesatz', sans-serif;
            font-weight: 400;
            font-size: 1em;
        }

        .rotate-north {
            position: absolute;
            bottom: 60px;
            left: 8px;
            background: rgba(255,255,255,0.8);
            padding: 2px;
        }
        .ol-touch .rotate-north {
            top: 80px;
        }
        .rotate-north a {
            display: block;
            color: black;
            font-family: 'Open Sans', sans-serif;
            font-weight: 400;
            font-size: 12px;
            margin: 1px;
            text-decoration: none;
            text-align: left;
            height: 22px;
            width: 150px;
            background: #dadada;
            padding-left: 10px;
            padding-top: 2px;
        }
        .ol-touch .rotate-north a {
            font-size: 20px;
            height: 30px;
            width: 30px;
            line-height: 28px;
        }
        .rotate-north a:hover {
            background: rgba(0,60,136,0.7);
        }

        .geoLayers {
            background: #ebebeb;
            padding: 10px;
            font-size: 12px;
        }
    </style>

</head>
<body>

    <div id="sidebarcontrol" class="sidebarcontrol reset"><span id="sidebarcontrolicon"><i class="glyphicon glyphicons-chevron-right"></i></span></div>
    <div id="sidebar">
        <div class="geoLayers">
            <a class="checkbox-tree" unselectable="on"><span class="glyphicon glyphicon-chevron-down" style="display:none"></span><span class="glyphicon glyphicon-chevron-up"></span>&nbsp;Schutzgebiete Bundesinventare</a>
            <div class="checkbox-inhalt"></div>
        </div>
        <div id="GeoMapsCalculator" class="gM calculator">
            <div class="header">
                <div class="clearfix">
                    <div class="left">
                        <input id="newCoordinate" type="text" value="">
                    </div>
                    <div class="left">
                        <a class="cmd newCoord"><span class="fa fa-compass"></span></a>
                    </div>
                    <div class="right">
                        <a class="cmd allShowHide"><span class="glyphicon glyphicon-eye-close"></span></a>
                        <a class="cmd allUpDown"><span class="glyphicon glyphicon-chevron-up"></span></a>
                        <a class="cmd allDelete"><span class="glyphicon glyphicon-remove-circle"></span></a>
                    </div>
                </div>
                <div>
                    <input type="radio" name="CoordFormat" value="LV03">SwissGrid
                    <input type="radio" name="CoordFormat" value="Dms">Dms
                    <input type="radio" name="CoordFormat" value="Ddd">Ddd
                    <input type="radio" name="CoordFormat" value="Dmm">Dmm
                </div>
                <div>
                    <a class="cmd delSettings">Alle Settings löschen</a>
                </div>
            </div>
            <ul class="cordBoxList clearfix" style="vertical-align: top;"></ul>
        </div>
    </div>

    <div id="map" class="map"></div>

    <script src="http://api3.geo.admin.ch/loader.js?lang=en" type="text/javascript"></script>
    <script src="js/GeoMapsPlanner.js" type="text/javascript"></script>
    <script src="js/Map_OL3.js" type="text/javascript"></script>

    <div stlye="z-index:1;">
    <?php
    $decoded = json_decode($_POST['geoMapsPlannerParams']);

    for($i=0;$i<count($decoded->{'waypoints'});$i++)
    {
        echo "<p>" . $decoded->{'waypoints'}[$i] . "/<p>\r\n";
    }

    ?>
    </div>

</body>
</html>