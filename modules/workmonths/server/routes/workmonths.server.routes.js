'use strict';

/**
 * Module dependencies
 */
var workmonthsPolicy = require('../policies/workmonths.server.policy'),
  workmonths = require('../controllers/workmonths.server.controller');

module.exports = function(app) {
  // Workmonths Routes
  app.route('/api/workmonths').all(workmonthsPolicy.isAllowed)
    .get(workmonths.list)
    .post(workmonths.create);

  app.route('/api/workmonths/:workmonthId').all(workmonthsPolicy.isAllowed)
    .get(workmonths.read)
    .put(workmonths.update)
    .delete(workmonths.delete);

  // Finish by binding the Workmonth middleware
  app.param('workmonthId', workmonths.workmonthByID);
};