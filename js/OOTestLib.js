var doofesObjekt = new Object();
doofesObjekt.Text = 'doofesObjekt text property gesetzt';
doofesObjekt.Methode =  function() {  console.log('doofesObjekt methode function'); }

var variablenObjekt =
{
    Eigenschaft : 'variablenObjekt Property', // öffentlich
    Methode     : function() { console.log(this.Eigenschaft + " = Property Eigenschaft"); }
    // hier geht weder var noch this!
    // var TEST : "gugus"; --> Fehler
}
variablenObjekt.ZusatzMethode = function() { console.log("variablenObjekt diese Methode wurde ganz frech an variablenObjekt von aussen hinzugefügt")};

function Konstruktor()
{
    var VarProp     = "var.VarProp"
    this.ThisProp   = "this.ThisProp";
    GlobalProp      = "GlobalProp";

    // global --> this geht nicht!
    GlobalFunctionEins = function(){console.log("GlobalFunctionEins " + GlobalProp)};
    GlobalFunctionZwei = function(){console.log("GlobalFunctionZwei " + VarProp)};

    console.log(' ');

    // instanz öffentlich
    this.PublicFunctionEins = function(){console.log("PublicFunctionEins " + this.ThisProp);}; // öffentlich - Prop geht this!
    this.PublicFunctionZwei = function(){console.log("PublicFunctionZwei " + VarProp);}; // öffentlich - Prop geht var!
    this.PublicFunctionDrei = function(output){console.log("PublicFunctionDrei " + output);}; // öffentlich mit öffentlichem Property

    console.log(' ');

    var VarFunctionEins = function(){console.log("VarFunctionEins");};
    var VarFunctionZwei = GlobalFunctionEins;
    var VarFunctionDrei = this.PublicFunctionDrei(this.ThisProp);

    console.log(' ');

    VarFunctionEins();
    VarFunctionZwei();
    // VarFunctionDrei(); Fehler
}

var StatischesObjekt = {};
StatischesObjekt.StatischeFunction = function() {console.log("StatischesObjekt.StatischeFunction");};
// StatischesObjekt.prototype.TestProto = function() {console.log("StatischesObjekt.prototype.TestProto");};

//var StatischeErweitertesObjekt = function(){};
//StatischeErweitertesObjekt.prototype.StatischeFunction = function() {console.log("StatischeErweitertesObjekt.StatischeFunction");};
