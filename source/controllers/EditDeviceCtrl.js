angular.module('MyApp')
    .controller('EditDeviceCtrl', function($scope, $http, $state, $stateParams) {
      var ctrl = this;
        ctrl.deviceData = $stateParams.device;
        console.log(ctrl.deviceData);
        //saves updated data
        ctrl.saveUpdatedData = function () {
            $http.post('/updatedevices', {
                id: ctrl.deviceData._id,
                device_name: ctrl.deviceData.device_name,
                device_type: ctrl.deviceData.device_type,
                device_sn: ctrl.deviceData.device_sn,
                device_manufacturer: ctrl.deviceData.device_manufacturer,
                device_model: ctrl.deviceData.device_model,
                sw_version: ctrl.deviceData.sw_version,
                screen_resolution: ctrl.deviceData.screen_resolution,
                device_ram: ctrl.deviceData.device_ram
            }).success(function (data, status) {
            });
            $state.go('device-inventory');
        };

        ctrl.cancel = function () {
            $state.go('device-inventory');
        };
        ctrl.ForceCheckIn = function () {
            $http.post('/checkindevice', {id: ctrl.deviceData._id}).success(function(data, status) {
                $state.go('device-inventory');
            });
        };
    });