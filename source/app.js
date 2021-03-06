angular.module('MyApp', ['ngResource', 'ngMessages', 'ngAnimate', 'toastr', 'ui.router', 'satellizer', 'ngMaterial', 'ngAlertify', 'ngCsv'])
  .config(function($stateProvider, $urlRouterProvider, $authProvider) {
    $stateProvider
      .state('administration', {
        url: '/administration',
        controller: 'AdministrationCtrl',
        controllerAs: 'ctrl',
        templateUrl: 'partials/administration.html',
          resolve: {
              loginRequired: loginRequired
          }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl',
        resolve: {
          skipIfLoggedIn: skipIfLoggedIn
        }
      })
        .state('available-devices', {
            url: '/available-devices',
            templateUrl: 'partials/available-devices.html',
            controller: 'AvailDevicesCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
        .state('checked-out', {
            url: '/checked-out',
            templateUrl: 'partials/checked-out.html',
            controller: 'CheckedOutCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
        .state('manage-devices', {
            url: '/manage-devices',
            templateUrl: 'partials/manage-devices.html',
            controller: 'ManageDevicesCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
        .state('manage-users', {
            url: '/manage-users',
            templateUrl: 'partials/manage-users.html',
            controller: 'ManageUsersCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
        .state('manage-checkouts', {
            url: '/manage-checkouts',
            templateUrl: 'partials/manage-checkouts.html',
            controller: 'ManageCheckoutsCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
        .state('deactivated', {
            url: '/deactivated',
            templateUrl: 'partials/deactivated.html',
            controller: 'DeactivatedCtrl',
            controllerAs: 'ctrl',
            resolve: {
                loginRequired: loginRequired
            }
        })
      .state('logout', {
        url: '/logout',
        template: null,
        controller: 'LogoutCtrl'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'ctrl',
        resolve: {
          loginRequired: loginRequired
        }
      });

    $urlRouterProvider.otherwise('/available-devices');

    $authProvider.google({
      clientId: '510557559466-p84g6egngrl4m2smhva0v680o6suaf0c.apps.googleusercontent.com'
    });

    $authProvider.github({
      clientId: '9cd73de67627c4c761e1'
    });

    $authProvider.bitbucket({
      clientId: 'pxp9pJU7DhZR2m3FvC'
    });

    function skipIfLoggedIn($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }
  });
