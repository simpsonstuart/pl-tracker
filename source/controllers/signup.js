angular.module('MyApp')
  .controller('SignupCtrl', function($scope, $location, $auth, toastr, $state) {
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
            toastr.info('You have successfully created a new account but it needs to be activated by an admin!');
            $state.go('login', {}, {reload: true});
        })
        .catch(function(response) {
          toastr.error(response.data.message);
        });
    };
  });