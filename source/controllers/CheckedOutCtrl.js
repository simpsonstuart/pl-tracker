angular.module('MyApp')
    .controller('CheckedOutCtrl', function($scope, $http, Account, alertify) {
        var ctrl            = this;
        ctrl.selectedSort = 'device_name';
        ctrl.selectedLocation = 'Boise';
        getDevices();

        Account.getProfile()
            .then(function(response) {
                $http.get('/devices').success(function (data) {
                    ctrl.currentUser = response.data.displayName;
                });
            })
            .catch(function(response) {
                toastr.error(response.data.message, response.status);
            });

        //gets list of devices
        function getDevices() {
            $http.get('/devices').then(function (response) {
                ctrl.devicesFiltered = _.reject(response.data, ['checked_out_user', "N/A"]);
                ctrl.filterLocation();
                if (!ctrl.devices.length) {
                    ctrl.showNoCheckouts = true;
                }
            });
        }
        ctrl.filterLocation = function() {
            ctrl.devices = _.filter(ctrl.devicesFiltered, ['location', ctrl.selectedLocation]);
        };
        ctrl.checkInDevice = function (deviceId) {
            alertify.confirm("Are you sure you want to check-in the device?", function (e) {
                if (e) {
                    $http.post('/checkindevice', {id: deviceId}).then(function(data, status) {
                        getDevices();
                        alertify.alert('Device Checked-In');
                    });
                } else {
                }
            });
        };
    });

