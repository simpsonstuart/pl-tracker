angular.module('MyApp')
    .controller('AvailDevicesCtrl', function($scope, $http, Account, toastr) {
        var ctrl = this;
        ctrl.selectedSort = 'device_name';

        getDevices();

        //gets list of devices
        function getDevices() {
            $http.get('/devices').success(function (data) {
                ctrl.devices = _.filter(data, ['checked_out_user', "N/A"]);
            });
        }

        ctrl.checkOutDevice = function (device) {
            Account.getProfile()
                .then(function(response) {
                    ctrl.loggedInUser = response.data.displayName;
                    $http.post('/checkout', {id: device._id, checked_out_user: ctrl.loggedInUser}).success(function(data, status) {
                        getDevices();
                        toastr.info("Checked Out!");
                    });
                })
                .catch(function(response) {
                    toastr.error(response.data.message, response.status);
                });

        };

    });
