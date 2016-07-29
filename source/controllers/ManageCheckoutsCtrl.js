angular.module('MyApp')
  .controller('ManageCheckoutsCtrl', function($scope, $auth, toastr, $http, Account, $state) {
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
          $http.get('/devices').success(function (data) {
              ctrl.devices = data;
          });
      }
      ctrl.ForceCheckIn = function (deviceId) {
          alertify.confirm("Are you sure you want to force check-in?", function (e) {
          if (e) {
              $http.post('/checkindevice', {id: deviceId}).success(function(data, status) {
                  toastr.success('Checked in device!');
              });
              getDevices();
          } else {
          }
          });
      };
  });
