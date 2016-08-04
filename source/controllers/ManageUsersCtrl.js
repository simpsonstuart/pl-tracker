angular.module('MyApp')
  .controller('ManageUsersCtrl', function($scope, $auth, toastr, $http, Account, $state, alertify, $mdDialog) {
      var ctrl            = this;
      ctrl.hideDeviceList = false;
      ctrl.showAddDevice = false;
      ctrl.showEditDevice = false;
      ctrl.role = "Maintainer";
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
      // removes user from list
      ctrl.removeUser = function(id) {
          // confirm dialog
          alertify.confirm("Are you sure you want to delete the user?", function (e) {
              if (e) {
                  $http.post('/deleteuser',{id: id}).then(function(data, status) {
                  });
                  getUsers();
              } else {
              }
          });
      };
      // edit user logic
      ctrl.editUser = function(id) {
          $http.get('/get-user' + '?id=' + id).then(function (response) {
              ctrl.user = response.data;
          });
          $mdDialog.show({
              contentElement: '#editUserModal',
              parent: angular.element(document.body)
          });
      };

      // gets list of users
      function getUsers() {
          $http.get('/users').then(function (response) {
              ctrl.users = response.data;
          });
      }

      // set role of user
      ctrl.setRole = function(id, role) {
          // confirm dialog
          alertify.confirm("Are you sure you want to set the user role?", function (e) {
              if (e) {
                  $http.post('/setabstractionrole',{id: id, role: role}).then(function(data, status) {
                      getUsers();
                  });
              } else {
              }
          });
      };
      ctrl.addUser = function() {
          $mdDialog.show({
              contentElement: '#editModal',
              parent: angular.element(document.body)
          });
      };
      ctrl.cancel = function() {
          $mdDialog.hide();
      };
      ctrl.postaddUser = function() {
          $http.post('/adduser', { displayName: ctrl.name, email: ctrl.email, role: ctrl.role}).then(function(data, status) {
              getUsers();
              $mdDialog.hide();
          });
      };
      ctrl.posteditUser = function() {
          $http.put('/update-user', { id: ctrl.user._id, displayName: ctrl.user.displayName, email: ctrl.user.email, role: ctrl.user.role}).then(function(data, status) {
              getUsers();
              $mdDialog.hide();
          });
      };
  });
