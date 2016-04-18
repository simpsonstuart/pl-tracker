angular.module('MyApp')
  .controller('NavbarCtrl', function($scope, $auth, Account) {
      var ctrl = this;
      ctrl.Admin = false;
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
      if ($scope.isAuthenticated()){
          getAuth();
      }
      function getAuth(){
          Account.getProfile()
              .then(function (response) {
                  if (response.data.role === "Admin") {
                      ctrl.Admin = true;
                  } else {
                      ctrl.Admin = false;
                  }
              })
              .catch(function (response) {

              })}
  });
