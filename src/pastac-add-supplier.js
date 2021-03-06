'use strict';

angular.module('pastac-add-supplier', [])

.component('pastacAddSupplier', {
  controller: PastacAddSupplierController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    // See https://docs.angularjs.org/guide/component
    handler: '<',       // object with callbacks
    jwt: '<',           // The JSON web token
    supplierType: '@',  // string, such as 'Vendor'
    template: '@'
  },

  templateUrl: function($element, $attrs) {
    var t = '/bower_components/pastac-add-supplier/dist/pastac-add-supplier.html';
    if ($attrs.template) {
      t = $attrs.template;
    }
    //console.log('template=>' + t);
    return t;
  },

});


function PastacAddSupplierController($scope, $timeout, $http) {
  var ctrl = this;

  ctrl.$onInit = function() {

    // Perhaps use a word other than 'Supplier'
    ctrl.label = (ctrl.supplierType) ? ctrl.supplierType : 'Supplier';

    // Calld when the button is pressed
    ctrl.newDrinkmaker = function() {

      // Call TEAservice to do the add
      addSupplier($http, ctrl.jwt, {
        supplierName: ctrl.supplierName,
        companyName: ctrl.supplierName,
        contactEmail: ctrl.contactEmail,
        storeId: STORE_ID,
        abn: ctrl.abn
      }, function(supplierId) {

        // See if the user wants to be notified of changes
        if (!ctrl.handler) {
          console.log('pastac-add-supplier: NOT calling handler.onAddSupplier (no handler)')
        } else if (!ctrl.handler.onAddSupplier) {
          console.log('pastac-add-supplier: NOT calling handler.onAddSupplier (no handler)')
        } else {
          console.log('pastac-add-supplier: calling handler.onAddSupplier(' + supplierId + ')')
          $timeout(function() {
            ctrl.handler.onAddSupplier(supplierId);
          }, 1);
        }
      });
    }

  };//- onInit


  /*
   *

   companyName
   supplierName
   storeId
   commissionRate
   logo
   banner
   isActive
   deleted
   type
   contactEmail
   abn
   phone_c
   phone_n
   story

   */
  function addSupplier($http, jwt, options, callback/*(supplierId)*/) {
    console.log('addSupplier()')
    console.log('options: ', options);

    var url = '//' + TEASERVICE_HOST + ':' + TEASERVICE_PORT + '/v3/saveSupplier';
    console.log('url=' + url);

    var req = {
      method: 'PUT',
      url: url,
      headers: {
        "Authorization": jwt,
        "access-token": "0613952f81da9b3d0c9e4e5fab123437",//ZZZZ Hack
        "version": "3.0.0"
      },
      data: options
    };

    // Prepare the promise, so the caller can use .then(fn) to handle the result.
    ctrl.inProgress = true;
    $http(req).then(function(response) {

      // Added okay
      ctrl.inProgress = false;
      ctrl.errmsg = null;
      $('#pastac-add-supplier-modal').modal('hide');
      if (callback) {
        return callback(response.data, null)
      }
    }, function(response) {

      // An error occurred
      ctrl.inProgress = false;
      console.log('--------------------------------');
      console.log('Error calling TEAservice:');
      console.log(' Url=' + url);
      console.log(' Request=', req);
      console.log(' Response=', response);
      console.log('--------------------------------');
      if (response.data && response.data.code && response.data.message) {
        var msg = 'Error: ' + response.data.code + ': ' + response.data.message;
      } else if (response.statusText) {
        var msg = 'Error: ' + response.statusText;
      } else {
        var msg = 'Error: ' + response.status;
      }
      ctrl.errmsg = msg;
      if (callback) {
        return callback(null, response)
      }
    });
  }

}
