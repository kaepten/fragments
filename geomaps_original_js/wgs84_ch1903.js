// 3.3.5
function SwissGrid(y,x){
	  this._y = y;
	  this._x = x;
};

SwissGrid.prototype.Y = function () {return this._y};
SwissGrid.prototype.X = function () {return this._x};

SwissGrid.prototype.toFormat = function (format, dp){
	if (typeof dp == 'undefined') {
	    switch (format) {
		    case 'd': dp = 2; break; // just numbers
		    case 'f': dp = 0; break; // formated, without dp	    
		    default: format = 'd'; dp = 2;  // be forgiving on invalid format       
	    }
	}	
	
	switch (format) {
	    case 'd': // just numbers	    	
	    	return this._y.toFixed(dp) + ' ' + this._x.toFixed(dp); 
	    	break; 
	    case 'f': // formated
	    	var y = this._y.toFixed(0).toString().substr(0,3) + ' ' + this._y.toFixed(0).toString().substr(3,3) + (dp==0 ? '' : '.') + this._y.toFixed(dp).toString().substr(7,dp);
	    	var x = this._x.toFixed(0).toString().substr(0,3) + ' ' + this._x.toFixed(0).toString().substr(3,3) + (dp==0 ? '' : '.') + this._x.toFixed(dp).toString().substr(7,dp);
	    	return y + ' / ' + x; 
	    	break;	    
	    default:  	     
	    	return this._y.toFixed(dp); + ' ' + this._x.toFixed(dp);
	}
}

SwissGrid.WGStoCH = function(lat, lng){		
	return new SwissGrid(this.WGStoCHy(lat, lng),this.WGStoCHx(lat, lng));
}

// Convert WGS lat/long (° dec) to CH y
SwissGrid.WGStoCHy = function (lat, lng) {

  // Converts degrees dec to sex
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);

  // Converts degrees to seconds (sex)
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);
  
  // Axiliary values (% Bern)
  var lat_aux = (lat - 169028.66)/10000;
  var lng_aux = (lng - 26782.5)/10000;
  
  // Process Y
  y = 600072.37 
     + 211455.93 * lng_aux 
     -  10938.51 * lng_aux * lat_aux
     -      0.36 * lng_aux * Math.pow(lat_aux,2)
     -     44.54 * Math.pow(lng_aux,3);
     
  return y;
};

// Convert WGS lat/long (° dec) to CH x
SwissGrid.WGStoCHx = function (lat, lng) {
  		
  // Converts degrees dec to sex
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);  
  
  // Converts degrees to seconds (sex)
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);  
  
  // Axiliary values (% Bern)
  var lat_aux = (lat - 169028.66)/10000;
  var lng_aux = (lng - 26782.5)/10000;

  // Process X
  x = 200147.07
     + 308807.95 * lat_aux 
     +   3745.25 * Math.pow(lng_aux,2)
     +     76.63 * Math.pow(lat_aux,2)
     -    194.56 * Math.pow(lng_aux,2) * lat_aux
     +    119.79 * Math.pow(lat_aux,3);
 
  return x;
  
};


// Convert CH y/x to WGS lat
SwissGrid.CHtoWGSlat = function (y, x) {

  // Converts militar to civil and  to unit = 1000km
  // Axiliary values (% Bern)
  var y_aux = (y - 600000)/1000000;
  var x_aux = (x - 200000)/1000000;
  
  // Process lat
  lat = 16.9023892
       +  3.238272 * x_aux
       -  0.270978 * Math.pow(y_aux,2)
       -  0.002528 * Math.pow(x_aux,2)
       -  0.0447   * Math.pow(y_aux,2) * x_aux
       -  0.0140   * Math.pow(x_aux,3);
    
  // Unit 10000" to 1 " and converts seconds to degrees (dec)
  lat = lat * 100/36;
  
  return lat;
  
};

// Convert CH y/x to WGS long
SwissGrid.CHtoWGSlng= function (y, x) {

  // Converts militar to civil and  to unit = 1000km
  // Axiliary values (% Bern)
  var y_aux = (y - 600000)/1000000;
  var x_aux = (x - 200000)/1000000;
  
  // Process long
  lng = 2.6779094
        + 4.728982 * y_aux
        + 0.791484 * y_aux * x_aux
        + 0.1306   * y_aux * Math.pow(x_aux,2)
        - 0.0436   * Math.pow(y_aux,3);
     
  // Unit 10000" to 1 " and converts seconds to degrees (dec)
  lng = lng * 100/36;
     
  return lng;
  
};


// Convert SEX DMS angle to DEC
function SEXtoDEC(angle) {

  // Extract DMS
  var deg = parseInt( angle );
  var min = parseInt( (angle-deg)*100 );
  var sec = (((angle-deg)*100) - min) * 100;
  
  // Result in degrees sex (dd.mmss)
  return deg + (sec/60 + min)/60;
  
}

// Convert DEC angle to SEX DMS
function DECtoSEX(angle) {

  // Extract DMS
  var deg = parseInt( angle );
  var min = parseInt( (angle-deg)*60 );
  var sec =  (((angle-deg)*60)-min)*60;   

  // Result in degrees sex (dd.mmss)
  return deg + min/100 + sec/10000;
  
}

// Convert Degrees angle to seconds
function DEGtoSEC(angle) {

  // Extract DMS
  var deg = parseInt( angle );    
   var parts = String(angle).split(".");   
  
  var min = parseInt( (angle-deg)*100 );
  var sec = (((angle-deg)*100) - min) * 100; 
  
  // Null problem, wenn keine Dezimalminuten vorhanden sind
  if(parts.length == 2 && parts[1].length == 2)
   {
	min = Number(parts[1]);
	sec = 0;
   } 
  
  var result = sec + min*60 +deg*3600;
  //GM_log("angle:"+angle+" deg:"+deg+" min:"+min+" sec:"+sec+" result:"+result);
  return result;  

}

function runde(x, n) {
	  if (n < 1 || n > 14) return false;
	  var e = Math.pow(10, n);
	  var k = (Math.round(x * e) / e).toString();
	  if (k.indexOf('.') == -1) k += '.';
	  k += e.toString().substring(1);
	  return k.substring(0, k.indexOf('.') + n+1);
	}