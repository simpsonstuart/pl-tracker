angular.module('MyApp')
  .controller('ManageDevicesCtrl', function($scope, $auth, toastr, $http, Account, $state) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
      getDevices();
      ctrl.selectedSort = 'device_name';
      
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
  });
