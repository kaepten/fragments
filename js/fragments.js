// JSON TEST

// alert(localStorage["testData"]);

var currentdate = new Date();
var datetime = "Last Sync: " + currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/"
    + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

var myJSONObject = {"bindings": [
    {"ircEvent": "PRIVMSG", "method": "newURI", "regex": "^http://.*", "stamp": datetime},
    {"ircEvent": "PRIVMSG", "method": "deleteURI", "regex": "^delete.*", "stamp": datetime},
    {"ircEvent": "PRIVMSG", "method": "randomURI", "regex": "^random.*", "stamp": datetime}
]};

var myJSONText = JSON.stringify(myJSONObject);
// alert(myJSONText);
localStorage["testData"] = myJSONText;

