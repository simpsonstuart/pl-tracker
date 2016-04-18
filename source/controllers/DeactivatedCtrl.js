angular.module('MyApp')
    .controller('DeactivatedCtrl', function($scope, $http, $auth, $state, toastr) {
        var ctrl            = this;
        if (!$auth.isAuthenticated()) { return; }
        $auth.logout()
            .then(function() {
                toastr.info('Your account must be activated by an admin to use it!');
                $state.go('login')
            });
    });