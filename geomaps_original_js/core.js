function Coords(latLon, swissGrid){
	this._latLon = latLon;
	if(typeof swissGrid == 'undefined') {
		this._swissGrid = SwissGrid.WGStoCH(latLon.lat(), latLon.lon());
	} else {
		this._swissGrid = swissGrid;
	}
};

Coords.prototype.LatLon = function() {return this._latLon;};
Coords.prototype.SwissGrid = function() {return this._swissGrid;};

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

var Core = {
		UpdateScript : function(){						
			try
			{
				function updateCheck(forced)
				{					
					if ((forced) || (parseInt(GM_getValue('SUC_last_update', '0')) + 86400000 <= (new Date().getTime()))) // Checks once a day (24 h * 60 m * 60 s * 1000 ms)
					// if ((forced) || (parseInt(GM_getValue('SUC_last_update', '0')) + 10000 <= (new Date().getTime()))) // Checks once a day (24 h * 60 m * 60 s * 1000 ms)
					{
						try
						{
							GM_xmlhttpRequest(
									{
										method: 'GET',
										url: 'http://www.c-dev.ch/geocaching/greasemonkey/geomaps/version.json',
										headers: {'Cache-Control': 'no-cache'},
										onload: function(resp)
										{																						
											var local_version, remote_version, rt, script_name;
											rt=resp.responseText;
											var versionObj = JSON.parse(rt);
											
											GM_setValue('SUC_last_update', new Date().getTime()+'');
											remote_version=parseInt(versionObj.currentVersion);
											local_version=parseInt(GM_getValue('SUC_current_version', '-1'));

											console.log('Local version: '+local_version+' Remote version: ' + remote_version);

											if(local_version!=-1)
											{												
												if (remote_version > local_version)
												{
													text = Core.Format(versionObj.messageText, local_version);
													InsertAlert(versionObj.messageTitle, text);         
												}
												else if (forced)
												{
													alert(script_name+' ist auf dem aktuellsten Stand und muss nicht aktualisiert werden!');
												}
											}
											else
                      {
												//GM_setValue('SUC_current_version', remote_version+'');
                      }
										}
									});
						}
						catch (err)
						{
							if (forced)
								alert('Während der Aktualisierung trat ein Fehler auf:\n'+err);
						}
					}
				}
				GM_registerMenuCommand('GeoMaps - Manueller update check', function()
				{
					updateCheck(true);
				});
				updateCheck(false);

                function InsertAlert(title, text){                		
                		console.log(text);
                    var html_test = '<div class="ui-widget"><div class="ui-state-error ui-corner-all" style=" padding: 2em 7em;"><p style="font-size: 140%;margin: 0">'+
                                    title + '</p><p>'+ text +
                                    '<div  style="margin-bottom: 10px"><span id="closeAlert"><a href="#">Schliessen</a> </span>'
                                    //'<br/><input id="showAgain" type="checkbox" value="" />Nicht mehr anzeigen (Sie werden nicht mehr auf die neue Version hingewiesen, wird NICHT empfohlen!)</div></div></div>'

                    var closed = GM_getValue('SUC_reminder_close', false);
                    // if(!closed) $('body').children(':first').prepend(html_test);
                    if(!closed) $('body').prepend(html_test); 
                    $('#closeAlert').click(function(){                    	
                       if($('#showAgain').is(':checked')) {
                            GM_setValue('SUC_reminder_close', true);
                        }
                       $('.ui-widget').hide();
                    });
}
			}
			catch(err)
			{}
		},

		Format : function (str)
		{
			for(i = 1; i < arguments.length; i++){
				str = str.replace('{' + (i - 1) + '}', arguments[i]);
			}
			return str;
		},

		Fill : function(str, char, length, left){
			var retStr = str;
			if(str.toString().length < length)
			{
				retStr = str.toString();
				for(var i = 0; i<(length -str.toString().length); i++){
					if(left)
					{
						retStr = char + retStr;
					}
					else
					{
						retStr = retStr + char;
					}
				}
			}
			return retStr;
		},

		AppendLinkCursor : function(element)
		{
			element.hover(function() {
				$(this).css('cursor','pointer');
			}, function() {
				$(this).css('cursor','auto');
			});
		},

		AddCSS : function(css) {
			var head, style;
			head = document.getElementsByTagName('head')[0];
			if (!head) { return; }
			style = document.createElement('style');
			style.type = 'text/css';
			style.innerHTML = css;
			head.appendChild(style);
		}
};

var CoordFormatParser = {

    Parse : function(coordFormatString, coords)
    {
        // GM_log("Parse start : " + coordFormatString);
        var reg = /\[(dec|deg|dms)\.(\w{3})\.(\w{1,2})\:?(\d?).*?\]/gmi;
        var regSwiss = /\[(swi)\.(x|y)\:(\d)-(\d)\]/gmi;

        var decObj = Convert.ObjDec(coords.LatLon().lat(),coords.LatLon().lon());
        var degObj = Convert.ObjDecToDeg(decObj);
        var dmsObj = Convert.ObjDecToDms(decObj);
        var swissObj = Convert.WGStoCH(coords.LatLon().lat(),coords.LatLon().lon());

        var parseOutput = coordFormatString;
        while (formatStringParts = reg.exec(coordFormatString)) {

            switch (formatStringParts[1]) {
              case "dec":
                parseOutput = this.FormatDec(parseOutput, formatStringParts, decObj);
                break;
              case "dms":
                parseOutput = this.FormatDms(parseOutput, formatStringParts, dmsObj);
                break;
              case "deg":
                parseOutput = this.FormatDeg(parseOutput, formatStringParts, degObj);
                break;
            }
        }

        while (formatStringParts = regSwiss.exec(coordFormatString)) {
            switch(formatStringParts[1]) {
                case "swi":
                    parseOutput = this.FormatSwiss(parseOutput, formatStringParts, swissObj);
                    break;
            }
        }

        // GM_log("Parse end : " + parseOutput);
        return parseOutput;
    },

    FormatDec : function(coordFormatString, inputValue, decObj)
    {
        var outValue = "";
        switch (inputValue[3]) {
              case "p":
                // lat=='' ? '' : (deg<0 ? 'S ' : 'N ')
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dec\.lat\.p\]/g, "N");
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dec\.lon\.p\]/g, "E");
                  }
                break;
              case "v":
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dec\.lat\.v\]/g, decObj[0].dec);
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dec\.lon\.v\]/g, decObj[1].dec);
                  }
                break;
              case "n":
                  if(inputValue[2] == "lat")
                  {
                      var dezNumber = decObj[0].decnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[dec\.lat\.n\:?\d?\]/g, dezNumber);
                  }
                  if(inputValue[2] == "lon")
                  {
                      var dezNumber = decObj[1].decnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[dec\.lon\.n\:?\d?\]/g, dezNumber);
                  }
                break;
        }
        return coordFormatString;
    },

    FormatDeg : function(coordFormatString, inputValue, degObj)
    {
        var outValue = "";
        switch (inputValue[3]) {
              case "p":
                // lat=='' ? '' : (deg<0 ? 'S ' : 'N ')
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[deg\.lat\.p\]/g, "N");
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[deg\.lon\.p\]/g, "E");
                  }
                break;
              case "d":
                  if(inputValue[2] == "lat")
                  {
                      if (degObj[0].grad<10) degObj[0].grad = '0' + degObj[0].grad;
                      coordFormatString = coordFormatString.replace(/\[deg\.lat\.d\]/g, degObj[0].grad);
                  }
                  if(inputValue[2] == "lon")
                  {
                      if (degObj[1].grad<10) degObj[1].grad = '0' + degObj[1].grad;
                      if (degObj[1].grad<100) degObj[1].grad = '0' + degObj[1].grad;
                      coordFormatString = coordFormatString.replace(/\[deg\.lon\.d\]/g, degObj[1].grad);
                  }
                break;
              case "mv":
                  if(inputValue[2] == "lat")
                  {
                      if (degObj[0].mindec<10) degObj[0].mindec = '0' +degObj[0].mindec;
                      coordFormatString = coordFormatString.replace(/\[deg\.lat\.mv\]/g, degObj[0].mindec);
                  }
                  if(inputValue[2] == "lon")
                  {
                      if (degObj[1].mindec<10) degObj[1].mindec = '0' +degObj[1].mindec;
                      coordFormatString = coordFormatString.replace(/\[deg\.lon\.mv\]/g, degObj[1].mindec);
                  }
                break;
                case "mn":
                  if(inputValue[2] == "lat")
                  {
                      var dezNumber = degObj[0].mindecnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[deg\.lat\.mn\:?\d?\]/g, dezNumber);
                  }
                  if(inputValue[2] == "lon")
                  {
                      var dezNumber = degObj[1].mindecnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[deg\.lon\.mn\:?\d?\]/g, dezNumber);
                  }
                break;
        }
        return coordFormatString;
    },

    FormatDms : function(coordFormatString, inputValue, dmsObj)
    {
        // GM_log("FormatDms : " + inputValue);
        var outValue = "";
        switch (inputValue[3]) {
              case "p":
                // lat=='' ? '' : (deg<0 ? 'S ' : 'N ')
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lat\.p\]/g, "N");
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lon\.p\]/g, "E");
                  }
                break;
              case "d":
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lat\.d\]/g, dmsObj[0].grad);
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lon\.d\]/g, dmsObj[1].grad);
                  }
                break;
              case "m":
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lat\.m\]/g, dmsObj[0].minutes);
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lon\.m\]/g, dmsObj[1].minutes);
                  }
                break;
              case "s":
                  if(inputValue[2] == "lat")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lat\.s\]/g, dmsObj[0].secdec);
                  }
                  if(inputValue[2] == "lon")
                  {
                      coordFormatString = coordFormatString.replace(/\[dms\.lon\.s\]/g, dmsObj[1].secdec);
                  }
                break;
                case "z":
                  if(inputValue[2] == "lat")
                  {
                      var dezNumber = dmsObj[0].secdecnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[dms\.lat\.z\:?\d?\]/g, dezNumber);
                  }
                  if(inputValue[2] == "lon")
                  {
                      var dezNumber = dmsObj[1].secdecnz;
                      if(inputValue[4] != null)
                      {
                          dezNumber = runde(dezNumber, Number(inputValue[4]));
                      }
                      dezNumber = String(dezNumber).split(".")[1];
                      coordFormatString = coordFormatString.replace(/\[dms\.lon\.z\:?\d?\]/g, dezNumber);
                  }
                break;
        }
        return coordFormatString;
    },

    FormatSwiss : function(coordFormatString, inputValue, swissObj)
    {
        switch (inputValue[2]) {
              case "x":
                  var regExString = "\\[swi\\.x\\:"+inputValue[3]+"\\-"+inputValue[4]+"\\]";
                  var re = new RegExp(regExString);
                  coordFormatString = coordFormatString.replace(re, String(Math.round(swissObj[1])).substring(inputValue[3], inputValue[4]));
                break;
              case "y":
                  var regExString = "\\[swi\\.y\\:"+inputValue[3]+"\\-"+inputValue[4]+"\\]";
                  var re = new RegExp(regExString);
                  coordFormatString = coordFormatString.replace(re, String(Math.round(swissObj[0])).substring(inputValue[3], inputValue[4]));
                break;
        }
        return coordFormatString;
    }
};


var Convert = {

        ObjDec : function(latitude, longitude)	{
            var partsLat= String(latitude).split(".");
            var partsLon= String(longitude).split(".");
			return [{prefix:'N',value:latitude,dec:Number(partsLat[0]),decn:Number(partsLat[1]),decnz:Number('0.'+partsLat[1])}, {prefix:'E',value:longitude,dec:Number(partsLon[0]),decnz:Number('0.'+partsLon[1])}];
		},

		// returns WGS lat/long (� dec) to CH x and y
		WGStoCH : function (lat, lng)
		{
			var swissx = SwissGrid.WGStoCHx(lat, lng);
			var swissy = SwissGrid.WGStoCHy(lat, lng);
			return [swissx, swissy];
		},

		CHtoWGS : function (y, x)
		{
			var latitude = SwissGrid.CHtoWGSlat(y, x);
			var longitude = SwissGrid.CHtoWGSlng(y, x);
			return [latitude, longitude];
		},

        //------------------------------------------------------------------------------------------------

		ObjDecToDeg : function(decObj){
			var deg = this.DecToDeg(decObj[0].value, decObj[1].value);
            var partsLatMin= String(deg[0][1]).split(".");
            var partsLonMin= String(deg[1][1]).split(".");
			return [{prefix:decObj[0].prefix,grad:deg[0][0],minutes:deg[0][1],mindec:Number(partsLatMin[0]),mindecn:Number(partsLatMin[1]),mindecnz:Number('0.'+partsLatMin[1])}, {prefix:decObj[1].prefix,grad:deg[1][0],minutes:deg[1][1],mindec:Number(partsLonMin[0]),mindecn:Number(partsLonMin[1]),mindecnz:Number('0.'+partsLonMin[1])}];
		},

		ObjDecToDms : function(decObj){
			var dms = this.DecToDms(decObj[0].value,decObj[1].value);
            var partsLatSec = String(dms[0][2]).split(".");
            var partsLonSec = String(dms[1][2]).split(".");
			return [{prefix:decObj[0].prefix,grad:dms[0][0],minutes:dms[0][1],seconds:dms[0][2],secdec:Number(partsLatSec[0]),secdecn:Number(partsLatSec[1]),secdecnz:Number('0.'+partsLatSec[1])}, {prefix:decObj[1].prefix,grad:dms[1][0],minutes:dms[1][1],seconds:dms[1][2],secdec:Number(partsLonSec[0]),secdecn:Number(partsLonSec[1]),secdecnz:Number('0.'+partsLonSec[1])}];
		},

		ObjDegToDms : function(degObj){
			var latMinNC = degObj[0].minutes.toString().split(".");
			var lngMinNC = degObj[1].minutes.toString().split(".");
			var latitudeSec = Math.round(parseFloat('0.'+latMinNC[1]) * 60.0);
			var longitudeSec = Math.round(parseFloat('0.'+lngMinNC[1]) * 60.0);
			return [{prefix:degObj[0].prefix,grad:degObj[0].grad,minutes:latMinNC[0],seconds:latitudeSec}, {prefix:degObj[1].prefix,grad:degObj[1].grad,minutes:lngMinNC[0],seconds:longitudeSec}];
		},

		ObjSwissToDec : function(y, x)	{
			var latitude = SwissGrid.CHtoWGSlat(y, x);
			var longitude = SwissGrid.CHtoWGSlng(y, x);
			return [{prefix:'N',value:latitude}, {prefix:'E',value:longitude}];
		},

		ObjDegToDec : function(degObj)	{
			var dec = this.DegToDec([degObj[0].grad, degObj[0].minutes], [degObj[1].grad, degObj[1].minutes]);
			return [{prefix:degObj[0].prefix,value:dec[0]}, {prefix:degObj[1].prefix,value:dec[1]}];
		},

        //------------------------------------------------------------------------------------------------

		// Convert WGS lat/long (� dec) to DMS DD� MM� SS�
		// out = [0=grad][1=minutes][2=seconds] for lat and lng
		DecToDms : function (lat, lng)	{
			var deg = this.DecToDeg(lat, lng);
			var latP = deg[0];
			var lngP = deg[1];
			var latMinNC = deg[0][1].toString().split(".");
			var lngMinNC = deg[1][1].toString().split(".");
			var latitudeSec = parseFloat('0.'+latMinNC[1]) * 60.0;
			var longitudeSec = parseFloat('0.'+lngMinNC[1]) * 60.0;

			return [[parseInt(deg[0][0]),parseInt(latMinNC[0]), latitudeSec],[parseInt(deg[1][0]),parseInt(lngMinNC[0]), longitudeSec]];
		},

		// Convert WGS lat/long (� dec) to Deg DD� MM.MMM
		// out = [0=grad][1=decimalminutes] for lat and lng
		DecToDeg : function (lat, lng)
		{
			var latP = lat.toString().split(".");
			var lngP = lng.toString().split(".");
			var latitudeMinutes = parseFloat('0.'+latP[1]) * 60.0;
			var longitudeMinutes = parseFloat('0.'+lngP[1]) * 60.0;
			return [[parseInt(latP[0]), latitudeMinutes], [parseInt(lngP[0]), longitudeMinutes]];
		},

		// Convert WGS lat/long (� MM.MMM deg) to � dec
		// input = [0=grad][1=decimalminutes] for lat and lng
		DegToDec : function (lat, lng)
		{
			var latitude = lat[0] + (lat[1] / 60.0);
			var longitude = lng[0] + (lng[1] / 60.0);
			return [latitude, longitude];
		}
};

