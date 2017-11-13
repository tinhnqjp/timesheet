(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestInputController', RestInputController);

  RestInputController.$inject = ['$scope', '$state', 'restResolve', 'HolidaysService'];

  function RestInputController($scope, $state, rest, HolidaysService) {
    var vm = this;
    vm.rest = rest;
    vm.form = {};

    onCreate();
    function onCreate() {
      if (!vm.rest._id) {
        // Set status is Not send
        vm.rest.status = 1;
        vm.rest.duration = 0;
      }
      prepareHodidays();
      prepareParams();
    }

    function prepareParams() {
    }
    function prepareHodidays() {
      HolidaysService.query().$promise.then(function (result) {
        vm.holidays = result;
        vm.rest.holiday = (vm.rest._id) ? vm.rest.holiday._id || vm.rest.holiday : vm.holidays[0]._id || undefined;
      });
    }
    function prepareScopeListener() {
      $scope.$on('$destroy', function () {
      });
    }

    vm.handleRestRangeChanged = () => {
      if (!vm.rest.start || !vm.rest.end) {
        vm.rest.duration = 0;
        return;
      }
      var start = moment(vm.rest.start);
      var end = moment(vm.rest.end);
      var duration = end.diff(start, 'days');
      if (duration < 0) {
        $scope.handleShowToast('開始日または終了日が間違います。', true);
        return;
      }
      vm.rest.duration = duration + 1;
    };
    vm.handleChangeRestDuration = () => {
      
    }

    // Save Rest
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.rest._id) {
        vm.rest.$update(successCallback, errorCallback);
      } else {
        vm.rest.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rests.view', {
          restId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }

  }
}());
