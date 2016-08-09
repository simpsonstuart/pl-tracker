angular.module('MyApp')
  .controller('InventoryCtrl', function($scope, $auth, toastr, $http, Account, $state, alertify) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
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
      // gets stats log
      function getStats() {
          $http.get('/get-stats').then(function (response) {
              ctrl.stats = response.data;
          });
      }
      // gets counts
      function getCounts() {
          $http.get('/get-count').then(function (response) {
              ctrl.counts = response.data;
          });
      }

      // get full logs
      ctrl.getStatsFull = function() {
         return $http.get('/get-full-stats').then(function(response) {
              return response.data;
          });
      };
      ctrl.dropStats = function () {
          alertify.confirm("Are you sure you want to clear all statistics?", function (e) {
              if (e) {
                  $http.delete('/drop-stats').then(function () {
                      getStats();
                      alertify.alert('Statistics Cleared!')
                  });
              } else {
              }
          });
      }
  });
