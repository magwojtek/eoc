const mongoose = require('mongoose');

const {
  Types: { ObjectId }
} = mongoose;

const Cohort = (demoUserId, userIds) => (isArchived, description, name) => ({
  _id: ObjectId(),
  description,
  isArchived,
  isDeleted: false,
  locks: {
    description: false,
    name: false
  },
  memberIds: [demoUserId, ...userIds],
  name,
  ownerIds: [demoUserId]
});

const generateCohorts = (demoUserId, userIds) => [
  Cohort(demoUserId, userIds)(
    false,
    'You are the owner of this cohort. You can create sacks, add members and manage their permissions, modify and archive cohort.',
    '🏢 Office'
  ),
  Cohort(demoUserId, userIds)(
    false,
    'You are a member of this cohort. You can add sacks, add and invite members.',
    '👨‍👩‍👧‍👦 Family'
  ),
  Cohort(demoUserId, userIds)(
    true,
    'You are a member of this cohort. You can add sacks, add and invite members.',
    '🧗 Climbing team'
  )
];

module.exports = { generateCohorts };
