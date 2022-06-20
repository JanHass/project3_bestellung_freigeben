sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, mobileLibrary, MessageBox, MessageToast) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    var note;
    

    return BaseController.extend("odatatmp1.controller.Detail", {

        formatter: formatter,

       

        onInit: function () {
            var oViewModel = new JSONModel({
                busy : false,
                delay : 0,
                lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
            });
            

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

            
        },

        
        

        
        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */

        //Wenn die Bestellung in der View fertig geladen ist
        onListUpdateFinished: function (oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
                this.calcTotal(); //Gesamtpreis ermitteln
            }
        },


    

        _onObjectMatched: function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getModel().metadataLoaded().then( function() {
                var sObjectPath = this.getModel().createKey("A_PurchaseOrder", {
                    PurchaseOrder:  sObjectId
                });
                this._bindView("/" + sObjectPath);
            }.bind(this));

            


        },

        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");
            

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path : sObjectPath,
                events: {
                    change : this._onBindingChange.bind(this),
                    dataRequested : function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },
        //Wen eine andere Bestellung aus der Liste gewählt wird.
        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            //Delete Notes on View and var note    
            note=""; 
            this.getView().byId("notes").setValue("");  
            

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearListListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.PurchaseOrder,
                sObjectName = oObject.PurchaseOrder,
                oViewModel = this.getModel("detailView");

            


            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            
            

            
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("lineItemsList"),
                iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

            oLineItemTable.attachEventOnce("updateFinished", function() {
                // Restore original busy indicator delay for line item table
                oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            });

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);

            
            
        },
        //Gesamtpreis errechnen
        calcTotal: function () {

			var result = 0.0;
            var subtotal= 0.0;

            //Tabelle mit allen Positionen lesen und in einen Array speichern
            var items = this.getView().byId('lineItemsList').getItems();

                
                for (var i=0; i<items.length;i++) {

                    
                    subtotal=items[i].getCells()[4].getText();  //Cells 4 = Subtotal = Anzahl der Produkte * Preis/Produkt
                    subtotal=parseFloat(subtotal)               //subtotal in float umwandeln
                    result += subtotal;                         //subtotal auf result (total) addieren

                    
                }
            

			result = result.toFixed(2);                         // reuslt auf 2 NK Stellen runden
            this.getView().byId("total").setText(result);       // Textfeld text "total" zu result ändern
            

            //MessageToast.show("Total amount");
		},

        //Zwischensumme errechnen (Tabelle)
        //Beim Aufruf wird die Anzahl der Produkte und der Preis/St einer Position übergeben
        calcSubTotal: function (NetPriceAmount, OrderQuantity) {
            var subtotal= 0.0;

			NetPriceAmount=parseFloat(NetPriceAmount);  //Übergebener Wert in Float umwandeln
            OrderQuantity=parseFloat(OrderQuantity);    //Übergebener Wert in Float umwandeln

            subtotal=NetPriceAmount*OrderQuantity;      //Berechnung
            subtotal=subtotal.toFixed(2);               //subtotal auf 2 NK Stellen runden

            
            return(subtotal);                           //subtotal zurückgeben
		},

        

        
        //Bestellung annehmen
        _onAcceptMessageBoxPress: function () {

            var oDataModel=this.getView().getModel("secondService");    
            var PONumber=this.getView().byId("PONo").getText(); //Order Number lesen
            var Comment=note;   //note -> siehe "_onButtonPressSaveNotes"
            var successmessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("successaccept"); //Aufruf um an Übersetzung zu kommen
            var errormessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("errorAccept");

			MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("mbconfirmlong"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("mborder") +" "+ PONumber,
                onClose : function(sButton) 
                {
                    if(sButton === MessageBox.Action.OK) //Wenn im PopUp der OK Button betätigt wird
                    {
                        oDataModel.callFunction("/Reject", {
                            "method": "POST",
                            urlParameters: {
                                "PONumber":PONumber, 
                                "Comment":Comment
                            },
                            success: function(oData, oResponse){
                                 //Handle Success
                                 MessageToast.show(successmessage);
                                 
                            },
                            error: function(oError){
                                 //Handle Error
                                 MessageToast.show(errormessage);
                            }
                       });
                    };
                }
            });
		},
        //Bestellung ablehnen
        _onDeclineMessageBoxPress: function () {

            
            var oDataModel=this.getView().getModel("secondService");
            var PONumber=this.getView().byId("PONo").getText(); //Order Number lesen
            var Comment=note;
            var successmessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("successdecline");
            var errormessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("errorDecline");
                        
			MessageBox.confirm (this.getView().getModel("i18n").getResourceBundle().getText("mbdeclinelong"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("mborder") +" "+ PONumber,
                onClose : function(sButton) 
                {
                    if(sButton === MessageBox.Action.OK) //Wenn im PopUp der OK Button betätigt wird
                    {
                        oDataModel.callFunction("/Reject", { //OData Function ausführen
                            "method": "POST",
                            urlParameters: {
                                "PONumber":PONumber, 
                                "Comment":Comment
                            },
                            success: function(oData, oResponse){
                                 //Handle Success
                                 MessageToast.show(successmessage);
                            },
                            error: function(oError){
                                 //Handle Error
                                 MessageToast.show(errormessage);
                            }
                       });
                        
                        
                    };
                }
            });
		},
        //Notiz speichern
        _onButtonPressSaveNotes: function () {

            note=this.getView().byId("notes").getValue(); //Wenn Button betätigt, wird die geschriebene Notiz (View) in der Controller Variable "note" gespeichert


            MessageToast.show(note);

        },
        

        



    });

});