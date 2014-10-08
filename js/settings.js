function DeleteGeoMapsSettings(){
    localStorage.removeItem("GeoMaps");
    InitUI();
}

function LoadGeoMapsSiteSettings(url, siteCoords) {
    var settingObject;
    var settingsText = localStorage["GeoMaps"];
    if(settingsText != undefined) {
        settingObject = JSON.parse(settingsText);
        SettingSite.SetCoordinateObjects(settingObject);
        if(settingObject != undefined) {
            for (var index = 0; index < settingObject.siteSettings.length; index++) {
                if (settingObject.siteSettings[index].url == url) {
                    settingObject.siteSetting = settingObject.siteSettings[index];
                    // schnittmenge bilden von Seite zu gespeicherten
                    var tempList = [];
                    var newIndex = settingObject.siteSetting.coordSettings.length;
                    for(var index=0; index<siteCoords.length; index++) {
                        var origin = siteCoords[index].OriginCoordinateString;
                        var notFound = true;
                        for(var setIndex=0; setIndex<settingObject.siteSetting.coordSettings.length; setIndex++){
                            var setOrigin = settingObject.siteSetting.coordSettings[setIndex].coordinate.OriginCoordinateString;
                            if(origin == setOrigin) {
                                notFound = false; break; } // coordinate vorhanden
                        }
                        if(notFound) {
                            var siteCoord = new SettingCoord(siteCoords[index].OriginCoordinateString, "ID : " + newIndex++);
                            tempList.push(siteCoord);
                        }
                    }
                    for(var i=0; i<tempList.length;i++) {
                        var siteCoord = tempList[i];
                        settingObject.siteSetting.coordSettings.push(siteCoord);
                        var aktuellerIndex = settingObject.siteSetting.coordSettings.length-1;
                        for (var coordIndex = 0; coordIndex < settingObject.siteSetting.coordSettings.length; coordIndex++) {
                            if(coordIndex<aktuellerIndex) {
                                settingObject.siteSetting.coordSettings[coordIndex].showLineTo.push({
                                    coordId: aktuellerIndex,
                                    isShown: false
                                });
                            } else {
                                for (var iL = 0; iL < siteCoords.length; iL++) {
                                    settingObject.siteSetting.coordSettings[coordIndex].showLineTo.push({
                                        coordId:iL,
                                        isShown:false
                                    });
                                }
                            }
                        }
                    }
                    SaveGeoMapsSettings(settingObject);
                    SettingSite.SetCoordinateObjects(settingObject);
                    return settingObject; // abbruch des for loops
                }
            }
        }
    }
    settingObject = new SettingCalculator();
    settingObject.siteSetting = CreateSiteSetting(url, siteCoords);
    settingObject.siteSettings.push(settingObject.siteSetting);
    SettingSite.SetCoordinateObjects(settingObject);
    return settingObject;
}

function CreateSiteSetting(siteUrl, siteCoords) {
    var siteSetting = new SettingSite();
    siteSetting.url = siteUrl;
    for (var i = 0; i < siteCoords.length; i++) {
        var siteCoord = new SettingCoord(siteCoords[i].OriginCoordinateString, "ID : " + i);
        for (var iL = 0; iL < siteCoords.length; iL++) {
            siteCoord.showLineTo.push({coordId:iL,isShown:false});
        }
        siteSetting.coordSettings.push(siteCoord);
    }
    return siteSetting;
}

function SaveGeoMapsSettings(settingCalculatorObject){
    var tmpSiteSetting = settingCalculatorObject.siteSetting;
    SettingSite.ClearCoordinateObjects(tmpSiteSetting); // das muss nicht persistiert werden.
    settingCalculatorObject.siteSetting = undefined; // das muss nicht persistiert werden
    var myJSONText = JSON.stringify(settingCalculatorObject);
    localStorage["GeoMaps"] = myJSONText;
    settingCalculatorObject.siteSetting = tmpSiteSetting;
}

function SettingCalculator() {
    this.userName = '';
    this.siteSettings = new Array();
    this.siteSetting = undefined;
    this.settingsExists = false;
}

SettingCalculator.Set = function(obj, propertyName, propertyValue, coordId) {
    if(coordId == undefined) {
        obj.siteSetting[propertyName] = propertyValue;
    } else {
        obj.siteSetting.coordSettings[coordId][propertyName] = propertyValue;
    }
    SaveGeoMapsSettings(obj);
}

SettingCalculator.SetProjectionShowLineTo = function(obj, coordId, showLineToCoordId) {
    for(var index=0; index<obj.siteSetting.coordSettings[coordId].showLineTo.length; index++) {
        if (obj.siteSetting.coordSettings[coordId].showLineTo[index].coordId == showLineToCoordId) {
            obj.siteSetting.coordSettings[coordId].showLineTo[index].isShown = !obj.siteSetting.coordSettings[coordId].showLineTo[index].isShown;
        }
    }
    for(var index=0; index<obj.siteSetting.coordSettings[showLineToCoordId].showLineTo.length; index++) {
        if (obj.siteSetting.coordSettings[showLineToCoordId].showLineTo[index].coordId == coordId) {
            obj.siteSetting.coordSettings[showLineToCoordId].showLineTo[index].isShown = !obj.siteSetting.coordSettings[showLineToCoordId].showLineTo[index].isShown;
        }
    }
    SaveGeoMapsSettings(obj);
}

function SettingSite() {
    this.url = '';
    this.coordinateFormatType = CoordinateFormat.Ddd;
    this.coordSettings = [];
}

SettingSite.ClearCoordinateObjects = function(coordSettings) {
    for (var i = 0; i < coordSettings.length; i++) {
        coordSettings[i].coordinate = undefined;
    }
}

SettingSite.SetCoordinateObjects = function(coordSettings) {
    for(var i=0; i<coordSettings.siteSettings.length; i++) {
        for (var ii = 0; ii < coordSettings.siteSettings[i].coordSettings.length; ii++) {
            if (coordSettings.siteSettings[i].coordSettings[ii].coordinate == undefined || coordSettings.siteSettings[i].coordSettings[ii].coordinate == '') {
                coordSettings.siteSettings[i].coordSettings[ii].coordinate = new Coordinate(coordSettings.siteSettings[i].coordSettings[ii].pointOrigin);
            }
        }
    }
}


function SettingCoord(origin, description) {
    this.pointOrigin=origin; // redundant, weil coordinate objekt NICHT gespeichert wird!
    this.description=description;
    this.isSiteFavorite=false;
    this.isExpandet=false;
    this.showLineTo=[]; // coordId isShown
    this.coordinate= new Coordinate(origin);
}
