angular.module('MyApp')
  .controller('NavbarCtrl', function($scope, $auth, Account) {
      var ctrl = this;
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
      $scope.isAdmin = function() {
       return localStorage.getItem('843443fdds33');
      };
  });
