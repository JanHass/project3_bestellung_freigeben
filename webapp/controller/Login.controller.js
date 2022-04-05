sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
    "use strict";

    return Controller.extend("project3bestellungfreigeben.controller.Login", {
        onInit: function () {

        },
        onLoginUser: function(){
            var Benutzer = this.getView().byId("inp_usernameId");
            var Passwort = this.getView().byId("inp_passwordId");

            var user ="Test";
            var pass ="1234";

            if(Benutzer.getValue()===""){
                MessageBox.error("Bitte den Benutzernamen angeben");
                return;
            } else if(Passwort.getValue()===""){
                MessageBox.error("Bitte das Passwort angeben");
                return;
            }else{
                if(Benutzer.getValue()===user && Passwort.getValue()===pass){
                    var oRouter=sap.ui.core.UIComponent.getRouterFor(this)
                    oRouter.navTo("View1")
            }else{
                MessageBox.error("Falscher Benutzername oder Passwort");
                return;
            }
        }
    }
    });

});
