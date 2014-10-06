function SaveGeoMapsSettings(settingCalculatorObject){
    var myJSONText = JSON.stringify(settingCalculatorObject);
    localStorage["GeoMaps"] = myJSONText;
}

function LoadGeoMapsSettings(){
    var settingCalculatorText = localStorage["GeoMaps"];
    if(settingCalculatorText != undefined) {
        var settingCalculatorObject = JSON.parse(settingCalculatorText);
        return settingCalculatorObject;
    }
    return undefined;
}

function LoadGeoMapsSiteSettings(url) {
    var settingCalculatorObject = LoadGeoMapsSettings();
    if(settingCalculatorObject != undefined) {
        for (var index = 0; index < settingCalculatorObject.siteSettings.length; index++) {
            if (settingCalculatorObject.siteSettings[i].url == url) {
                return settingCalculatorObject.siteSettings[i];
            }
        }
    }
    return undefined;
}

function CreateSiteSetting(siteUrl, siteCoords) {
    var siteSetting = new settingSite();
    siteSetting.url = siteUrl;
    siteSetting.coordSettings = [];
    siteSetting.coordinateFormatType = CoordinateFormat.Ddd;
    for (var i = 0; i < siteCoords.length; i++) {
        var siteCoord = new settingCoord();
        siteCoord.pointOrigin = siteCoords[i].OriginCoordinateString;
        siteCoord.description =  "ID : " + i; // $("#geoMapsCoordBox-"+i+" .description").html();
        siteSetting.coordSettings.push(siteCoord);
    }
    return siteSetting;
}

var settingCalculator = {

    that                : this,
    userName            : '',
    siteSettings        : [],
    settingsExists      : false
};

function settingSite() {
    url = '';
    coordinateFormatType = undefined;
    coordSettings = [];
}


function settingCoord() {
    pointOrigin='';
    description='';
    isSiteFavorite=false;
    isGlobalFavorite=false;
    isExpandet=false;
    showLineTo=[];
}
