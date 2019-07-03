const sanitize = require('mongo-sanitize');
const validator = require('validator');
const _some = require('lodash/some');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const BadRequestException = require('../common/exceptions/BadRequestException');
const User = require('../models/user.model');

const sendUser = (req, resp) => {
  const { avatarUrl, _id: id, displayName: name } = req.user;

  resp.cookie('user', JSON.stringify({ avatarUrl, id, name }));
  resp.redirect('/');
};

const logout = (req, resp) => {
  req.session.destroy(() => {
    req.logout();

    resp.clearCookie('connect.sid');
    resp.clearCookie('user');
    resp.clearCookie('demo');
    resp.redirect('/');
  });
};

const sendDemoUser = (req, resp) => {
  const { avatarUrl, _id: id, displayName: name } = req.user;

  resp.cookie('user', JSON.stringify({ avatarUrl, id, name }));
  resp.cookie('demo', true);
  resp.redirect('/');
};

const signUp = (req, resp, next) => {
  const { email, password, passwordConfirm, username } = req.body;
  const sanitizedEmail = sanitize(email);
  const sanitizedUsername = sanitize(username);
  const errors = {};
  const { isEmail, isLength, matches } = validator;

  if (!isLength(sanitizedUsername, { min: 1, max: 32 })) {
    errors.nameError = true;
  }

  if (!isEmail(sanitizedEmail)) {
    errors.emailError = true;
  }

  if (!matches(password, /^[^\s]{4,32}$/)) {
    errors.passwordError = true;
  }

  if (password !== passwordConfirm) {
    errors.confirmPasswordError = true;
  }

  if (_some(errors, error => error !== undefined)) {
    return resp.status(406).send(errors);
  }

  User.findOne({ email: sanitizedEmail })
    .exec()
    .then(user => {
      if (user) {
        const { _id, displayName, email, idFromProvider, isActive } = user;

        if (!idFromProvider && !isActive) {
          const signUpHash = crypto.randomBytes(32).toString('hex');
          const expirationDate = new Date().getTime() + 3600000;

          return User.findOneAndUpdate(
            { _id },
            { signUpHash, signUpHashExpirationDate: expirationDate }
          )
            .exec()
            .then(user => {
              if (!user) {
                throw new Error();
              }

              return { displayName, email, signUpHash };
            });
        }

        throw new BadRequestException(
          'authorization.actions.sign-up.user-already-exist'
        );
      }

      const hashedPassword = bcrypt.hashSync(password + email, 12);
      const signUpHash = crypto.randomBytes(32).toString('hex');
      const expirationDate = new Date().getTime() + 3600000;
      const newUser = new User({
        displayName: sanitizedUsername,
        email: sanitizedEmail,
        isActive: false,
        password: hashedPassword,
        signUpHash,
        signUpHashExpirationDate: expirationDate
      });

      return newUser.save().then(user => {
        const { displayName, email, signUpHash } = user;

        return { displayName, email, signUpHash };
      });
    })
    .then(dataToSend => {
      // eslint-disable-next-line no-param-reassign
      resp.locals = dataToSend;

      return next();
    })
    .catch(err => {
      if (err instanceof BadRequestException) {
        const { message } = err;

        return resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

const confirmEmail = (req, resp) => {};

const resetPassword = (req, resp, next) => {
  const { email } = req.body;
  const sanitizedEmail = sanitize(email);
  const { isEmail } = validator;

  if (!isEmail(sanitizedEmail)) {
    return resp.sendStatus(406);
  }

  User.findOne({ email: sanitizedEmail })
    .exec()
    .then(user => {
      if (!user) {
        throw new Error('authorization.actions.reset');
      }

      const { displayName, isActive, idFromProvider } = user;

      if (idFromProvider) {
        throw new Error('authorization.actions.reset');
      }

      if (!isActive) {
        throw new Error(
          'authorization.actions.reset-password-not-active-account'
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpirationDate = new Date().getTime() + 3600000;

      return User.findOneAndUpdate(
        {
          email: sanitizedEmail
        },
        { resetToken, resetTokenExpirationDate }
      )
        .exec()
        .then(() => {
          // eslint-disable-next-line no-param-reassign
          resp.locales = {
            displayName,
            email,
            resetToken
          };

          next();
        });
    })
    .catch(err => {
      const { message } = err;

      if (message) {
        return resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

const updatePassword = (req, resp) => {
  const { token } = req.params;
  const { password: updatedPassword } = req.body;
  const sanitizedToken = sanitize(token);
  const { matches } = validator;

  if (!matches(updatedPassword, /^[^\s]{4,32}$/)) {
    return resp.status(400).send({ message: 'wrong-password' });
  }

  User.findOne({ resetToken: sanitizedToken })
    .exec()
    .then(user => {
      if (!user) {
        // Wrong token passed, no user found
        throw new Error();
      }

      const { resetTokenExpirationDate, email } = user;
      const today = new Date().getTime();

      if (resetTokenExpirationDate >= today) {
        const hashedPassword = bcrypt.hashSync(updatedPassword + email, 12);

        return User.findOneAndUpdate(
          { resetToken: sanitizedToken },
          {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpirationDate: null
          },
          { new: true }
        ).exec();
      }

      throw new Error('authorization.actions.reset-link-expired');
    })
    .then(() => resp.sendStatus(200))
    .catch(err => {
      const { message } = err;

      if (message) {
        resp.status(400).send({ message });
      }

      resp.sendStatus(400);
    });
};

module.exports = {
  confirmEmail,
  logout,
  resetPassword,
  sendDemoUser,
  sendUser,
  signUp,
  updatePassword
};
