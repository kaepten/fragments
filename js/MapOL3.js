/*
// EXTREM gutes Beispiel für ToolTip auf Feater mit speziellem STyle
//      http://openlayers.org/en/v3.1.1/examples/kml-earthquakes.html

// Layer /Waypoint mit Beschriftung
//      http://openlayers.org/en/v3.1.1/examples/vector-labels.html

// Feature Overlay - Highlighting von Feature
//      http://openlayers.org/en/v3.1.1/examples/vector-layer.html

// Permanenter ToolTip mit Info
//      http://openlayers.org/en/v3.1.1/examples/kml-timezones.html

// Zu Waypoint bewegen
//      http://openlayers.org/en/v3.1.1/examples/animation.html

// Bing Map example - Satellitenansicht
//      http://openlayers.org/en/v3.1.1/examples/bing-maps.html

// OpenStreetMap
//      http://openlayers.org/en/v3.1.1/examples/localized-openstreetmap.html

// GSON Daten laden mit Zusatzinfo - diese Info bei drag-viereck anzeigen!
//      http://openlayers.org/en/v3.1.1/examples/box-selection.html

// Schönes Beispiel wo die Kartencontrols mit Bootstrap ToolTips versehen worden sind
//      http://openlayers.org/en/v3.1.1/examples/button-title.html

// Zoom und Center Beipsiel
//      http://openlayers.org/en/v3.1.1/examples/center.html

// Custom Control Beispiel (Rotation)
//      http://openlayers.org/en/v3.1.1/examples/custom-controls.html

// Zoom Slider Custom Control - eigner Style!
//      http://openlayers.org/en/v3.1.1/examples/zoomslider.html

// Drag Marker
//      http://openlayers.org/en/v3.1.1/examples/drag-features.html

// Waypoint / Feature hinzufügen und Draggen
//      http://openlayers.org/en/v3.1.1/examples/draw-and-modify-features.html


// Waypoint / Feature & Linie zeichnen / hinzufügen
//      http://openlayers.org/en/v3.1.1/examples/draw-features.html

// Komplexes Beispiel mit importierten Daten, Mouspointer zeigt Info von Track
//      http://openlayers.org/en/v3.1.1/examples/igc.html

// Messen von Strecken (zeichnen und Länge ausgabe
//      http://openlayers.org/en/v3.1.1/examples/measure.html

// Mausposition auslesen und anzeigen
//      http://openlayers.org/en/v3.1.1/examples/mouse-position.html

// Position Popup (Bootstrap)
//      http://openlayers.org/en/v3.1.1/examples/overlay.html

// Näher Untersuchen - Schweizerkarte mit Layers!
// http://openlayers.org/en/v3.1.1/examples/wms-custom-proj.html


// Mouseover zeigt Feature Information
//      http://openlayers.org/en/v3.1.1/examples/vector-layer.html
*/

$(document).ready(function () {
    DrawWayPoints(geoMapsSettings);
});

window.app = {};
var app = window.app;

var wayPoints=[];
var myDom = {
    points: {
        text: "shorten",
        align: "Center",
        baseline: "Middle",
        rotation: 0,
        font: "Verdana",
        weight: "Normal",
        size: "12px",
        offsetX: 20,
        offsetY: -22,
        color: "red",
        outline: "#ffffff",
        outlineWidth: 2,
        maxreso: 10
    }
};

var getText = function(feature, resolution, dom) {
    var type = dom.text;
    var maxResolution = dom.maxreso;
    var text = feature.j.gmCoordinate.description; // "test blabli blub";//  feature.get('description');

    if (resolution > maxResolution) {
        text = '';
    } else if (type == 'hide') {
        text = '';
    } else if (type == 'shorten') {
        text = text.trunc(12);
    } else if (type == 'wrap') {
        text = Core.StringDivider(text, 16, '\n');
    }

    return text;
};

var createTextStyle = function(feature, resolution, dom) {
    var align = dom.align;
    var baseline = dom.baseline;
    var size = dom.size;
    var offsetX = parseInt(dom.offsetX, 10);
    var offsetY = parseInt(dom.offsetY, 10);
    var weight = dom.weight;
    var rotation = parseFloat(dom.rotation);
    var font = weight + ' ' + size + ' ' + dom.font;
    var fillColor = dom.color;
    var outlineColor = dom.outline;
    var outlineWidth = parseInt(dom.outlineWidth, 10);

    return new ol.style.Text({
        textAlign: align,
        textBaseline: baseline,
        font: font,
        text: getText(feature, resolution, dom),
        fill: new ol.style.Fill({color: fillColor}),
        stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
        offsetX: offsetX,
        offsetY: offsetY,
        rotation: rotation
    });
};

var createPointStyleFunction = function() {
    return function(feature, resolution) {
        var style = new ol.style.Style({
            image:
                new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    // anchor: [0.5, 46],
                    anchor: [0.5, 40],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: '//map.geo.admin.ch/1403704943/img/marker.png'
                }))
            ,
            text: createTextStyle(feature, resolution, myDom.points)
        });
        return [style];
    };
};

//region mapWrapper Funktionen

Map.ZoomToPoint = function(coordObj){
    map.getView().setCenter([coordObj.coordinate.Lv03.Y.Meter, coordObj.coordinate.Lv03.X.Meter]);
}

function DrawWayPoints(settings){

    var styleArr = [];

    var iconStyle1 = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '//map.geo.admin.ch/1403704943/img/marker.png'
        }))
    });

    var iconStyle2 = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '//www.c-dev.ch/projects/flag-ch.png'
        }))
    });

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '//www.c-dev.ch/projects/flag-fm.png'
        }))
    });

    styleArr.push(iconStyle1);
    styleArr.push(iconStyle2);
    styleArr.push(iconStyle);

    var coordsCount = settings.siteSetting.coordSettings.length;
    for (var currentCoordIndex = 0; currentCoordIndex < coordsCount; currentCoordIndex++) {
        var currentCoord = settings.siteSetting.coordSettings[currentCoordIndex];

        var point = new ol.Feature({
            geometry: new ol.geom.Point([currentCoord.coordinate.Lv03.Y.Meter, currentCoord.coordinate.Lv03.X.Meter]),
            name: currentCoord.description,
            gmCoordinate: currentCoord
        });
        point.setStyle(styleArr[0]);
        wayPoints.push(point);
    }

    var vectorSource = new ol.source.Vector({
        features: wayPoints
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);
}

function DrawSingleWayPoint(newCoord) {
    var wayPoints=[];
    var point = new ol.Feature({
        geometry: new ol.geom.Point([newCoord.coordinate.Lv03.Y.Meter, newCoord.coordinate.Lv03.X.Meter]),
        name: newCoord.description,
        gmCoordinate: newCoord
    });
    wayPoints.push(point);

    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            // anchor: [0.5, 46],
            anchor: [0.5, 40],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '//map.geo.admin.ch/1403704943/img/marker.png'
        }))
    });

    var vectorSource = new ol.source.Vector({
        features: wayPoints
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: createPointStyleFunction()
    });
    map.addLayer(vectorLayer);
}

function refreshLayer() {
    vectorLayer.setStyle(createPointStyleFunction());
};

function DeleteSingleWayPoint(delCoordId) {
    for(var index=0; index<wayPoints.length; index++) {
        var cordId = wayPoints[index].j.gmCoordinate.id;
        if(cordId == delCoordId) {
            wayPoints.slice(wayPoints[index]);
            break;
        }
    }
}

//endregion

//region CustomControl Rotation

/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
app.RotateNorthControl = function(opt_options) {

    var options = opt_options || {};

    var anchor = document.createElement('a');
    anchor.href = '#rotate-north';
    anchor.innerHTML = '<span id="geoMapKoords"></span>';

    var this_ = this;
    var handleRotateNorth = function(e) {
        // prevent #rotate-north anchor from getting appended to the url
        e.preventDefault();
        this_.getMap().getView().setRotation(this_.getMap().getView().getRotation() + 90);
    };

    anchor.addEventListener('click', handleRotateNorth, false);
    anchor.addEventListener('touchstart', handleRotateNorth, false);

    var element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable';
    element.appendChild(anchor);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(app.RotateNorthControl, ol.control.Control);

//endregion

//region Drag Code
/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function() {

    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

};
ol.inherits(app.Drag, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
        (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
                return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function(evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};
//endregion

var layer = ga.layer.create('ch.swisstopo.pixelkarte-farbe');
var currentView = new ol.View({
    resolution: 3,
    center: [679420,235646]
})
var map = new ga.Map({
    interactions: ol.interaction.defaults().extend([new app.Drag()]),
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }).extend([
        new app.RotateNorthControl()
    ]),
    target: 'map',
    layers: [layer],
    view: currentView
});

var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(0),
    projection: 'EPSG:21781',
    className: 'custom-mouse-position',
    target: document.getElementById('geoMapKoords'),
    undefinedHTML: '&nbsp;'
});

map.addControl(mousePositionControl);

var displayFeatureInfo = function(pixel) {

    var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        return feature;
    });

    if (feature) {
        var x = 1;
    }

    // var info = document.getElementById('info');
    // if (feature) { info.innerHTML = feature.getId() + ': ' + feature.get('name'); } else { info.innerHTML = '&nbsp;';}
};

$(map.getViewport()).on('mousemove', function(evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    // displayFeatureInfo(pixel);
});

map.on('click', function(evt) {

    var coordinate = evt.coordinate;
    $("#newCoordinate").val(coordinate[0] + " " + coordinate[1]);

    displayFeatureInfo(evt.pixel);
});
