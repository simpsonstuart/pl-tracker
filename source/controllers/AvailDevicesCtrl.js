angular.module('MyApp')
    .controller('AvailDevicesCtrl', function($scope, $http, Account, toastr, alertify, $mdDialog) {
        var ctrl = this;
        ctrl.selectedSort = 'device_name';
        ctrl.checkoutDurationType ='Hours';
        ctrl.showSecondName = false;
        ctrl.selectedLocation = 'Boise';

        getDevices();

        //gets list of devices
        function getDevices() {
            $http.get('/devices').success(function (data) {
                ctrl.devicesFiltered = _.filter(data, ['checked_out_user', "N/A"]);
                ctrl.filterLocation();
            });
        }
        ctrl.cancel = function() {
            $mdDialog.hide();
        };
        ctrl.checkOutDevice = function (device) {
            ctrl.selectedDevice = device;
            $mdDialog.show({
                contentElement: '#checkoutDevice',
                parent: angular.element(document.body)
            });
        };
        ctrl.runCheckout = function() {
            Account.getProfile()
                .then(function(response) {
                    ctrl.loggedInUser = response.data.displayName;
                    $http.post('/checkout',
                        {
                            id: ctrl.selectedDevice,
                            checked_out_user: ctrl.loggedInUser,
                            duration: ctrl.checkoutDuration,
                            duration_type: ctrl.checkoutDurationType
                        }).success(function(data, status) {
                        getDevices();
                        $mdDialog.hide();
                        alertify.alert('Device Checked Out too ' + ctrl.loggedInUser + '!');
                    });
                })
                .catch(function(response) {
                    toastr.error(response.data.message, response.status);
                });
        };

        ctrl.filterLocation = function() {
            ctrl.devices = _.filter(ctrl.devicesFiltered, ['location', ctrl.selectedLocation]);
        };

    });
