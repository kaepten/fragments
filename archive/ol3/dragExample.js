/**
 * Define a namespace for the application.
 */
window.app = {};
var app = window.app;


/**
 * @constructor
 * @param {string=} opt_cursor Cursor.
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function(opt_cursor) {
    ol.interaction.Pointer.call(this);

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = opt_cursor;

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
 * @param {ol.MapBrowserPointerEvent} evt Map browser point event.
 * @return {boolean} Capture dragging.
 */
app.Drag.prototype.handlePointerDown = function(evt) {
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
 * @param {ol.MapBrowserPointerEvent} evt Map browser point event.
 */
app.Drag.prototype.handlePointerDrag = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = this.feature_.getGeometry();
    var flatCoordinates = ol.geom.translate(geometry, deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
};


/**
 * @param {ol.MapBrowserPointerEvent} evt Event.
 */
app.Drag.prototype.handlePointerMove = function(evt) {
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
 * @param {ol.MapBrowserPointerEvent} evt Map browser point event.
 * @return {boolean} Capture dragging.
 */
app.Drag.prototype.handlePointerUp = function(evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};


/**
 * @param {boolean} handled Was the down event handled?
 * @return {boolean} Should the event be stopped?
 */
app.Drag.prototype.shouldStopEvent = function(handled) {
    return handled;
};



var map = new ol.Map({
    interactions: ol.interaction.defaults().extend([
        new app.Drag('pointer')
    ]),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
            })
        }),
        new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [
                    new ol.Feature(new ol.geom.Point(
                        [0, 0]
                    )),
                    new ol.Feature(new ol.geom.LineString([
                        [-1e7, 1e6], [-1e6, 3e6]
                    ])),
                    new ol.Feature(new ol.geom.Polygon([[
                        [-3e6, -1e6], [-3e6, 1e6], [-1e6, 1e6], [-1e6, -1e6], [-3e6, -1e6]
                    ]]))
                ]
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.95,
                    src: 'data/icon.png'
                })),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: [255, 0, 0, 1]
                }),
                fill: new ol.style.Fill({
                    color: [0, 0, 255, 0.6]
                })
            })
        })
    ],
    target: 'map',
    view: new ol.View({
        center: [0, 0],
        zoom: 2
    })
});
