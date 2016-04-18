angular.module('MyApp')
  .controller('InventoryCtrl', function($scope, $auth, toastr, $http, Account, $state) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
      getDevices();
      getUsers();
      ctrl.selectedSort = 'device_name';
      ctrl.selectedSortUser = 'displayName';
      
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
          $http.post('http://localhost:3000/deletedevice',{id: id}).success(function(data, status) {
          });
          getDevices();
      };

      //removes user from list
      ctrl.removeUser = function(id) {
          $http.post('http://localhost:3000/deleteuser',{id: id}).success(function(data, status) {
          });
          getUsers();
      };

      //gets list of devices
      function getDevices() {
          $http.get('http://localhost:3000/devices').success(function (data) {
              ctrl.devices = data;
          });
      }

      //gets list of users
      function getUsers() {
          $http.get('http://localhost:3000/users').success(function (data) {
              ctrl.users = data;
          });
      }

      //set role of user
      ctrl.setRole = function(id, role) {
          $http.post('http://localhost:3000/setabstractionrole',{id: id, role: role}).success(function(data, status) {
          });
          getUsers();
      };
  });
