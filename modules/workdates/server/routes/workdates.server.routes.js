'use strict';

/**
 * Module dependencies
 */
var workdatesPolicy = require('../policies/workdates.server.policy'),
  workdates = require('../controllers/workdates.server.controller');

module.exports = function (app) {
  // Workdates Routes
  app.route('/api/workdates').all(workdatesPolicy.isAllowed)
    .get(workdates.list)
    .post(workdates.create);

  app.route('/api/workdates/:workdateId').all(workdatesPolicy.isAllowed)
    .get(workdates.read)
    .put(workdates.update)
    .delete(workdates.delete);

  app.route('/api/workdates/:workdateId/workrests').post(workdates.workrests);
  app.route('/api/workdates/:workdateId/add_comment').post(workdates.addComment);
  // Finish by binding the Workdate middleware
  app.param('workdateId', workdates.workdateByID);
};
