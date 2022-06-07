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

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
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
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
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

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
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

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            //Delete Notes on View and var note    
            note=""; 
            this.getView().byId("notes").setValue("");  
            
            this.calcTotal();

            



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

        calcTotal: function () {

			var result = 0.0;
            var subtotal= 0.0;

            var items = this.getView().byId('lineItemsList').getItems();

            
                for (var i=0; i<items.length;i++) {


                    subtotal=items[i].getCells()[4].getText();
                    subtotal=parseFloat(subtotal)
                    console.log(subtotal);
                    result += subtotal;
                    console.log(result);
                    
                    
                }
            

            

    

			result = result.toFixed(2);
            this.getView().byId("total").setText(result);
            

            //MessageToast.show("Total amount");
		},

        calcSubTotal: function (NetPriceAmount, OrderQuantity) {
            var subtotal= 0.0;

			NetPriceAmount=parseFloat(NetPriceAmount);
            OrderQuantity=parseFloat(OrderQuantity);

            subtotal=NetPriceAmount*OrderQuantity;
            subtotal=subtotal.toFixed(2);

            
            return(subtotal);
		},

        

        

        _onAcceptMessageBoxPress: function () {

            var oDataModel=this.getView().getModel("secondService");
            var PONumber=this.getView().byId("PONo").getText();;
            var Comment=note;
            var successmessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("successaccept");
            var errormessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("errorAccept");

			MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("mbconfirmlong"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("mborder") +" "+ PONumber,
                onClose : function(sButton) 
                {
                    if(sButton === MessageBox.Action.OK)
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
        _onDeclineMessageBoxPress: function () {

            
            var oDataModel=this.getView().getModel("secondService");
            var PONumber=this.getView().byId("PONo").getText();;
            var Comment=note;
            var successmessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("successdecline");
            var errormessage= this.getView().getModel("i18n").getResourceBundle().getText("order") +" "+ PONumber+" "+this.getView().getModel("i18n").getResourceBundle().getText("errorDecline");
                        
			MessageBox.confirm (this.getView().getModel("i18n").getResourceBundle().getText("mbdeclinelong"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("mborder") +" "+ PONumber,
                onClose : function(sButton) 
                {
                    if(sButton === MessageBox.Action.OK)
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

        _onButtonPressSaveNotes: function () {

            note=this.getView().byId("notes").getValue();


            MessageToast.show(note);

        },
        

        



    });

});