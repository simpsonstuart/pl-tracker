angular.module('MyApp')
    .controller('AddDeviceCtrl', function($scope, $http, $state) {
        var ctrl = this;
        
        //saves data for add new screen
        ctrl.saveData = function() {
            $http.post('http://localhost:3000/savedevices', { device_name: ctrl.device_name, device_type: ctrl.device_type, device_sn: ctrl.device_sn, device_manufacturer: ctrl.device_manufacturer, device_model: ctrl.device_model, sw_version: ctrl.sw_version, screen_resolution: ctrl.screen_resolution, device_ram: ctrl.device_ram, checked_out_user: 'N/A'}).success(function(data, status) {
            });
            $state.go('device-inventory');
        };

        ctrl.cancel = function () {
            $state.go('device-inventory');
        };
    });