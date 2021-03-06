(function () {
  'use strict';

  angular
    .module('messages')
    .controller('MessagesListController', MessagesListController);

  MessagesListController.$inject = ['$scope', 'Messages'];

  function MessagesListController($scope, Messages) {
    var vm = this;

    // Infinity scroll
    vm.messages = [];
    vm.page = 1;
    vm.busy = false;
    vm.stopped = false;
    vm.new = false;

    onCreate();
    function onCreate() {
      prepareScopeListener();
      handleLoadMessages();
    }
    function prepareScopeListener() {
      $scope.$on('messages', function (event, args) {
        vm.new = true;
        if (!$scope.$$phase) $scope.$digest();
      });
    }
    vm.handleLoadMessages = handleLoadMessages;
    function handleLoadMessages() {
      if (vm.stopped || vm.busy) return;
      vm.busy = true;

      Messages.load(vm.page)
        .success(function (_messages) {
          if (!_messages.length || _messages.length === 0) {
            vm.stopped = true;
            vm.busy = false;
          } else {
            vm.messages = _.union(vm.messages, _messages);
            vm.page += 1;
            vm.busy = false;
            if (_messages.length < 20) vm.stopped = true;
          }
          if (!$scope.$$phase) $scope.$digest();
        })
        .error(function (err) {
          $scope.handleShowToast(err, true);
        });
    }
    vm.handleClearAllMessages = function () {
      $scope.handleShowConfirm({
        message: '全てのメッセージを削除しますか？'
      }, function () {
        Messages.clear();
        vm.messages = [];
        vm.stopped = true;
        vm.page = 1;
        if (!$scope.$$phase) $scope.$digest();
      });
    };
    vm.handleRemoveMessage = function (message) {
      $scope.handleShowConfirm({
        message: 'メッセージを削除しますか？'
      }, function () {
        Messages.remove(message._id);
        vm.messages = _.without(vm.messages, message);
        if (!$scope.$$phase) $scope.$digest();
      });
    };
  }
}());
