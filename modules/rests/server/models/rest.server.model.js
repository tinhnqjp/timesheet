'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Rest Schema
 */
var RestSchema = new Schema({
  // Kind of Rest: 1:有給休暇 / 2:午前半休　/ 3:午後半休 / 4:振替休暇 / 5:特別休暇 / 6:看護休暇 / 7:介護休暇 / 8:生理休暇
  kind: { type: Number, default: 0, required: true },
  // Start vacation
  start: { type: Date },
  // End vacation
  end: { type: Date },
  // Duration of vacation
  duration: { type: Number },
  // Reason of vacation
  description: { type: String },
  // Status of vacation: 1:Not send - 2:Waiting - 3:Cancel - 4:Approved - 5:Rejected - 6:Done
  status: { type: Number },
  // Comment of reviewer
  comment: { type: String },
  // Approved manager/accountant
  approved: { type: Schema.ObjectId, ref: 'User' },
  // Send date
  send: { type: Date, default: Date.now },
  // Create date
  created: { type: Date, default: Date.now },
  historys: [{
    // Action of history 1:Created - 2:Updated - 3:Send - 4:Approved - 5:Rejected - 6:Cancel
    action: { type: Number },
    // Comment of history
    comment: { type: String },
    // Time of history
    timing: { type: Date }
  }],
  // User
  user: { type: Schema.ObjectId, ref: 'User' }
});

RestSchema.plugin(paginate);

RestSchema.statics.addHistory = function (restId, history) {
  return this.findById(restId).exec(function (err, rest) {
    if (err || !rest) return;
    rest.historys.push(history);
    return rest.save();
  });
};

RestSchema.statics.changeStatus = function (restId, status) {
  return this.findById(restId).exec(function (err, rest) {
    if (err || !rest) return;
    rest.status = status;
    return rest.save();
  });
};
mongoose.model('Rest', RestSchema);