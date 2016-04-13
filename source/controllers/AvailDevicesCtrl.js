angular.module('MyApp')
    .controller('AvailDevicesCtrl', function($scope, $http, Account, toastr) {
        var ctrl = this;

        getDevices();

        //gets list of devices
        function getDevices() {
            $http.get('http://localhost:3000/devices').success(function (data) {
                ctrl.devices = _.filter(data, ['checked_out_user', "N/A"]);
            });
        }

        ctrl.checkOutDevice = function (device) {
            Account.getProfile()
                .then(function(response) {
                    ctrl.loggedInUser = response.data.displayName;
                    $http.post('http://localhost:3000/checkout', {id: device._id, checked_out_user: ctrl.loggedInUser}).success(function(data, status) {
                        toastr.info("Checked Out!");
                    });
                })
                .catch(function(response) {
                    toastr.error(response.data.message, response.status);
                });

            getDevices();

        };

    });
