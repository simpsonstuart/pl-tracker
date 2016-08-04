angular.module('MyApp')
    .controller('CheckedOutCtrl', function($scope, $http) {
        var ctrl            = this;
        ctrl.selectedSort = 'device_name';
        getDevices();

        //gets list of devices
        function getDevices() {
            $http.get('/devices').success(function (data) {
                ctrl.devices = _.reject(data, ['checked_out_user', "N/A"]);
                if (!ctrl.devices.length) {
                    ctrl.showNoCheckouts = true;
                }
            });
        }
    });

