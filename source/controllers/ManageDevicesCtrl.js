angular.module('MyApp')
  .controller('ManageDevicesCtrl', function($scope, $auth, toastr, $http, Account, $state, $mdDialog) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
      getDevices();
      ctrl.selectedSort = 'device_name';
      ctrl.device_type = 'Phone';
      
      function getAuth() {
          Account.getProfile()
              .then(function (response) {
                  if (response.data.role === "Admin") {
                      ctrl.Authorized = true;
                  } else {
                      ctrl.Authorized = false;
                      $state.go('available-devices');
                  }
              })
              .catch(function (response) {
                  toastr.error(response.data.message, response.status);
              })
      }

      //removes device from list
      ctrl.removeItem = function(id) {
          alertify.confirm("Are you sure you want to delete the device?", function (e) {
              if (e) {
                  $http.post('/deletedevice',{id: id}).success(function(data, status) {
                  });
                  getDevices();
              } else {
              }
          });
      };

      //gets list of devices
      function getDevices() {
          $http.get('/devices').success(function (data) {
              ctrl.devices = data;
          });
      }
      ctrl.addDevice = function () {
          $mdDialog.show({
              contentElement: '#editModal',
              parent: angular.element(document.body)
          });
      };
      ctrl.cancel = function() {
          $mdDialog.hide();
      };
      ctrl.postAddDevice = function() {
          $http.post('/savedevices',
              { device_name: ctrl.device_name
                  , device_type: ctrl.device_type
                  , device_sn: ctrl.device_sn
                  , device_manufacturer: ctrl.device_manufacturer
                  , device_model: ctrl.device_model
                  , sw_version: ctrl.sw_version
                  , screen_resolution: ctrl.screen_resolution
                  , device_ram: ctrl.device_ram
                  , checked_out_user: 'N/A'
              }).then(function(data, status) {
              $mdDialog.hide();
          });
      };
      ctrl.postEditDevice = function () {
          ctrl.saveUpdatedData = function () {
              $http.post('/updatedevices', {
                  id: ctrl.deviceData._id,
                  device_name: ctrl.deviceData.device_name,
                  device_type: ctrl.deviceData.device_type,
                  device_sn: ctrl.deviceData.device_sn,
                  device_manufacturer: ctrl.deviceData.device_manufacturer,
                  device_model: ctrl.deviceData.device_model,
                  sw_version: ctrl.deviceData.sw_version,
                  screen_resolution: ctrl.deviceData.screen_resolution,
                  device_ram: ctrl.deviceData.device_ram
              }).then(function (data, status) {
                  $mdDialog.hide();
              });
          };
      };
      ctrl.editDevice = function (deviceData) {
          ctrl.deviceData = deviceData;
          $mdDialog.show({
              contentElement: '#editDevice',
              parent: angular.element(document.body)
          });
      };
  });
