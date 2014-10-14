function DeleteGeoMapsSettings(){
    localStorage.removeItem("GeoMaps");
    InitUI();
}

function LoadGeoMapsSiteSettings(url, siteCoords) {
    var settingObject;
    var settingsText = localStorage["GeoMaps"];
    if(settingsText != undefined) {
        settingObject = JSON.parse(settingsText);
        if(settingObject != undefined) {
            for (var index = 0; index < settingObject.siteSettings.length; index++) {
                if (settingObject.siteSettings[index].url == url) {
                    settingObject.siteSetting = settingObject.siteSettings[index];
                    SettingSite.SetCoordinateObjects(settingObject.siteSetting);
                    // schnittmenge bilden von Seite zu gespeicherten
                    var tempList = [];
                    var newIndex = 0;
                    if(settingObject.siteSetting.coordSettings != undefined && settingObject.siteSetting.coordSettings != '') {
                        newIndex = settingObject.siteSetting.coordSettings.length; // ans Ende hinzufügen bei vorhandenen
                    }
                    for(var index=0; index<siteCoords.length; index++) {
                        var origin = siteCoords[index].OriginCoordinateString; // Coordinate Objekte
                        var notFound = true;
                        for(var setIndex=0; setIndex<settingObject.siteSetting.coordSettings.length; setIndex++){
                            var setOrigin = settingObject.siteSetting.coordSettings[setIndex].coordinate.OriginCoordinateString;
                            if(origin == setOrigin) {
                                notFound = false; break; } // coordinate vorhanden
                            else {
                                notFound = true;
                            }
                        }
                        if(notFound) {
                            // var siteCoord = new SettingCoord(siteCoords[index].OriginCoordinateString, "ID : " + newIndex++);
                            var newGUID = getGUID();
                            var siteCoord = new SettingCoord(siteCoords[index].OriginCoordinateString, "ID : " + newGUID, newGUID);
                            tempList.push(siteCoord);
                        }
                    }
                    // neue abfüllen und lineTo generieren
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

                    // checken, ob in den Settings nicht Favs sind, die auf der Seite nicht mehr existieren
                    var checkedCoordinates = [];
                    var found = false;
                    for (var coordIndex = 0; coordIndex < settingObject.siteSetting.coordSettings.length; coordIndex++) {
                        for(var index=0; index<siteCoords.length; index++) {
                            if(siteCoords[index].OriginCoordinateString == settingObject.siteSetting.coordSettings[coordIndex].coordinate.OriginCoordinateString) {
                                found = true;
                                break;
                            } else {
                                found = false;
                            }
                        }
                        if(found || settingObject.siteSetting.coordSettings[coordIndex].isSiteFavorite) {
                            checkedCoordinates.push(settingObject.siteSetting.coordSettings[coordIndex]);
                        }
                    }
                    settingObject.siteSetting.coordSettings = checkedCoordinates;

                    SaveGeoMapsSettings(settingObject);
                    SettingSite.SetCoordinateObjects(settingObject.siteSetting); // update nochmals der neu hinzugefügten!
                    return settingObject; // abbruch des for loops
                }
            }
        }
    }
    settingObject = new SettingCalculator();
    settingObject.siteSetting = CreateSiteSetting(url, siteCoords);
    settingObject.siteSettings.push(settingObject.siteSetting);
    SaveGeoMapsSettings(settingObject);
    SettingSite.SetCoordinateObjects(settingObject.siteSetting);
    return settingObject;
}

function CreateSiteSetting(siteUrl, siteCoords) {
    var siteSetting = new SettingSite();
    siteSetting.url = siteUrl;
    for (var i = 0; i < siteCoords.length; i++) {
        var newGUID = getGUID();
        var siteCoord = new SettingCoord(siteCoords[i].OriginCoordinateString, "ID : " + newGUID, newGUID);
        for (var iL = 0; iL < siteCoords.length; iL++) {
            siteCoord.showLineTo.push({coordId:iL,isShown:false});
        }
        siteSetting.coordSettings.push(siteCoord);
    }
    return siteSetting;
}

function SaveGeoMapsSettings(settingCalculatorObject){
    var backupSiteSetting = jQuery.extend(true, {}, settingCalculatorObject.siteSetting);
    var saveableSiteSetting = SettingSite.ClearCoordinateObjects(settingCalculatorObject.siteSetting); // das muss nicht persistiert werden.
    for(var index=0; index<settingCalculatorObject.siteSettings.length; index++) {
        if(settingCalculatorObject.siteSettings[index].url == settingCalculatorObject.siteSetting.url) {
            settingCalculatorObject.siteSettings[index].coordSettings = saveableSiteSetting;
        }
    }
    settingCalculatorObject.siteSetting = undefined; // das muss nicht persistiert werden
    var myJSONText = JSON.stringify(settingCalculatorObject);
    localStorage["GeoMaps"] = myJSONText;

    settingCalculatorObject.siteSetting = backupSiteSetting;
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
    this.coordinateFormatType = CoordinateFormat.Dmm;
    this.coordSettings = [];
}
SettingSite.ClearCoordinateObjects = function(siteSetting) {
    var favorites = [];
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        if(siteSetting.coordSettings[i].isSiteFavorite || true) {
            siteSetting.coordSettings[i].coordinate = undefined;
            favorites.push(siteSetting.coordSettings[i]);
        }
    }
    return favorites;
}
SettingSite.SetCoordinateObjects = function(siteSetting) {
    for(var i=0; i<siteSetting.coordSettings.length; i++) {
        if (siteSetting.coordSettings[i].coordinate == undefined || siteSetting.coordSettings[i].coordinate == '') {
            siteSetting.coordSettings[i].coordinate = new Coordinate(siteSetting.coordSettings[i].pointOrigin);
        }
    }
}

function SettingCoord(origin, description, id) {
    this.id = id;
    this.pointOrigin=origin; // redundant, weil coordinate objekt NICHT gespeichert wird!
    this.description=description;
    this.isSiteFavorite=false;
    this.isExpandet=false;
    this.showLineTo=[]; // coordId isShown
    this.coordinate= new Coordinate(origin);
}
