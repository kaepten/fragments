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
                    // schnittmenge bilden von Seite zu gespeicherten
                    var tempList = [];
                    var newIndex = settingObject.siteSetting.coordSettings.length;
                    for(var index=0; index<siteCoords.length; index++) {
                        var origin = siteCoords[index].OriginCoordinateString;
                        var notFound = true;
                        for(var setIndex=0; setIndex<settingObject.siteSetting.coordSettings.length; setIndex++){
                            var setOrigin = settingObject.siteSetting.coordSettings[setIndex].pointOrigin;
                            if(origin == setOrigin) {
                                notFound = false; break; } // coordinate vorhanden
                        }
                        if(notFound) {
                            var siteCoord = new SettingCoord();
                            siteCoord.pointOrigin = siteCoords[index].OriginCoordinateString;
                            siteCoord.description =  "ID : " + newIndex++; // $("#geoMapsCoordBox-"+i+" .description").html();
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
                    return settingObject; // abbruch des for loops
                }
            }
        }
    }
    settingObject = new SettingCalculator();
    settingObject.siteSetting = CreateSiteSetting(url, siteCoords);
    settingObject.siteSettings.push(settingObject.siteSetting);
    return settingObject;
}

function CreateSiteSetting(siteUrl, siteCoords) {
    var siteSetting = new SettingSite();
    siteSetting.url = siteUrl;
    for (var i = 0; i < siteCoords.length; i++) {
        var siteCoord = new SettingCoord();
        siteCoord.pointOrigin = siteCoords[i].OriginCoordinateString;
        siteCoord.description =  "ID : " + i; // $("#geoMapsCoordBox-"+i+" .description").html();
        for (var iL = 0; iL < siteCoords.length; iL++) {
            siteCoord.showLineTo.push({coordId:iL,isShown:false});
        }
        siteSetting.coordSettings.push(siteCoord);
    }
    return siteSetting;
}

function SaveGeoMapsSettings(settingCalculatorObject){
    var tmpSiteSetting = settingCalculatorObject.siteSetting;
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


function SettingCoord() {
    this.pointOrigin='';
    this.description='';
    this.isSiteFavorite=false;
    this.isExpandet=false;
    this.showLineTo=[];
}
