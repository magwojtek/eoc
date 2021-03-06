import { AuthorizationActionTypes } from './actions';
import { CommonActionTypes } from 'common/model/actionTypes';

const currentUser = (state = null, action) => {
  switch (action.type) {
    case AuthorizationActionTypes.LOGIN_SUCCESS:
      return action.payload;
    case AuthorizationActionTypes.LOGOUT_SUCCESS:
      return null;
    case AuthorizationActionTypes.FETCH_SUCCESS:
      return { ...(state || {}), ...action.payload };
    case AuthorizationActionTypes.UPDATE_SETTINGS_SUCCESS: {
      const { payload: updatedSettings } = action;
      if (state) {
        const { settings = {} } = state || {};

        return {
          ...state,
          settings: { ...settings, ...updatedSettings }
        };
      }

      return state;
    }
    case CommonActionTypes.LEAVE_VIEW: {
      if (state) {
        const {
          activationDate,
          email,
          emailReportsFrequency,
          isPasswordSet,
          ...rest
        } = state;

        return { ...rest };
      }

      return null;
    }
    case AuthorizationActionTypes.UPDATE_NAME_SUCCESS: {
      const { updatedName } = action.payload;

      return { ...state, name: updatedName };
    }

    default:
      return state;
  }
};

export default currentUser;
