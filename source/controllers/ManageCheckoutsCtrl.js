angular.module('MyApp')
  .controller('ManageCheckoutsCtrl', function($scope, $auth, toastr, $http, Account, $state, alertify) {
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
          $http.post('/deletedevice',{id: id}).success(function(data, status) {
          });
          getDevices();
      };

      //gets list of devices
      function getDevices() {
          $http.get('/devices').then(function (response) {
              ctrl.devices = _.reject(response.data, ['checked_out_user', "N/A"]);
              if (!ctrl.devices.length) {
                  ctrl.showNoCheckouts = true;
              }
          });
      }
      ctrl.ForceCheckIn = function (deviceName, deviceId, userName, userId) {
          alertify.confirm("Are you sure you want to force check-in?", function (e) {
          if (e) {
              $http.post('/force-checkin', { id: deviceId, user_name: userName, user_id: userId }).then(function(data, status) {
                  getDevices();
                  toastr.success('Checked in device!');
              });
          } else {
          }
          });
      };
  });
