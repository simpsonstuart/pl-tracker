angular.module('MyApp')
  .controller('NavbarCtrl', function($scope, $auth, Account, $templateCache) {
      var ctrl = this;
      getIsAdmin();
      function getIsAdmin () {
          Account.getProfile()
              .then(function (response) {
                  if (localStorage.getItem('843443fdds33') === 'true') {
                      ctrl.authorized = true;
                  }
              })
              .catch(function (response) {
                  console.log('Error getting user role!')
              });
      }
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
  });
