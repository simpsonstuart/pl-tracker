angular.module('MyApp')
  .controller('InventoryCtrl', function($scope, $http) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getDevices();
      ctrl.selectedSort = 'name';

    $http.jsonp('https://api.github.com/repos/sahat/satellizer?callback=JSON_CALLBACK')
      .success(function(data) {
        if (data) {
          if (data.data.stargazers_count) {
            $scope.stars = data.data.stargazers_count;
          }
          if (data.data.forks) {
            $scope.forks = data.data.forks;
          }
          if (data.data.open_issues) {
            $scope.issues = data.data.open_issues;
          }
        }
      });

      //add new device screen show
      ctrl.toggleAddNew = function() {
          ctrl.showAddDevice = true;
          ctrl.hideDeviceList = true;
      };

      //removes device from list
      ctrl.removeItem = function(id) {
          $http.post('http://localhost:3000/deletedevice',{id: id}).success(function(data, status) {
          });
          getDevices();
      };

      ctrl.cancel = function () {
          ctrl.showAddDevice = false;
          ctrl.hideDeviceList = false;
          ctrl.showEditDevice = false;
      };

      ctrl.editDevice = function (device) {
          ctrl.showEditDevice = true;
          ctrl.hideDeviceList = true;
          var deviceIndex = device.id;
          ctrl.deviceData = device;

      };

      ctrl.saveUpdatedData = function () {
          $http.post('http://localhost:3000/deletedevice',{id: ctrl.deviceData._id}).success(function(data, status) {
          });
          $http.post('http://localhost:3000/savedevices', {device_name: ctrl.deviceData.device_name, device_type: ctrl.deviceData.device_type, device_sn: ctrl.deviceData.device_sn, device_manufacturer: ctrl.deviceData.device_manufacturer, device_model: ctrl.deviceData.device_model, sw_version: ctrl.deviceData.sw_version, screen_resolution: ctrl.deviceData.screen_resolution, device_ram: ctrl.deviceData.device_ram, checked_out_user: ctrl.deviceData.checked_out_user}).success(function(data, status) {
          });
          getDevices();
          ctrl.showEditDevice = false;
          ctrl.hideDeviceList = false;
      };

      //gets list of devices
      function getDevices() {
          $http.get('http://localhost:3000/devices').success(function (data) {
              ctrl.devices = data;
          });
      }

      //saves data for add new screen
      ctrl.saveData = function() {
          $http.post('http://localhost:3000/savedevices', { device_name: ctrl.device_name, device_type: ctrl.device_type, device_sn: ctrl.device_sn, device_manufacturer: ctrl.device_manufacturer, device_model: ctrl.device_model, sw_version: ctrl.sw_version, screen_resolution: ctrl.screen_resolution, device_ram: ctrl.device_ram, checked_out_user: 'N/A'}).success(function(data, status) {
          });
          getDevices();
          ctrl.showAddDevice = false;
          ctrl.hideDeviceList = false;
      }
  });
