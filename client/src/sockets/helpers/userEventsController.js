import { UserEvents } from 'sockets/enums';
import history from 'common/utils/history';
import { accountStatus, saveAccountData } from 'common/utils/localStorage';
import { accountDeletedRoute } from 'common/utils/helpers';

const userEventsController = (event, data, { dispatch }) => {
  switch (event) {
    case UserEvents.LOGOUT_SUCCESS: {
      saveAccountData(accountStatus.DELETED);
      dispatch({
        type: UserEvents.LOGOUT_SUCCESS
      });
      localStorage.clear();

      return history.replace(accountDeletedRoute());
    }
    default:
      return dispatch({ type: event, payload: data });
  }
};

export default userEventsController;
