
$(document).ready(function () {


    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    closer.onclick = function () {
        container.style.display = 'none';
        closer.blur();
        return false;
    };
    var overlay = new ol.Overlay({
        element: container
    });

    var layers = {};
    $.displayLayer = function (layerBodId, visible) {
        layers[layerBodId].setVisible(visible);
    };

    $.getLegend = function (layerBodId) {
        var modalBody = $('#legend-modal').find('.modal-body');
        modalBody.empty();
        // Use JSONP for IE9
        $.ajax({
            url: location.protocol + '//api3.geo.admin.ch/rest/services/api/MapServer/' + layerBodId + '/legend?lang=de',
            jsonp: "callback",
            dataType: "jsonp",
            success: function (data) {
                modalBody.append(data);
            }
        });
    };

    var layer = ga.layer.create('ch.swisstopo.pixelkarte-farbe');
    var map = new ga.Map({
        target: 'map',
        layers: [layer],
        overlays: [overlay],
        view: new ol.View2D({
            resolution: 2,
            center: [678959, 236020]
        })
    });


// Create a local GeoJson
    var myGeoJson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        678959.0000000001,
                        236020.00000000006
                    ]
                }
            }
        ]
    };

// Define a geojson data source
    var source = new ol.source.GeoJSON();

// Read the local geojson
    var features = source.readFeatures(myGeoJson);

// Create a vector source and assign the GeoJson features to it
    var vectorSource = new ol.source.Vector({
        features: features
    });

// Create a vector layer using the vector source
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

// Create a point icon style
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(({
            src: '//map.geo.admin.ch/1403704943/img/marker.png',
            offset: [1, 1]
        }))
    });

// Apply the style to the vector layer
    vectorLayer.setStyle(iconStyle);

// Add the vector layer in the map
    map.addLayer(vectorLayer);


    var featureOverlay = new ol.FeatureOverlay({
        map: map,
        image: new ol.style.Icon({src: '//map.geo.admin.ch/1403704943/img/marker.png'})
    });


    var highlight;
    var displayFeatureInfo = function (pixel) {

        var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            return feature;
        });


        if (feature !== highlight) {
            if (highlight) {
                featureOverlay.removeFeature(highlight);
            }
            if (feature) {
                featureOverlay.addFeature(feature);
            }
            highlight = feature;
        }

    };


    $(map.getViewport()).on('mousemove', function (evt) {
        var pixel = map.getEventPixel(evt.originalEvent);
        displayFeatureInfo(pixel);
    });


    var modify = new ol.interaction.Modify({
        features: featureOverlay.getFeatures(),
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });
    map.addInteraction(modify);


    map.on('click', function (evt) {
        var coordinate = evt.coordinate;
        // var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
        var template = '{x} {y}';
        // var out = ol.coordinate.toStringXY(coordinate);
        var out = '';
        var hdms = ol.coordinate.format(coordinate, template);


        overlay.setPosition(coordinate);
        content.innerHTML = '<p>' + hdms +
        '<br>' + out + '</p>';
        container.style.display = 'block';

    });

    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(0),
        projection: 'EPSG:21781',
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
        undefinedHTML: '&nbsp;'
    });

    map.addControl(mousePositionControl);

    var tpl =
        '<div class="checkbox">' +
        '<label>{label}' +
        '<input type="checkbox" onclick="$.displayLayer(\'{layerBodId}\', this.checked)"/>' +
        '</label>' + '<button onclick="$.getLegend(\'{layerBodId}\')" class="btn btn-default legend-btn" data-toggle="modal" data-target="#legend-modal">i</button>'
    '</div>';

    var nano = function (template, data) {
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

    $('.checkbox-tree').bind('click', function (evt) {
        var display = $('.checkbox-inhalt').css('display');
        if (display === 'block') {
            $('.checkbox-inhalt').hide();
        } else {
            $('.checkbox-inhalt').show();
        }
    });

    var catalogConfig = [
        {layerBodId: 'ch.bafu.bundesinventare-amphibien', label: 'Amphibien Ortsfeste Objekte'},
        {layerBodId: 'ch.bafu.bundesinventare-amphibien_wanderobjekte', label: 'Amphibien Wanderobjekte'},
        {layerBodId: 'ch.bafu.wrz-wildruhezonen_portal', label: 'Wildruhezonen'}
    ];

    for (var i = 0; i < catalogConfig.length; i++) {
        var item = catalogConfig[i];
        $('.checkbox-inhalt').append(nano(tpl, item));
        layers[item.layerBodId] = ga.layer.create(item.layerBodId);
        layers[item.layerBodId].setVisible(false);
        map.addLayer(layers[item.layerBodId]);
    }

});
