function ParseCoordinates() {
    var pageParserRegExp = /(id="geoMapsCoord\d*">)?\s*([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*\s*/gmi;
    $.fn.egrep = function(pat) {
        var out = [];
        var lastParent;
        var textNodes = function(n) {
            if (n.nodeType == 3) {
                var t = typeof pat == 'string' ? n.nodeValue.indexOf(pat) != -1 : pat.test(n.nodeValue);
                if (t) {
                    if (lastParent == undefined || lastParent != n.parentNode) {
                        lastParent = n.parentNode;
                        out.push(n.parentNode);
                    }
                }
            }
            else {
                $.each(n.childNodes, function(a, b) {
                    textNodes(b);
                });
            }
        };
        this.each(function() {
            textNodes(this);
        });
        return out;
    };

    var n = $('body').egrep(pageParserRegExp);
    var coords = new Array();
    var coordIndex = 0;
    for (var i = 0; i < n.length; ++i) {
        try {
            var validCoordinates = ($(n[i]).html()).match(pageParserRegExp);
            var replaceHtml = $(n[i]).html().trim().replace(/(\r\n|\n|\r)/gm,"");

            for (var ii = 0; ii < validCoordinates.length; ++ii) {

                var coord = new Coordinate(replaceHtml);
                if (!coord.IsValid) {
                    alert('Fehler beim parsen der Koordinate!');
                }
                coords.push(coord);
                replaceHtml = '<span id="geoMapsCoord'+coordIndex+'" style="color:white;">'+replaceHtml+'&nbsp;('+ coord.Lv03.Format +')</span>';
                coordIndex++;
            }
            $(n[i]).html(replaceHtml);
        } catch(err) {
            alert(err);
        }
    }
    return coords;
}


