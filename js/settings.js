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
                    return settingObject;
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

function SettingSite() {
    this.url = '';
    this.coordinateFormatType = CoordinateFormat.Ddd;
    this.coordSettings = [];
}


function SettingCoord() {
    this.pointOrigin='';
    this.description='';
    this.isSiteFavorite=false;
    this.isGlobalFavorite=false;
    this.isExpandet=false;
    this.showLineTo=[];
}
