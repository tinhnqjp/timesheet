(function () {
  'use strict';

  // Workdates controller
  angular
    .module('workdates')
    .controller('WorkdatesController', WorkdatesController);

  WorkdatesController.$inject = ['$scope', '$state', '$window', 'workdateResolve', 'ngDialog', 'NumberUtil', 'Constant', 'CommonService', 'WorkmonthsApi'];

  function WorkdatesController($scope, $state, $window, workdate, ngDialog, NumberUtil, Constant, CommonService, WorkmonthsApi) {
    var vm = this;

    vm.Constant = Constant;

    vm.workdate = workdate;
    console.log(vm.workdate);
    vm.date = moment().year(vm.workdate.workmonth.year).month(vm.workdate.month - 1).date(vm.workdate.date);

    vm.busy = false;

    vm.handleViewWorkrest = () => {
      $scope.workrests = vm.workdate.workrests;
      var mDialog = ngDialog.open({
        template: 'workrests_list.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        delete $scope.workrests;
      });
    };

    vm.handleSetDefaultWorkdateInfo = () => {
      vm.workdate.start = '09:00';
      vm.workdate.end = '17:30';
      vm.workdate.middleRest = 60;
      vm.handleChangedInput();
    };

    vm.handleClearWorkdateInfo = () => {
      vm.workdate.content = '';
      vm.workdate.start = '';
      vm.workdate.end = '';
      vm.workdate.middleRest = '';
      vm.workdate.overtime = 0;
      vm.workdate.overnight = 0;
    };

    vm.handleSaveWorkdate = () => {
      var isError = false;
      vm.error = {};
      if (CommonService.isStringEmpty(vm.workdate.start) && CommonService.isStringEmpty(vm.workdate.end) && CommonService.isStringEmpty(vm.workdate.content) && CommonService.isStringEmpty(vm.workdate.middleRest)) {
        return;
      } else if (!CommonService.isStringEmpty(vm.workdate.start) && !CommonService.isStringEmpty(vm.workdate.end) && CommonService.isStringEmpty(vm.workdate.content) && CommonService.isStringEmpty(vm.workdate.middleRest)) {
        isError = false;
      } else {
        if (CommonService.isStringEmpty(vm.workdate.start)) {
          vm.error.start = { error: true, message: '開始時間を入力してください！' };
          isError = true;
        }
        if (CommonService.isStringEmpty(vm.workdate.end)) {
          vm.error.end = { error: true, message: '終了時間を入力してください！' };
          isError = true;
        }
        if (CommonService.isStringEmpty(vm.workdate.content)) {
          vm.error.content = { error: true, message: '作業内容を入力してください！' };
          isError = true;
        }
        if (CommonService.isStringEmpty(vm.workdate.middleRest)) {
          vm.error.middleRest = { error: true, message: '休憩時間を入力してください！' };
          isError = true;
        }
      }
      if (isError) return;
      // Verify Start
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid()) {
        vm.error.start = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (!moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        vm.error.end = { error: true, message: '時間フォーマットが違います！' };
        isError = true;
      }
      if (isError) return;

      // Verify ENd
      // Verify 
    };

    vm.handleChangedInput = () => {
      if (CommonService.isStringEmpty(vm.workdate.start) || CommonService.isStringEmpty(vm.workdate.end) || CommonService.isStringEmpty(vm.workdate.middleRest)) return;
      if (!moment(vm.workdate.start, 'HH:mm', true).isValid()) {
        return;
      }
      if (!moment(vm.workdate.end, 'HH:mm', true).isValid()) {
        return;
      }

      // Tính thời gian có mặt ở công ty
      var start = moment(vm.workdate.start, 'HH:mm');
      var end = moment(vm.workdate.end, 'HH:mm');
      var overnightStart = moment(Constant.overnightStart, 'HH:mm');
      var overnightEnd = moment(Constant.overnightEnd, 'HH:mm');

      // Tổng thời gian có mặt tại công ty trong ngày
      var work_duration = 0;
      // Thời gian làm thêm giờ
      var overtime_duration = 0;
      // Thời gian làm đềm (từ mốc giờ đã set trước)
      var overnight_duration = 0;
      // Thời gian nghỉ giải lao
      var rest_duration = 0;

      // Thời gian làm việc từ lúc bắt đầu đến lúc tính overnight
      var before_overnight_duration = 0;
      // Thời gian làm việc từ lúc bắt đầu tính overnight đến nữa đêm
      var overnight_to_midnight_duration = 0;
      // Thời gian làm việc từ lúc nữa đêm đến kết thúc tính overnight
      var midnight_to_endovertime_duration = 0;
      // Thời gian làm việc từ lúc nữa đêm đến kết thúc tính overnight
      var endovertime_to_end_duration = 0;
      // Thời gian làm việc từ nửa đêm đến kết thúc
      var midnight_to_end_duration = 0;
      // Thời gian tính làm việc tiêu chuẩn trong 1 ngày
      var work_range = 0;
      // Tính thời gian nghỉ giải lao
      rest_duration = NumberUtil.precisionRound(vm.workdate.middleRest / 60, 1);

      // Nếu là ngày bình thường (ngày nghỉ = 0)
      if (!vm.workdate.isHoliday) {
        work_range = Constant.workRange;
      }

      // Trường hợp End nhỏ hơn start (làm qua đêm)
      if (end.isBefore(start) || end.isSame(start)) {
        // Mốc thời gian kết thúc 1 ngày
        var temp_max = moment('24:00', 'HH:mm');
        // Mốc thời gian bắt đầu 1 ngày
        var temp_min = moment('00:00', 'HH:mm');
        // Tính thời gian làm việc từ lúc bắt đầu đến thời điểm tính overnight
        before_overnight_duration = overnightStart.diff(start, 'hours', true);
        // Tính thời gian làm việc từ lúc overnight đến nữa đêm
        overnight_to_midnight_duration = temp_max.diff(overnightStart, 'hours', true);

        // Tính trường hợp kết thúc trước khi hết tính overnight
        if (end.isBefore(overnightEnd) || end.isSame(overnightEnd)) {
          // Tính thời gian làm giệc từ lúc nữa đêm đến khi kết thúc
          midnight_to_end_duration = end.diff(temp_min, 'hours', true);
          // Thời gian overnight
          overnight_duration = overnight_to_midnight_duration + midnight_to_end_duration;
          // Tính tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - rest_duration - work_range - overnight_duration, 1);
        } else {
          // Tính thời gian từ nửa đêm đến thời điểm kết thúc ovetnight
          midnight_to_endovertime_duration = overnightEnd.diff(temp_min, 'hours', true);
          // Tính thời gian từ lúc kết thúc overnight đến khi về
          endovertime_to_end_duration = end.diff(overnightEnd, 'hours', true);
          // Thời gian overnight
          overnight_duration = overnight_to_midnight_duration + midnight_to_endovertime_duration;
          // Tính tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration + endovertime_to_end_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - rest_duration - work_range - overnight_duration, 1);
        }
      } else {
        // Trường hợp kết thúc trước thời gian tính overnight
        if (end.isBefore(overnightStart) || end.isSame(overnightStart)) {
          // Thời gian làm việc cả ngày
          work_duration = end.diff(start, 'hours', true);
          // Thời gian overnight
          overnight_duration = 0;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - rest_duration - work_range - overnight_duration, 1);
        } else {
          // Trường hợp kết thúc trong khoảng overnight đến nữa đêm
          // Tính thời gian bắt đầu đến lúc overnight
          before_overnight_duration = overnightStart.diff(start, 'hours', true);
          // Tính thời gian từ lúc overnight đến lúc kết thúc
          overnight_duration = end.diff(overnightStart, 'hours', true);
          // Tổng thời gian làm việc trong ngày
          work_duration = before_overnight_duration + overnight_duration;
          // Tính thời gian làm thêm giờ
          overtime_duration = NumberUtil.precisionRound(work_duration - rest_duration - work_range - overnight_duration, 1);
        }
      }

      vm.workdate.overtime = overtime_duration;
      vm.workdate.overnight = overnight_duration;
    };

    vm.handleCompensatoryOff = () => {
      if (vm.busy) {
        vm.workdate.transfer = !vm.workdate.transfer;
        return;
      }

      if (!vm.workdate.transfer) return;

      // Trường hợp ngày này đã có đăng ký ngày nghỉ trước
      if (vm.workdate.workrests.length > 0) {
        $scope.handleShowToast('当日は既に休暇が登録されました。', true);
        vm.workdate.transfer = false;
        return;
      }
      // Kiểm tra hôm nay là ngày nghỉ, ngày lễ
      if (vm.workdate.isHoliday) {
        $scope.handleShowToast('当日は既に休暇が登録されました。', true);
        vm.workdate.transfer = false;
        return;
      }
      // Kiểm tra trong tháng có tồn tại ngày cuối tuần có đi làm không
      var workmonthId = vm.workdate.workmonth._id || vm.workdate.workmonth;
      vm.busy = true;
      WorkmonthsApi.getHolidayWorking(workmonthId)
        .success(res => {
          if (res.length === 0) {
            $scope.handleShowToast('今月は休日に出勤したことがありません。', true);
            vm.workdate.transfer = false;
            vm.busy = false;
          } else {
            $scope.workdates = res;
            ngDialog.openConfirm({
              templateUrl: 'workdates_list.html',
              scope: $scope
            }).then(workdateId => {
              if (!workdateId) {
                vm.workdate.transfer = false;
              } else {
                vm.workdate.transfer_workdate = workdateId;
              }
              delete $scope.workdates;
              vm.busy = false;
            });
          }
        })
        .error(err => {
          $scope.handleShowToast(err.message, true);
        });
    };

    function selectedWorkdate(workdateId) {
      
    }
    vm.handlePreviousScreen = handlePreviousScreen;
    function handlePreviousScreen() {
      var state = $state.previous.state.name || 'workmonths.view';
      var params = state === 'workmonths.view' ? { workmonthId: vm.workdate.workmonth._id } : $state.previous.params;
      $state.go(state, params);
    }

  }
}());
