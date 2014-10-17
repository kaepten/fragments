function DeleteGeoMapsSettings(){
    localStorage.removeItem("GeoMaps");
    globalCoordinateUiIdList = [0];
    InitUI();
}

function AddNewCoordinateObject(newCoordinates, settingObject) {
// neue abfüllen und lineTo generieren
    for (var newCoordIdx = 0; newCoordIdx < newCoordinates.length; newCoordIdx++) {
        var siteCoord = newCoordinates[newCoordIdx];
        settingObject.siteSetting.coordSettings.push(siteCoord);
        for (var innerNewCoordIdx = 0; innerNewCoordIdx < settingObject.siteSetting.coordSettings.length; innerNewCoordIdx++) {
            if (siteCoord.id == settingObject.siteSetting.coordSettings[innerNewCoordIdx].id) {
                for (var iInnerNewCoordIdx = 0; iInnerNewCoordIdx < settingObject.siteSetting.coordSettings.length; iInnerNewCoordIdx++) {
                    siteCoord.showLineTo.push({
                        coordId: settingObject.siteSetting.coordSettings[iInnerNewCoordIdx].id,
                        isShown: false
                    });
                }
            } else {
                settingObject.siteSetting.coordSettings[innerNewCoordIdx].showLineTo.push({
                    coordId: siteCoord.id,
                    isShown: false
                });
            }
        }
    }
}
function LoadGeoMapsSiteSettings(url, pageParsedCoordinates) {
    globalCoordinateUiIdList = [0];
    var settingObject;
    var settingsText = localStorage["GeoMaps"];
    if(settingsText != undefined) {
        settingObject = JSON.parse(settingsText);
        if(settingObject != undefined) {

            // siteSetting setzen anhand aktueller site (url)
            for (var index = 0; index < settingObject.siteSettings.length; index++) {
                if (settingObject.siteSettings[index].url == url) {
                    settingObject.siteSetting = settingObject.siteSettings[index];

                    //uiId aktualisieren
                    for(var indx= 0; indx<settingObject.siteSetting.coordSettings.length; indx++) {
                        GetUiId(indx+1);
                        settingObject.siteSetting.coordSettings[indx].uiId = indx+1;
                    }
                    SettingSite.SetCoordinateObjects(settingObject.siteSetting);
                }
            }

            // schnittmenge bilden von Seite zu gespeicherten
            var newCoordinates = [];
            for(var pageParsedCoordinateIndex=0; pageParsedCoordinateIndex<pageParsedCoordinates.length; pageParsedCoordinateIndex++) {
                var parsedOrigin = pageParsedCoordinates[pageParsedCoordinateIndex].OriginCoordinateString;
                var notFound = true;
                for(var settingsCoordIndex=0; settingsCoordIndex<settingObject.siteSetting.coordSettings.length; settingsCoordIndex++){
                    var setOrigin = settingObject.siteSetting.coordSettings[settingsCoordIndex].coordinate.OriginCoordinateString;
                    if(parsedOrigin == setOrigin) {
                        notFound = false; break; } // coordinate vorhanden
                    else {
                        notFound = true;
                    }
                }
                if(notFound) {
                    var newGUID = getGUID();
                    var uiId = GetUiId();
                    var newSiteCoord = new SettingCoord(parsedOrigin, newGUID, uiId);
                    newCoordinates.push(newSiteCoord);
                }
            }

            AddNewCoordinateObject(newCoordinates, settingObject);

            // checken, ob in den Settings nicht Favs sind, die auf der Seite nicht mehr existieren
            var checkedCoordinates = [];
            var found = false;
            for (var favCoordIndex = 0; favCoordIndex < settingObject.siteSetting.coordSettings.length; favCoordIndex++) {
                for(var innerFavCoordIndex=0; innerFavCoordIndex<pageParsedCoordinates.length; innerFavCoordIndex++) {
                    if(pageParsedCoordinates[innerFavCoordIndex].OriginCoordinateString == settingObject.siteSetting.coordSettings[favCoordIndex].coordinate.OriginCoordinateString) {
                        found = true;
                        break;
                    } else {
                        found = false;
                    }
                }
                if(found || settingObject.siteSetting.coordSettings[favCoordIndex].isSiteFavorite) {
                    checkedCoordinates.push(settingObject.siteSetting.coordSettings[favCoordIndex]);
                }
            }
            settingObject.siteSetting.coordSettings = checkedCoordinates;
            SaveGeoMapsSettings(settingObject);
            return settingObject; // abbruch des for loops
        }
    } else {
        settingObject = new SettingCalculator();
        settingObject.siteSetting = CreateSiteSetting(url, pageParsedCoordinates);
        settingObject.siteSettings.push(settingObject.siteSetting);
        SaveGeoMapsSettings(settingObject);
        SettingSite.SetCoordinateObjects(settingObject.siteSetting);
        return settingObject;
    }
}

function CreateSiteSetting(siteUrl, siteCoords) {
    var siteSetting = new SettingSite();
    siteSetting.url = siteUrl;
    for (var i = 0; i < siteCoords.length; i++) {
        var newGUID = getGUID();
        var uiId = GetUiId();
        var siteCoord = new SettingCoord(siteCoords[i].OriginCoordinateString, newGUID, uiId);
        siteSetting.coordSettings.push(siteCoord);
    }
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        var coord = siteSetting.coordSettings[i];
        for (var iL = 0; iL < siteSetting.coordSettings.length; iL++) {
            var cuurentCoordId = siteSetting.coordSettings[iL].id;
            coord.showLineTo.push({coordId:cuurentCoordId,isShown:false});
        }
    }
    return siteSetting;
}


// var clonedSiteSetting = jQuery.extend(true, {}, settingCalculatorObject.siteSetting);
// settingCalculatorObject.siteSetting = clonedSiteSetting;


function SaveGeoMapsSettings(settingCalculatorObject){

    var siteUrl = settingCalculatorObject.siteSetting.url;
    SettingSite.ClearNotSaveables(settingCalculatorObject.siteSetting);
    settingCalculatorObject.siteSetting = undefined;
    localStorage["GeoMaps"] = JSON.stringify(settingCalculatorObject);

    for(var index=0; index<settingCalculatorObject.siteSettings.length; index++) {
        if(settingCalculatorObject.siteSettings[index].url == siteUrl) {
            SettingSite.SetCoordinateObjects(settingCalculatorObject.siteSettings[index]);
            settingCalculatorObject.siteSetting = settingCalculatorObject.siteSettings[index];
            break;
        }
    }
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

function SettingSite() {
    this.url = '';
    this.coordinateFormatType = CoordinateFormat.Dmm;
    this.coordSettings = [];
}

SettingSite.SetProjectionShowLineToFlag = function(setting, coordId, projectionCoordId, flag) {
    var tmpCoord = SettingSite.GetSettingCoord(setting, coordId);
    for(var index=0; index<tmpCoord.showLineTo.length; index++) {
        if (tmpCoord.showLineTo[index].coordId == projectionCoordId) {
            tmpCoord.showLineTo[index].isShown = flag;
        }
    }
    var tmpCoordProj = SettingSite.GetSettingCoord(setting, projectionCoordId);
    for(var index=0; index<tmpCoordProj.showLineTo.length; index++) {
        if (tmpCoordProj.showLineTo[index].coordId == coordId) {
            tmpCoordProj.showLineTo[index].isShown = flag;
        }
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.SetProjectionShowLineTo = function(setting, coordId, projectionCoordId) {
    var tmpCoord = SettingSite.GetSettingCoord(setting, coordId);
    for(var index=0; index<tmpCoord.showLineTo.length; index++) {
        if (tmpCoord.showLineTo[index].coordId == projectionCoordId) {
            tmpCoord.showLineTo[index].isShown = !tmpCoord.showLineTo[index].isShown;
        }
    }
    var tmpCoordProj = SettingSite.GetSettingCoord(setting, projectionCoordId);
    for(var index=0; index<tmpCoordProj.showLineTo.length; index++) {
        if (tmpCoordProj.showLineTo[index].coordId == coordId) {
            tmpCoordProj.showLineTo[index].isShown = !tmpCoordProj.showLineTo[index].isShown;
        }
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.ClearNotSaveables = function(siteSetting) {
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        siteSetting.coordSettings[i].coordinate = undefined;
        /*
        siteSetting.coordSettings[i].id = undefined;
        for(var ii=0; ii<siteSetting.coordSettings[i].showLineTo.length; ii++) {
            siteSetting.coordSettings[i].showLineTo[ii].coordId = undefined;
        }
        */
    }
}

SettingSite.DeleteCoord = function(setting, id) {
    "use strict";
    var deletableIndex = -1;
    for(var i=0; i<setting.siteSetting.coordSettings.length; i++) {
        if(id == setting.siteSetting.coordSettings[i].id) {
            deletableIndex = i;
        }
    }
    if(deletableIndex > -1) {
        setting.siteSetting.coordSettings.splice(deletableIndex,1);
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.ClearAllLineTo = function(setting) {
    for(var i=0; i<setting.siteSetting.coordSettings.length; i++) {
        for(var ii=0; ii<setting.siteSetting.coordSettings[i].showLineTo.length; ii++) {
            setting.siteSetting.coordSettings[i].showLineTo[ii].isShown = false;
        }
    }
    SaveGeoMapsSettings(setting);
}


SettingSite.SetCoordinateObjects = function(siteSetting) {
    for(var i=0; i<siteSetting.coordSettings.length; i++) {
        if (siteSetting.coordSettings[i].coordinate == undefined || siteSetting.coordSettings[i].coordinate == '') {
            siteSetting.coordSettings[i].coordinate = new Coordinate(siteSetting.coordSettings[i].pointOrigin);
        }
    }
}

SettingSite.GetSettingCoord = function(setting, id) {
    "use strict";
    for(var i=0; i<setting.siteSetting.coordSettings.length; i++) {
        if(setting.siteSetting.coordSettings[i].id == id) {
            return setting.siteSetting.coordSettings[i];
        }
    }
}

SettingSite.SetSettingCoord = function(setting, id, coordinate, description) {
    "use strict";
    for(var i=0; i<setting.siteSetting.coordSettings.length; i++) {
        if(setting.siteSetting.coordSettings[i].id == id) {
            setting.siteSetting.coordSettings[i].coordinate = coordinate;
            setting.siteSetting.coordSettings[i].pointOrigin = coordinate.OriginCoordinateString;
            setting.siteSetting.coordSettings[i].description = description;
            break;
        }
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.SetExpandet = function(setting, id, isExpandet){
    var coord = SettingSite.GetSettingCoord(setting, id);
    coord.isExpandet = isExpandet;
    SaveGeoMapsSettings(setting);
}

SettingSite.SetFavorite = function(setting, id, isSiteFavorite){
    var coord = SettingSite.GetSettingCoord(setting, id);
    coord.isSiteFavorite = isSiteFavorite;
    SaveGeoMapsSettings(setting);
}

SettingSite.SetCoordFormat = function(setting, format){
    setting.siteSetting.coordinateFormatType = GetCoordinateFormatObject(format);
    SaveGeoMapsSettings(setting);
}

var globalCoordinateUiIdList = [0];
function GetUiId(currentId) {
    "use strict";
    var id = -1;
    if(currentId != undefined) {
        id = currentId;
    } else {
        id = ++globalCoordinateUiIdList[globalCoordinateUiIdList.length - 1];
    }
    globalCoordinateUiIdList.push(id);
    return id;
}


function SettingCoord(origin, id, uiId) {
    this.uiId = uiId;
    this.id = id;
    this.pointOrigin=origin; // redundant, weil coordinate objekt NICHT gespeichert wird!
    this.description= "";
    this.isSiteFavorite=false;
    this.isExpandet=false;
    this.showLineTo=[]; // coordId isShown
    this.coordinate= new Coordinate(origin);
}
