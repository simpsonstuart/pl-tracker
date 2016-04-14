angular.module('MyApp')
  .controller('ProfileCtrl', function($scope, $auth, toastr, Account, $http) {
      var ctrl            = this;
      ctrl.selectedSort = 'name';
      getDevices();
      ctrl.selectedSort = 'name';

      //gets list of devices that I have checked out
      function getDevices() {
          Account.getProfile()
              .then(function(response) {
                  $http.get('http://localhost:3000/devices').success(function (data) {
                      ctrl.devices = _.filter(data, ['checked_out_user', response.data.displayName]);
                  });
              })
              .catch(function(response) {
                  toastr.error(response.data.message, response.status);
              });
      }

      ctrl.checkInDevice = function (deviceId) {
          $http.post('http://localhost:3000/checkindevice', {id: deviceId}).success(function(data, status) {
              getDevices();
              toastr.success('Device Checked In');
          });
      };

    $scope.getProfile = function() {
      Account.getProfile()
        .then(function(response) {
          $scope.user = response.data;
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.updateProfile = function() {
      Account.updateProfile($scope.user)
        .then(function() {
          toastr.success('Profile has been updated');
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function() {
          toastr.success('You have successfully linked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          toastr.error(response.data.message, response.status);
        });
    };
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          toastr.info('You have unlinked a ' + provider + ' account');
          $scope.getProfile();
        })
        .catch(function(response) {
          toastr.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
        });
    };

    $scope.getProfile();
  });
