const express = require('express');

const router = express.Router();
const {
  authenticateCallback,
  checkPolicyAgreement,
  setDemoUser,
  setUser,
  signInWithGoogle,
  signUpWithGoogle
} = require('../config/auth');
const {
  changePassword,
  checkIfDataLeft,
  confirmEmail,
  deleteAccount,
  demoRedirect,
  getAccountDetails,
  getLoggedUser,
  getUserDetails,
  logout,
  prepareItems,
  recoveryPassword,
  resendSignUpConfirmationLink,
  resetPassword,
  sendDeleteAccountMail,
  sendUser,
  signUp,
  updateEmailReportSettings,
  updateName,
  updatePassword
} = require('../controllers/userAuth');
const {
  removeDemoUserChanges
} = require('../middleware/removeDemoUserChanges');
const {
  sendReportOnDemand,
  sendResetPasswordLink,
  sendSignUpConfirmationLink
} = require('../mailer');
const { authorize } = require('../middleware/authorize');

router.post('/demo', setDemoUser, sendUser);
router.get('/demo', setDemoUser, demoRedirect);
router.get('/google/sign-in', signInWithGoogle);
router.get('/google/callback', authenticateCallback);
router.post('/logout', removeDemoUserChanges, logout);
router.post('/sign-up', signUp, sendSignUpConfirmationLink);
router.get('/google/sign-up/:data', checkPolicyAgreement, signUpWithGoogle);
router.get('/confirm-email/:hash', confirmEmail);
router.post('/sign-in', setUser, sendUser);
router.post(
  '/resend-confirmation-link',
  resendSignUpConfirmationLink,
  sendSignUpConfirmationLink
);
router.get('/user', getLoggedUser);
router.post('/reset-password', resetPassword, sendResetPasswordLink);
router.get('/recovery-password/:token?', recoveryPassword);
router.post('/update-password/:token?', updatePassword);
router.get('/user-details', authorize, getUserDetails);
router.post('/change-password', authorize, changePassword);
router.get('/account-details/:token?', getAccountDetails);
router.get('/send-delete-account-mail', authorize, sendDeleteAccountMail);
router.get('/delete-account/:deleteToken?', deleteAccount);
router.get('/send-report', authorize, prepareItems, sendReportOnDemand);
router.post('/email-reports-settings', authorize, updateEmailReportSettings);
router.get('/check-if-data-left', authorize, checkIfDataLeft);
router.post('/change-name', authorize, updateName);

module.exports = router;
