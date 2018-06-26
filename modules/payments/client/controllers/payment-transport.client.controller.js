(function () {
  'use strict';
  // Polls controller
  angular.module('payments')
    .controller('PaymentTransportController', PaymentTransportController);

  PaymentTransportController.$inject = [
    '$scope',
    'FileUploader'
  ];


  function PaymentTransportController($scope, FileUploader) {

    $scope.results = [];
    prepareUpload();

    function prepareUpload() {
      $scope.uploader = new FileUploader({
        url: 'api/payments/receipts',
        alias: 'paymentReceipts'
      });
      $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      $scope.uploader.onBeforeUploadItem = function (item) {
        $scope.uploadingFileName = item._file.name;
      };
      $scope.uploader.onAfterAddingAll = function (addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
      };
      $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
        console.info('onCompleteItem fileItem', fileItem);
        console.info('onCompleteItem response', response);
        console.info('onCompleteItem status', status);
        $scope.results.push(response);
      };
      $scope.uploader.onCompleteAll = function () {
        // $scope.closeThisDialog($scope.results);
      };
    }

    $scope.handleSaveTransport = function() {
      console.log($scope.uploader.queue);
    };
  }
})();
