angular.module('MyApp')
  .controller('ManageUsersCtrl', function($scope, $auth, toastr, $http, Account, $state, alertify) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      getAuth();
      getUsers();
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
      //removes user from list
      ctrl.removeUser = function(id) {
          // confirm dialog
          alertify.confirm("Are you sure you want to delete the user?", function (e) {
              if (e) {
                  $http.post('/deleteuser',{id: id}).success(function(data, status) {
                  });
                  getUsers();
              } else {
              }
          });
      };

      //gets list of users
      function getUsers() {
          $http.get('/users').success(function (data) {
              ctrl.users = data;
          });
      }

      //set role of user
      ctrl.setRole = function(id, role) {
          // confirm dialog
          alertify.confirm("Are you sure you want to set the user roler?", function (e) {
              if (e) {
                  $http.post('/setabstractionrole',{id: id, role: role}).success(function(data, status) {
                  });
                  getUsers();
              } else {
              }
          });
      };
  });
