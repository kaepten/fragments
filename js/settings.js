var _globalCoordinateUiIdList = [0];

function GetUiId(currentId) {
    "use strict";
    var id = -1;
    if (currentId != undefined) {
        id = currentId;
    } else {
        id = ++_globalCoordinateUiIdList[_globalCoordinateUiIdList.length - 1];
    }
    _globalCoordinateUiIdList.push(id);
    return id;
}

function RestoreNotSaveables(settingCalculatorObject, url) {
    for (var index = 0; index < settingCalculatorObject.siteSettings.length; index++) {
        if (settingCalculatorObject.siteSettings[index].url == url) {
            SettingSite.SetCoordinateObjects(settingCalculatorObject.siteSettings[index]); // zuvor bereinigte Coord-Objekte wieder herstellen
            settingCalculatorObject.siteSetting = settingCalculatorObject.siteSettings[index]; // direkt Zugriff siteSetting erneut setzen
            break;
        }
    }
}

function ClearNotSaveables(siteSetting) {
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        siteSetting.coordSettings[i].coordinate = undefined; // Coord objekte aus Platzgründen nicht speichern
    }
}

function SaveGeoMapsSettings(settingCalculatorObject) {
    ClearNotSaveables(settingCalculatorObject.siteSetting);
    settingCalculatorObject.siteSetting = undefined;
    localStorage["GeoMaps"] = JSON.stringify(settingCalculatorObject);
    RestoreNotSaveables(settingCalculatorObject, document.URL);
}

function DeleteGeoMapsSettings() {
    localStorage.removeItem("GeoMaps");
    _globalCoordinateUiIdList = [0];
    InitUI();
}

function AddNewCoordinateObject(newCoordinates, settingObject) {
    for (var newCoordIdx = 0; newCoordIdx < newCoordinates.length; newCoordIdx++) { // neue abfüllen und lineTo generieren
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

function LoadGeoMapsSiteSettings(url, parsedPageCoords) {
    _globalCoordinateUiIdList = [0];
    var settingObject;
    var settingsText = localStorage["GeoMaps"];
    try {
        if (settingsText != undefined) {
            settingObject = JSON.parse(settingsText);
            // if (settingObject != undefined && settingObject.siteSetting != undefined) {
            if (settingObject != undefined) {
                SetCurrentSettingSite(settingObject, url);
                AddNewCoordinateObject(FindNewCoordinates(settingObject, parsedPageCoords), settingObject); // Neue Seiten-Koordinaten, die nich in den Settings waren hinzufügen
                CleanOldCoordinates(settingObject, parsedPageCoords); // checken, ob in den Settings nicht Favs sind, die auf der Seite nicht mehr existieren
                SaveGeoMapsSettings(settingObject);
                return settingObject;
            }
            else {
                return CreateInitialSetting(url, parsedPageCoords);
            }
        }
    }
    catch(err) { // Abfangen und dann CreateInitial machen
    }
    return CreateInitialSetting(url, parsedPageCoords);
}

function SetCurrentSettingSite(setting, url) {
    for (var index = 0; index < setting.siteSettings.length; index++) { // siteSetting setzen anhand aktueller site (url)
        if (setting.siteSettings[index].url == url) {
            setting.siteSetting = setting.siteSettings[index];
            for (var indx = 0; indx < setting.siteSetting.coordSettings.length; indx++) { // uiId setzen
                setting.siteSetting.coordSettings[indx].uiId = GetUiId(indx + 1);
            }
            SettingSite.SetCoordinateObjects(setting.siteSetting);
        }
    }
}

function CleanOldCoordinates(setting, parsedPageCoords){
    var checkedCoordinates = [];
    var found = false;
    for (var favCoordIndex = 0; favCoordIndex < setting.siteSetting.coordSettings.length; favCoordIndex++) {
        for (var innerFavCoordIndex = 0; innerFavCoordIndex < parsedPageCoords.length; innerFavCoordIndex++) {
            if (parsedPageCoords[innerFavCoordIndex].OriginCoordinateString == setting.siteSetting.coordSettings[favCoordIndex].coordinate.OriginCoordinateString) {
                found = true; break;
            } else {
                found = false;
            }
        }
        if (found || setting.siteSetting.coordSettings[favCoordIndex].isSiteFavorite) {
            checkedCoordinates.push(setting.siteSetting.coordSettings[favCoordIndex]);
        }
    }
    setting.siteSetting.coordSettings = checkedCoordinates;
}

function FindNewCoordinates(setting, parsedPageCoords) {
    var newCoordinates = [];
    for (var pageParsedCoordinateIndex = 0; pageParsedCoordinateIndex < parsedPageCoords.length; pageParsedCoordinateIndex++) {
        var parsedOrigin = parsedPageCoords[pageParsedCoordinateIndex].OriginCoordinateString;
        var notFound = true;
        if(setting.siteSetting != undefined) {
            for (var settingsCoordIndex = 0; settingsCoordIndex < setting.siteSetting.coordSettings.length; settingsCoordIndex++) {
                var setOrigin = setting.siteSetting.coordSettings[settingsCoordIndex].coordinate.OriginCoordinateString;
                if (parsedOrigin == setOrigin) {
                    notFound = false;
                    break;
                } // coordinate vorhanden
                else {
                    notFound = true;
                }
            }
        }
        if (notFound) {
            newCoordinates.push(new SettingCoord(parsedOrigin, getGUID(), GetUiId()));
        }
    }
    return newCoordinates;
}

function CreateInitialSetting(url, parsedPageCoords) {
    var settingObject = new SettingCalculator();
    settingObject.siteSetting = CreateSiteSetting(url, parsedPageCoords);
    settingObject.siteSettings.push(settingObject.siteSetting);
    SaveGeoMapsSettings(settingObject);
    return settingObject;
}

function CreateSiteSetting(siteUrl, parsedPageCoords) {
    var siteSetting = new SettingSite();
    siteSetting.url = siteUrl;
    for (var i = 0; i < parsedPageCoords.length; i++) {
        siteSetting.coordSettings.push(new SettingCoord(parsedPageCoords[i].OriginCoordinateString, getGUID(), GetUiId()));
    }
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        for (var iL = 0; iL < siteSetting.coordSettings.length; iL++) {
            siteSetting.coordSettings[i].showLineTo.push(SettingCoord.GetShowLineToObject(siteSetting.coordSettings[iL].id, false));
        }
    }
    return siteSetting;
}

function SettingCalculator() {
    this.userName = '';
    this.siteSettings = [];
    this.siteSetting = undefined;
    this.settingsExists = false;
}

SettingCalculator.Set = function (obj, propertyName, propertyValue, coordId) {
    if (coordId == undefined) {
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

SettingSite.SetProjectionShowLineTo = function (setting, coordId, projectionCoordId) {
    var tmpCoord = SettingSite.GetSettingCoordObject(setting, coordId);
    for (var index = 0; index < tmpCoord.showLineTo.length; index++) {
        if (tmpCoord.showLineTo[index].coordId == projectionCoordId) {
            tmpCoord.showLineTo[index].isShown = !tmpCoord.showLineTo[index].isShown;
        }
    }
    var tmpCoordProj = SettingSite.GetSettingCoordObject(setting, projectionCoordId);
    for (var index = 0; index < tmpCoordProj.showLineTo.length; index++) {
        if (tmpCoordProj.showLineTo[index].coordId == coordId) {
            tmpCoordProj.showLineTo[index].isShown = !tmpCoordProj.showLineTo[index].isShown;
        }
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.DeleteCoord = function (setting, id) {
    var deletableIndex = -1;
    for (var i = 0; i < setting.siteSetting.coordSettings.length; i++) {
        if (id == setting.siteSetting.coordSettings[i].id) {
            deletableIndex = i;
        }
    }
    if (deletableIndex > -1) {
        setting.siteSetting.coordSettings.splice(deletableIndex, 1);
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.HideAllShowLineTo = function (setting) {
    for (var i = 0; i < setting.siteSetting.coordSettings.length; i++) {
        for (var ii = 0; ii < setting.siteSetting.coordSettings[i].showLineTo.length; ii++) {
            setting.siteSetting.coordSettings[i].showLineTo[ii].isShown = false;
        }
    }
    SaveGeoMapsSettings(setting);
}

SettingSite.SetCoordFormat = function (setting, format) {
    setting.siteSetting.coordinateFormatType = GetCoordinateFormatObject(format);
    SaveGeoMapsSettings(setting);
}

SettingSite.SetCoordinateObjects = function (siteSetting) {
    for (var i = 0; i < siteSetting.coordSettings.length; i++) {
        if (siteSetting.coordSettings[i].coordinate == undefined || siteSetting.coordSettings[i].coordinate == '') {
            siteSetting.coordSettings[i].coordinate = new Coordinate(siteSetting.coordSettings[i].pointOrigin);
        }
    }
}

SettingSite.GetSettingCoordObject = function (setting, id) {
    for (var i = 0; i < setting.siteSetting.coordSettings.length; i++) {
        if (setting.siteSetting.coordSettings[i].id == id) {
            return setting.siteSetting.coordSettings[i];
        }
    }
}

function SettingCoord(origin, id, uiId) {
    this.uiId = uiId;
    this.id = id;
    this.pointOrigin = origin; // redundant, weil coordinate objekt NICHT gespeichert wird! dies ist quasi die unbestechliche ID.
    this.description = "";
    this.isSiteFavorite = false;
    this.isExpandet = false;
    this.showLineTo = []; // object = coordId, isShown
    this.coordinate = new Coordinate(origin);
}

SettingCoord.Set = function (setting, id, coordinate, description) {
    var coord = SettingSite.GetSettingCoordObject(setting, id);
    coord.coordinate = coordinate;
    coord.pointOrigin = coordinate.OriginCoordinateString;
    coord.description = description;
    SaveGeoMapsSettings(setting);
}

SettingCoord.SetExpandet = function (setting, id, isExpandet) {
    var coord = SettingSite.GetSettingCoordObject(setting, id);
    coord.isExpandet = isExpandet;
    SaveGeoMapsSettings(setting);
}

SettingCoord.SetFavorite = function (setting, id, isSiteFavorite) {
    var coord = SettingSite.GetSettingCoordObject(setting, id);
    coord.isSiteFavorite = isSiteFavorite;
    SaveGeoMapsSettings(setting);
}

SettingCoord.GetShowLineToObject = function(toCoordId, show) {
    return {coordId: toCoordId, isShown: show}
}