angular.module('MyApp')
  .controller('InventoryCtrl', function($scope, $auth, toastr, $http, Account, $state) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
      getDevices();
      getUsers();
      getStats();
      getCounts();
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
          $http.post('/deletedevice',{id: id}).success(function(data, status) {
          });
          getDevices();
      };

      //removes user from list
      ctrl.removeUser = function(id) {
          $http.post('/deleteuser',{id: id}).success(function(data, status) {
          });
          getUsers();
      };

      //gets list of devices
      function getDevices() {
          $http.get('/devices').success(function (data) {
              ctrl.devices = data;
          });
      }

      //gets list of users
      function getUsers() {
          $http.get('/users').success(function (data) {
              ctrl.users = data;
          });
      }
      //gets list of users
      function getStats() {
          $http.get('/get-stats').then(function (response) {
              ctrl.stats = response.data;
          });
      }
      //gets list of users
      function getCounts() {
          $http.get('/get-count').then(function (response) {
              ctrl.counts = response.data;
          });
      }

      //set role of user
      ctrl.setRole = function(id, role) {
          $http.post('/setabstractionrole',{id: id, role: role}).success(function(data, status) {
          });
          getUsers();
      };
  });
