var settingCalculator =
{
    userName        : '',
    siteSettings    : new Array(),
    settingsExists  : false,
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

function settingSite()
{
    url = '';
    coordSettings = new Array();
}

function settingCoord()
{
    point='';
    description='';
    isSiteFavorite=false;
    isGlobalFavorite=false;
    isExpandet=false;
    lineTo=new Array();
}
