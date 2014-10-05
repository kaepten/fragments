var settingCalculator = {

    that : this,

    userName        : '',
    siteSettings    : [],
    settingsExists  : false,
    SetAndSaveSettings : function(siteUrl, siteCoords) {
        // updatet und speichert alles settings
        // es wird je domain www.c-dev.ch ein calculator setting gespeichert

        var siteSetting = new settingSite();
        siteSetting.url = siteUrl;
        siteSetting.coordSettings = $("input[name=CoordFormat]:checked").val();
        // koordinaten der site
        for (var i = 0; i < siteCoords.length; i++) {
            var siteCoord = new settingCoord();
            siteCoord.pointOrigin = siteCoords[i].Origin;

            set.coordSettings[i]=cord;
        }



        // speichern : prüfen ob url schon vorhanden, überschreiben oder neu anlegen
        var found = false;
        for(index=0; index<that.siteSetings; index++) {
            if(that.siteSettings[i].url == siteUrl) {
                // überschreiben
                found = true;
            }
        }
        if(!found) {

        }
    },
    Save            : function(url, content){
        try {
            var set = new settingSite();
            set.url = url;
            set.coordSettings = new Array(content.length);
            for (var i = 0; i < content.length; i++) {
                var cord = new settingCoord();
                cord.point = content[i];
                set.coordSettings[i]=cord;
            }
            this.siteSettings.push(set);
            // this.settingsExists = true;
        } catch(err)
        {
            alert(err);
        }
    }
};

function settingSite() {
    url = '';
    coordinateFormatType = CoordinateFormat.Ddd;
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
