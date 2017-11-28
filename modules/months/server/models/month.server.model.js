'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Month Schema
 */
var MonthSchema = new Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  // 1-Unsend, 2-Watting, 3-Approve, 4-Reject
  status: { type: Number, default: 1 },
  historys: [{
    // Action of history 1:Created - 2:Updated - 3:Send - 4:Approved - 5:Rejected - 6:Using
    action: { type: Number },
    // Comment of history
    comment: { type: String },
    // Time of history
    timing: { type: Date },
    // Owner
    user: { type: Schema.ObjectId, ref: 'User' },
  }],
  workDate: [{
    date: { type: Number, required: true },
    content: { type: String, trim: true }, // 業務内容
    start: { type: String, default: '' }, // 開始
    end: { type: String, default: '' }, // 終了
    middleRest: { type: Number, default: 1 }, // 休憩 (hour)
    overtime: { type: Number, default: 0 }, // 時間外
    late: { type: Number, default: 0 }, // 深夜
    rest: { type: Schema.ObjectId, ref: 'Rest' }, // 休日形態
    transfer: { type: Boolean, default: false }, // 振替
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
  }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
MonthSchema.plugin(paginate);

mongoose.model('Month', MonthSchema);