import { fail } from "assert";

(function () {
  'use strict';

  // Rests controller
  angular
    .module('rests')
    .controller('RestInputController', RestInputController);

  RestInputController.$inject = ['$scope', '$state', 'restResolve', 'HolidaysService', 'DateUtil'];

  function RestInputController($scope, $state, rest, HolidaysService, DateUtil) {
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
      prepareCalendar();
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
    function prepareCalendar() {
      vm.calendar = { view: 'month' };
      vm.calendar.viewDate = moment().startOf('month').toDate();
      vm.calendar.isOpenCalendar = false;
      vm.calendar.cellModifier = function (cell) {
        console.log(cell);
        // if (cell.label % 2 === 1 && cell.inMonth) {
        //   cell.cssClass = 'odd-cell';
        // }
        // cell.label = '-' + cell.label + '-';
      };
    }

    vm.handleSaveRest = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.restForm');
        return false;
      }
      console.log(vm.rest);
    };
    vm.handleRestRangeChanged = () => {
      if (!vm.rest.start || !vm.rest.end) {
        vm.rest.duration = 0;
        return;
      }
      var start = moment(vm.rest.start);
      var end = moment(vm.rest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (duration < 0) {
        $scope.handleShowToast('開始日または終了日が間違います。', true);
        vm.rest.duration = 0;
        return;
      }
      vm.rest.duration = duration;
      // var duration = end.diff(start, 'days');
      // if (duration < 0) {
      //   $scope.handleShowToast('開始日または終了日が間違います。', true);
      //   return;
      // }
      // if (duration === 0) {
      //   vm.rest.duration = duration + 1;
      //   return;
      // }
      // var workDateCount = 0;
      // var temp;
      // for (let index = 1; index <= duration; index++) {
      //   temp = start.clone().add(index, 'days');
      //   if (date.getDay() !== 0 && date.getDay() !== 6) {
      //     workDateCount += 1;
      //   }
      // }
      //vm.rest.duration = DateUtil.getWorkDays(start, end);

    };
    vm.handleChangeRestDuration = () => {
      if (!vm.rest.start || !vm.rest.end) {
        vm.rest.duration = 0;
        return;
      }
      if (vm.rest.duration <= 0) {
        $scope.handleShowToast('休暇の期間が無効になっています。', true);
        vm.handleRestRangeChanged();
        return;
      }
      var start = moment(vm.rest.start);
      var end = moment(vm.rest.end);
      var duration = DateUtil.getWorkDays(start, end);
      if (vm.rest.duration > duration) {
        vm.rest.duration = duration;
        $scope.handleShowToast('期間が超えています。', true);
        return;
      }
      if (vm.rest.duration < (duration - 0.5)) {
        vm.rest.duration = duration - 0.5;
        $scope.handleShowToast('期間が間違います。', true);
        return;
      }
    };
    vm.disableWeekend = (date, mode) => {
      return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

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