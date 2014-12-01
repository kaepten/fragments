//--------------------------------------------------------------------------------
//	$Id: multimark.js,v 1.3 2014/08/23 15:28:17 wolf Exp wolf $
//--------------------------------------------------------------------------------
//	Erklaerung:	http://www.netzwolf.info/kartografie/openlayers/multimark.htm
//--------------------------------------------------------------------------------
//	Fragen, Wuensche, Bedenken, Anregungen?
//	<openlayers(%40)netzwolf.info>
//--------------------------------------------------------------------------------

OpenLayers.Layer.MultiMark = OpenLayers.Class(OpenLayers.Layer.Markers,{

    //----------------------------------------------------------------------
    //	config
    //----------------------------------------------------------------------

    icon:		null,		// marker icon
    queryParam:	null,
    permaLinkId:	null,

    //----------------------------------------------------------------------
    //	private
    //----------------------------------------------------------------------

    projection:	new OpenLayers.Projection('EPSG:4326'),
    clickHandler:	null,
    movingMarker:	null,

    //----------------------------------------------------------------------
    //	OpenLayers.Layer callbacks
    //----------------------------------------------------------------------

    destroy: function() {

        this.stopMove();

        if (this.clickHandler) this.clickHander.destroy();
        this.clickHandler = null;

        OpenLayers.Layer.Markers.prototype.destroy.apply(this, arguments);
    },

    afterAdd: function() {

        OpenLayers.Layer.Markers.prototype.afterAdd.apply(this, arguments);

        //--------------------------------------------------------------
        //	get lonlats from query or hash
        //--------------------------------------------------------------

        if (this.queryParam) {

            var tagvals = location.search.substr(1).split('&');

            for (var t in tagvals) {

                var tagval=tagvals[t];
                if (tagval.split('=')[0] != this.queryParam) continue;

                this.setMarkers (decodeURIComponent(tagval.substring(this.queryParam.length+1)));
            }

        } else if (this.queryParam!==null) {

            this.setMarkers (decodeURIComponent(location.hash.substring(1)));
        }

        //--------------------------------------------------------------
        //	zoom map to extent of markers
        //--------------------------------------------------------------

        if (this.markers.length>=1) {

            this.map.zoomToExtent (this.getDataExtent());
        }

        //--------------------------------------------------------------
        //	install click on map handler
        //--------------------------------------------------------------

        this.clickHandler = new OpenLayers.Handler.Click (
            this, {'click': this.click}, {'single': true});
        this.clickHandler.activate();
    },

    //----------------------------------------------------------------------
    //	click handler (creates marker)
    //----------------------------------------------------------------------

    click: function(evt) {

        if (evt.ctrlKey) {

            this.setMarker(this.map.getLonLatFromViewPortPx(evt.xy));
        }

        OpenLayers.Event.stop(evt);
    },

    //----------------------------------------------------------------------
    //	create markers from lon!lat!... string
    //----------------------------------------------------------------------

    setMarkers: function (list) {

        var values = list.split('!');

        while (values.length>=2) {

            var lon = parseFloat(values.shift());
            var lat = parseFloat(values.shift());

            if (isNaN(lon) || isNaN(lat)) break;

            var lonLat = new OpenLayers.LonLat(lon,lat).
                transform(this.projection, this.map.getProjectionObject());

            this.setMarker(lonLat);
        }
    },

    //----------------------------------------------------------------------
    //	create marker at position
    //----------------------------------------------------------------------

    setMarker: function (lonLat) {

        var layer = this; // closure
        var icon  = this.icon ? this.icon.clone(): null;
        var marker= new OpenLayers.Marker (lonLat, icon);

        marker.map= this.map; // OL bug
        marker.icon.imageDiv.style.cursor='hand';

        this.addMarker (marker);

        //--------------------------------------------------------------
        //	install onclick handler - deletes marker
        //--------------------------------------------------------------

        marker.icon.imageDiv.onclick = function(evt) {

            if (evt.ctrlKey) {

                layer.removeMarker(marker);
                marker.destroy();
                layer.updatePermalink();
            }

            OpenLayers.Event.stop(evt);
        }

        //--------------------------------------------------------------
        //	install onmousedown handler - starts dragging
        //--------------------------------------------------------------

        marker.icon.imageDiv.onmousedown = function(evt) {

            if (!evt.ctrlKey && !evt.ctrlKey) {

                layer.startMove(marker);
            }

            OpenLayers.Event.stop(evt);
        }

        this.updatePermalink();
    },

    //----------------------------------------------------------------------
    //	drag marker
    //----------------------------------------------------------------------

    startMove: function (marker) {

        this.map.events.register ('mousemove', this, this.moveMarker);
        this.map.events.register ('mouseup', this, this.stopMove);
        this.movingMarker = marker;
    },

    moveMarker: function (evt) {

        if (!this.movingMarker) return;
        var lonLat = this.map.getLonLatFromViewPortPx(evt.xy);
        var px = this.map.getLayerPxFromLonLat (lonLat);
        this.movingMarker.moveTo (px);
    },

    stopMove: function () {

        this.map.events.unregister ('mousemove', this, this.moveMarker);
        this.map.events.unregister ('mouseup', this, this.stopMove);
        this.movingMarker = null;
        this.updatePermalink();
    },

    //----------------------------------------------------------------------
    //	update permalink
    //----------------------------------------------------------------------

    updatePermalink: function() {

        var element = OpenLayers.Util.getElement(this.permalink);
        if (!element) return;

        //--------------------------------------------------------------
        //	gather lonlats of markers
        //--------------------------------------------------------------

        var values=[];

        for (var m in this.markers) {

            var lonLat = this.markers[m].lonlat.clone().
                transform(this.map.getProjectionObject(), this.projection);
            values.push(lonLat.lon.toFixed(5));
            values.push(lonLat.lat.toFixed(5));
        }

        //--------------------------------------------------------------
        //	use encoded value as query or hash
        //--------------------------------------------------------------

        var encoded = encodeURIComponent(values.join('!'));

        var url = this.queryParam ? '?' + this.queryParam + '=' + encoded : '#' + encoded;

        element.href = url;
    }
});

//--------------------------------------------------------------------------------
//	$Id: multimark.js,v 1.3 2014/08/23 15:28:17 wolf Exp wolf $
//--------------------------------------------------------------------------------
