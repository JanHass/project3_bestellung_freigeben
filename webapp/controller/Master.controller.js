sap.ui.define([
    "sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (MessageToast, Controller, Device, Log, MessageBox, Filter, FilterOperator,jQuery,JSONModel) {
        "use strict";

        return Controller.extend("project3bestellungfreigeben.controller.Master", {
            onInit: function () {

            }
        });
    });