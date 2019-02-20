const mongoose = require('mongoose');

const { Schema } = mongoose;

const CohortSchema = new Schema(
  {
    adminIds: [String],
    description: { type: String },
    listIds: [String],
    memberIds: [String],
    name: { type: String, required: true }
  },
  { timestamps: { createdAt: 'createdAt' }, collection: 'cohorts' }
);

module.exports = mongoose.model('Cohort', CohortSchema);
