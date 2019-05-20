import { checkIfCookieSet } from 'common/utils/cookie';
import { postData, postRequest } from 'common/utils/fetchMethods';
import { MessageType as NotificationType } from 'common/constants/enums';
import { createNotificationWithTimeout } from 'modules/notification/model/actions';

export const AuthorizationActionTypes = Object.freeze({
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_FAILURE: 'LOGOUT_FAILURE',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS'
});

const logoutFailure = () => ({
  type: AuthorizationActionTypes.LOGOUT_FAILURE
});

const logoutSuccess = () => ({
  type: AuthorizationActionTypes.LOGOUT_SUCCESS
});

const loginSuccess = data => ({
  type: AuthorizationActionTypes.LOGIN_SUCCESS,
  payload: data
});

const loginFailure = () => ({
  type: AuthorizationActionTypes.LOGIN_FAILURE
});

export const setCurrentUser = () => {
  const user = JSON.parse(decodeURIComponent(checkIfCookieSet('user')));

  return typeof user === 'object' ? user : null;
};

export const loginUser = () => dispatch =>
  dispatch(loginSuccess(setCurrentUser()));

export const logoutCurrentUser = () => dispatch =>
  postRequest('/auth/logout')
    .then(() => dispatch(logoutSuccess()))
    .catch(err => {
      dispatch(logoutFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        "Oops, we're sorry, logout failed..."
      );
    });

export const loginDemoUser = () => dispatch =>
  postData('/auth/demo', {
    username: 'demo',
    password: 'demo'
  })
    .then(() => {
      dispatch(loginSuccess(setCurrentUser()));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        'Login success'
      );
    })
    .catch(err => {
      dispatch(loginFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        'Login failed'
      );
    });
