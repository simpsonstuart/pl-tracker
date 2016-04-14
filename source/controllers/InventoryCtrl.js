angular.module('MyApp')
  .controller('InventoryCtrl', function($scope, $http) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getDevices();
      getUsers();
      ctrl.selectedSort = 'device_name';

      //removes device from list
      ctrl.removeItem = function(id) {
          $http.post('http://localhost:3000/deletedevice',{id: id}).success(function(data, status) {
          });
          getDevices();
      };

      //gets list of devices
      function getDevices() {
          $http.get('http://localhost:3000/devices').success(function (data) {
              ctrl.devices = data;
          });
      }

      //gets list of dusers
      function getUsers() {
          $http.get('http://localhost:3000/users').success(function (data) {
              ctrl.users = data;
          });
      }

  });
