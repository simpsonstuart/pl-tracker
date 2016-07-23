angular.module('MyApp')
  .controller('LoginCtrl', function($scope, $location, $auth, toastr, $state, Account) {
    $scope.login = function() {
      $auth.login($scope.user)
        .then(function() {
            Account.getProfile()
                .then(function (response) {
                    if (response.data.role && response.data.role !== "Deactivated") {
                        toastr.success('You have successfully signed in!');
                        if (response.data.role === 'Admin'){
                            localStorage.setItem('843443fdds33', true);
                        } else {
                            localStorage.setItem('843443fdds33', false);
                        }
                        $state.go('available-devices', {}, {reload: true});
                    } else {
                        $state.go('deactivated');
                    }
                })
                .catch(function (response) {
                    toastr.error(response.data.message, response.status);
                })
        })
        .catch(function(error) {
          toastr.error(error.data.message, error.status);
        });
    };
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function() {
            Account.getProfile()
                .then(function (response) {
                    if (response.data.role && response.data.role !== "Deactivated") {
                        toastr.success('You have successfully signed in with ' + provider + '!');
                        if (response.data.role === 'Admin'){
                            localStorage.setItem('843443fdds33', true);
                        } else {
                            localStorage.setItem('843443fdds33', false);
                        }
                        $state.go('available-devices', {}, {reload: true});
                    } else {
                        $state.go('deactivated');
                    }
                })
                .catch(function (response) {
                    toastr.error(response.data.message, response.status);
                })
        })
        .catch(function(error) {
          if (error.error) {
            // Popup error - invalid redirect_uri, pressed cancel button, etc.
            toastr.error(error.error);
          } else if (error.data) {
            // HTTP response error from server
            toastr.error(error.data.message, error.status);
          } else {
            toastr.error(error);
          }
        });
    };
  });
