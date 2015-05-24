function Map_OL3() {

    var that = this;

    window.app = {};
    var app = window.app;

    //region Stylesheet

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
            outlineWidth: 5,
            maxreso: 10
        }
    };

    var getText = function(feature, resolution, dom) {
        var type = dom.text;
        var maxResolution = dom.maxreso;
        var text = feature.n.gmCoordinate.description; // "test blabli blub";//  feature.get('description');

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
        var outlineWidth = parseInt(dom.outlineWidth, 20);

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

    var circleStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 100, 50, 0.3)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(255, 100, 50, 0.8)'
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(55, 200, 150, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                width: 1,
                color: 'rgba(55, 200, 150, 0.8)'
            }),
            radius: 7
        })
    });

    var styleGebiete = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 100, 50, 0.3)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(255, 100, 50, 0.8)'
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(55, 200, 150, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                width: 1,
                color: 'rgba(55, 200, 150, 0.8)'
            }),
            radius: 7
        })
    });

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

        console.log(evt.coordinate[0] + " : " + evt.coordinate[1]);
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

    //region Initialize Map




    var layer = ga.layer.create('ch.swisstopo.pixelkarte-farbe');
    var currentView = new ol.View({
        resolution: 10,
        center: [600000, 200000] // 682714.88, 235624.94
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

    var wayPoints=[];
    var vectorLayer = new ol.layer.Vector();
    vectorLayer.setStyle(createPointStyleFunction());
    var vectorSource = new ol.source.Vector();
    vectorLayer.setSource(vectorSource);
    map.addLayer(vectorLayer);

    var styleFunction = function(feature, resolution) {
        var geometry = feature.getGeometry();
        var styles = [
            // linestring
            new ol.style.Style({
                stroke: new ol.style.Stroke({color: '#ff0000', width: 4})
            })
        ];
        return styles;
    }
    var vectorLayerLine = new ol.layer.Vector({
        style: styleFunction
    });
    var vectorSourceLine = new ol.source.Vector();
    map.addLayer(vectorLayerLine);



    //endregion

    function GetFeatureOfCoordinateId(id) {
        var currentFeatures = vectorSource.getFeatures();
        for(var idx=0; idx<currentFeatures.length; idx++) {
            if(id == currentFeatures[idx].n.gmCoordinate.id)
            {
                return currentFeatures[idx];
            }
        }
    }

    this.DrawWayPoints = function (settings) {
        var coordsCount = settings.siteSetting.coordSettings.length;
        for (var currentCoordIndex = 0; currentCoordIndex < coordsCount; currentCoordIndex++) {
            var currentCoord = settings.siteSetting.coordSettings[currentCoordIndex];
            that.AddSingleWayPoint(currentCoord);
            // Projektions-Linie hinzufügen
            for (var projektionsCoordIndex = 0; projektionsCoordIndex< currentCoord.showLineTo.length; projektionsCoordIndex++) {
                var coord1 = SettingSite.GetSettingCoordObject(settings, currentCoord.id);
                var coord2 = SettingSite.GetSettingCoordObject(settings, currentCoord.showLineTo[projektionsCoordIndex].coordId);
                that.ShowHideLine(currentCoord.showLineTo[projektionsCoordIndex].isShown, coord1,coord2);
            }
        }
        return;
    }

    this.AddSingleWayPoint = function(newCoord) {
        var point = new ol.Feature({
            geometry: new ol.geom.Point([newCoord.coordinate.Lv03.Y.Meter, newCoord.coordinate.Lv03.X.Meter]),
            name: newCoord.description,
            gmCoordinate: newCoord
        });
        wayPoints.push(point);
        vectorSource.addFeature(point);
        map.getView().setCenter([newCoord.coordinate.Lv03.Y.Meter, newCoord.coordinate.Lv03.X.Meter]);
    }

    this.DeleteSingleWayPointById = function(id) {
        var feature = GetFeatureOfCoordinateId(id);
        this.DeleteSingleWayPointByFeature(feature);
    }

    this.DeleteSingleWayPointByFeature = function(feature) {
        var delCoordId = feature.n.gmCoordinate.id;
        for(var index=0; index<wayPoints.length; index++) {
            var cordId = wayPoints[index].n.gmCoordinate.id;
            if(cordId == delCoordId) {
                var deletable = index;
                wayPoints = wayPoints.slice(deletable);
                vectorSource.removeFeature(feature);
                break;
            }
        }
    }

    this.UpdateWayPoint = function(id) {
        var currentFeature = GetFeatureOfCoordinateId(id);
        var savedCoordinate = currentFeature.n.gmCoordinate;
        this.DeleteSingleWayPointByFeature(currentFeature);
        this.AddSingleWayPoint(savedCoordinate);
        // neue Koordinate anspringen (automatisch durch setzen der Geometry)
        currentFeature.setGeometry(new ol.geom.Point([currentFeature.n.gmCoordinate.coordinate.Lv03.Y.Meter, currentFeature.n.gmCoordinate.coordinate.Lv03.X.Meter]));
    };

    this.ZoomToPoint = function(coordObj){

        var duration = 1000;
        var start = +new Date();
        var pan = ol.animation.pan({
            duration: duration,
            source: /** @type {ol.Coordinate} */ (map.getView().getCenter()),
            start: start
        });
        var bounce = ol.animation.bounce({
            duration: duration,
            resolution: 3 * map.getView().getResolution(),
            start: start
        });
        map.beforeRender(pan, bounce);
        map.getView().setCenter([coordObj.coordinate.Lv03.Y.Meter, coordObj.coordinate.Lv03.X.Meter]);
    }

    this.ShowHideLine = function(isShown, coord1, coord2) {
        if(isShown) {
            this.AddLine(coord1, coord2);
        } else if(coord1 != undefined && coord2 != undefined) {
                this.RemoveLine(coord1.id, coord2.id);
        }
    }

    this.AddLine = function(coord1, coord2) {
        var currentFeatures = vectorSourceLine.getFeatures();
        for(var idx=0; idx<currentFeatures.length; idx++) {
            if((coord1.id == currentFeatures[idx].C1 && coord2.id == currentFeatures[idx].C2) || (coord1.id == currentFeatures[idx].C2 && coord2.id == currentFeatures[idx].C1)) {
                return;
            }
        }

        var line = new ol.geom.LineString([[coord1.coordinate.Lv03.Y.Meter, coord1.coordinate.Lv03.X.Meter], [coord2.coordinate.Lv03.Y.Meter, coord2.coordinate.Lv03.X.Meter]],"XY");
        var lineFeature = new ol.Feature(line);
        lineFeature.C1 = coord1.id;
        lineFeature.C2 = coord2.id;

        vectorSourceLine.addFeatures([lineFeature]);
        vectorLayerLine.setSource(vectorSourceLine);
    }

    this.RemoveLine = function(coord1Id, coord2Id) {
        "use strict";
        var currentFeatures = vectorSourceLine.getFeatures();
        var removableFeature;
        for(var idx=0; idx<currentFeatures.length; idx++) {
            if((coord1Id == currentFeatures[idx].C1 && coord2Id == currentFeatures[idx].C2) || (coord1Id == currentFeatures[idx].C2 && coord2Id == currentFeatures[idx].C1)) {
                removableFeature = currentFeatures[idx];
                break;
            }
        }
        if(removableFeature != undefined) {
            vectorSourceLine.removeFeature(removableFeature);
            vectorLayerLine.setSource(vectorSourceLine);
        }
    }

    this.AddLayer = function(layer) {
        "use strict";
        map.addLayer(layer);
    }

    //region Map Events

    map.on('click', function(evt) {
        var coordinate = evt.coordinate;
        if(evt.originalEvent.ctrlKey) {
            var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                return feature;
            });
            DeleteCoordinate(feature.n.gmCoordinate.id);
        } else if(evt.originalEvent.shiftKey){
            SetMainCoord(Core.Round(coordinate[0], 2) + " " + Core.Round(coordinate[1], 2));
            AddNewCoordBox();
        } else {
            SetMainCoord(Core.Round(coordinate[0], 2) + " " + Core.Round(coordinate[1], 2));
        }
    });

    //endregion

    //region Map Controls

    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(0),
        // projection: 'EPSG:21781',
        className: 'custom-mouse-position',
        target: document.getElementById('geoMapKoords'),
        undefinedHTML: '&nbsp;'
    });

    map.addControl(mousePositionControl);

    //endregion
}