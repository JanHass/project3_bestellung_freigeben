sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (MessageToast, Controller, Device, Log, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("project3bestellungfreigeben.controller.View1", {

		onInit: function () {
			this.getSplitAppObj().setHomeIcon({
				'phone': 'phone-icon.png',
				'tablet': 'tablet-icon.png',
				'icon': 'desktop.ico'
			});

			Device.orientation.attachHandler(this.onOrientationChange, this);
		},

		onExit: function () {
			Device.orientation.detachHandler(this.onOrientationChange, this);
		},

		onOrientationChange: function (mParams) {
			var sMsg = "Orientation now is: " + (mParams.landscape ? "Landscape" : "Portrait");
			MessageToast.show(sMsg, { duration: 5000 });
		},

		onPressNavToDetail: function () {
			this.getSplitAppObj().to(this.createId("detailDetail"));
		},

		onPressDetailBack: function () {
			this.getSplitAppObj().backDetail();
		},

		onPressMasterBack: function () {
			this.getSplitAppObj().backMaster();
		},

		onPressGoToMaster: function () {
			this.getSplitAppObj().toMaster(this.createId("master2"));
		},

		onListItemPress: function (oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObj().toDetail(this.createId(sToPageId));
		},

		onPressModeBtn: function (oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitAppObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, { duration: 5000 });
		},

		getSplitAppObj: function () {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				Log.info("SplitApp object can't be found");
			}
			return result;
		},
		onLoginUser: function(){
			var Benutzer = this.getView().byId("inp_usernameId");
			var Passwort = this.getView().byId("inp_passwordId");

			var user ="Test";
			var pass ="1234";

			if(Benutzer.getValue()===""){
				MessageBox.error("Bitte den Benutzer angeben");
				return;
			} else if(Passwort.getValue()===""){
				MessageBox.error("Bitte das Passwort angeben");
				return;
			}else{
				if(Benutzer.getValue()===user && Passwort.getValue()===pass){
					MessageBox.success("Anmeldung war erfolgreich");
			}else{
				MessageBox.error("Falscher Benutzername oder Passwort");
				return;
			}
		}
	},
	onFilterProducts: function(oEvent){
		var aFilter = [], sQuery = oEvent.getParamenter("query"),
		oList = this.getVies().byId("productList"),
		oBinding = oList.getBinding("items");

		if(sQuery){
			aFilter.puwsh(new Filter("ProductID", FilterOperator.Contains, sQuery));
		}
		oBinding.filter(aFilter);

		
	}

	});
});