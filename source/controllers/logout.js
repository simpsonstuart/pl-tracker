angular.module('MyApp')
  .controller('LogoutCtrl', function($location, $auth, toastr, $state) {
    if (!$auth.isAuthenticated()) { return; }
    $auth.logout()
      .then(function() {
        toastr.info('You have been logged out');
          
          $state.go('login');
      });
  });