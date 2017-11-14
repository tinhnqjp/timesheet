'use strict';

angular.module('core').factory('DateUtil', DateUtil);

DateUtil.$inject = [];
function DateUtil() {
  this.getWorkDays = (start, end) => {
    var duration = end.diff(start, 'days');
    if (duration < 0) {
      return duration;
    }
    if (duration === 0 && (start.day() === 0 || start.day() === 6)) {
      return 0;
    }
    if (duration === 0 && start.day() !== 0 && start.day() !== 6) {
      return 1;
    }
    var cnt = 1;
    var temp;
    for (let index = 1; index <= duration; index++) {
      temp = start.clone().add(index, 'days');
      if (temp.day() !== 0 && temp.day() !== 6) {
        cnt += 1;
      }
    }
    return cnt;
  };
  return this;
}