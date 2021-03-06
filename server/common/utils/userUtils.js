const bcrypt = require('bcryptjs');
const sanitize = require('mongo-sanitize');

const User = require('../../models/user.model');
const List = require('../../models/list.model');
const Cohort = require('../../models/cohort.model');
const Comment = require('../../models/comment.model');
const Settings = require('../../models/settings.model');
const { isMember, isOwner } = require('../../common/utils');
const { leaveCohort } = require('../../sockets/cohort');
const { leaveList } = require('../../sockets/list');

const findOrCreateUser = async (user, done, policyAcceptedAt) => {
  const { idFromProvider, email } = user;

  try {
    const doc = await User.findOne({
      $or: [{ idFromProvider }, { email }]
    }).exec();

    if (doc) {
      const {
        email: existingEmail,
        idFromProvider: existingIdFromProvider,
        isActive
      } = doc;

      if (existingEmail && !existingIdFromProvider) {
        const { accessToken, avatarUrl, provider } = user;

        /* eslint-disable no-param-reassign */
        doc.accessToken = accessToken;
        doc.avatarUrl = avatarUrl;
        doc.idFromProvider = idFromProvider;
        doc.provider = provider;

        if (!isActive) {
          doc.activatedAt = new Date();
          doc.isActive = true;
          doc.signUpHash = null;
          doc.signUpHashExpirationDate = null;
        }
        /* eslint-enable no-param-reassign */

        const updatedUser = await doc.save();

        return done(null, updatedUser);
      }

      return done(null, doc);
    }

    if (policyAcceptedAt) {
      const newUser = await new User({
        ...user,
        policyAcceptedAt,
        activatedAt: new Date(),
        settings: new Settings()
      }).save();

      return done(null, newUser);
    }

    return done(null, false);
  } catch (error) {
    done(null, false, { message: error.message });
  }
};

/* eslint camelcase: "off" */
const extractUserProfile = (profile, accessToken) => {
  const { email, name, picture } = profile._json;
  const { id } = profile;

  return {
    accessToken,
    avatarUrl: picture,
    displayName: name,
    email,
    idFromProvider: id,
    provider: 'google'
  };
};

const findAndAuthenticateUser = (email, password) => {
  const sanitizedEmail = sanitize(email);

  return User.findOne({ email: sanitizedEmail, isActive: true })
    .lean()
    .exec()
    .then(user => {
      if (user) {
        const { password: dbPassword } = user;

        if (bcrypt.compareSync(password + email, dbPassword)) {
          return user;
        }
      }

      return null;
    });
};

const removeDemoUserData = id =>
  List.find(
    {
      viewersIds: id
    },
    '_id'
  )
    .lean()
    .exec()
    .then(lists => {
      if (lists) {
        const listsIds = lists.map(lists => lists._id);

        return Comment.deleteMany({ listId: { $in: listsIds } }).exec();
      }
    })
    .then(() => List.deleteMany({ viewersIds: id }).exec())
    .then(() => Cohort.deleteMany({ memberIds: id }).exec())
    .then(() => User.deleteOne({ _id: id }).exec())
    .then(() => User.deleteMany({ provider: `demo-${id}` }).exec());

const validatePassword = value => value.match(/^[^\s]{4,32}$/);

const responseWithUserData = user => {
  const { avatarUrl, _id: id, displayName: name, settings: config } = user;
  const data = { avatarUrl, id, name };

  if (config) {
    const { _id, createdAt, updatedAt, ...settings } = config;

    data.settings = settings;
  }

  return data;
};

const checkIfUserIsTheOnlyOwner = async (listModel, cohortModel, userId) => {
  const errors = {};

  const lists = await listModel
    .find(
      {
        $and: [{ ownerIds: userId }, { ownerIds: { $size: 1 } }],
        isDeleted: false,
        'viewersIds.1': { $exists: true }
      },
      'name'
    )
    .lean()
    .exec();

  const cohorts = await cohortModel
    .find(
      {
        $and: [{ ownerIds: userId }, { ownerIds: { $size: 1 } }],
        isDeleted: false,
        'memberIds.1': { $exists: true }
      },
      'name'
    )
    .lean()
    .exec();

  if (lists.length > 0) {
    errors.lists = lists;
  }

  if (cohorts.length > 0) {
    errors.cohorts = cohorts;
  }

  return errors;
};

const deleteAccountDetails = async (userModel, user) => {
  const { _id: userId, createdAt, email } = user;
  const hashedEmail = bcrypt.hashSync(email, 12);
  const removedUser = new User({
    _id: userId,
    createdAt,
    email: hashedEmail,
    updatedAt: new Date()
  });

  await userModel.deleteOne({ email });
  await removedUser.save();
};

const deleteUserLists = async (listModel, userId) =>
  listModel
    .updateMany(
      { viewersIds: userId, 'viewersIds.1': { $exists: false } },
      {
        isArchived: true,
        isDeleted: true
      }
    )
    .exec();

const removeUserFromLists = io => async (listModel, displayName, userId) => {
  const lists = await listModel.find({ viewersIds: userId });
  const listPromises = [];

  lists.forEach(async list => {
    const { _id, memberIds, ownerIds, viewersIds } = list;
    const data = { listId: _id, performer: displayName, userId };

    viewersIds.splice(viewersIds.indexOf(userId), 1);

    if (isMember(list, userId)) {
      memberIds.splice(memberIds.indexOf(userId), 1);
    }

    if (isOwner(list, userId)) {
      ownerIds.splice(ownerIds.indexOf(userId), 1);
    }

    listPromises.push(list.save(), leaveList(io)(data));
  });

  await Promise.all(listPromises);
};

const deleteUserCohorts = async (cohortModel, userId) =>
  cohortModel
    .updateMany(
      { viewersIds: userId, 'memberIds.1': { $exists: false } },
      {
        isArchived: true,
        isDeleted: true
      }
    )
    .exec();

const removeUserFromCohorts = io => async (
  cohortModel,
  displayName,
  userId
) => {
  const cohorts = await cohortModel.find({ memberIds: userId });
  const cohortPromises = [];

  cohorts.forEach(async cohort => {
    const { _id: cohortId, memberIds, ownerIds } = cohort;

    memberIds.splice(memberIds.indexOf(userId), 1);

    if (isOwner(cohort, userId)) {
      ownerIds.splice(ownerIds.indexOf(userId), 1);
    }

    const data = {
      cohortId,
      membersCount: memberIds.length,
      performer: displayName,
      userId
    };

    cohortPromises.push(cohort.save(), leaveCohort(io)(data));
  });

  await Promise.all(cohortPromises);
};

const destroyUserSessions = async (store, userId) => {
  const regexp = new RegExp(
    userId.toString().replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
  );
  const { db } = store;

  await db
    .collection('sessions')
    .find({ session: regexp })
    .forEach(({ _id }) => store.destroy(_id));
};

module.exports = {
  checkIfUserIsTheOnlyOwner,
  deleteAccountDetails,
  deleteUserCohorts,
  deleteUserLists,
  destroyUserSessions,
  extractUserProfile,
  findAndAuthenticateUser,
  findOrCreateUser,
  removeDemoUserData,
  removeUserFromCohorts,
  removeUserFromLists,
  responseWithUserData,
  validatePassword
};
