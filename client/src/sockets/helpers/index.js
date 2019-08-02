import { ListEvents } from 'sockets/enums';
import history from 'common/utils/history';
import { ListActionTypes } from '../../modules/list/model/actionTypes';

export const listEventsController = (event, data, dispatch) => {
  switch (event) {
    case ListEvents.LEAVE_ON_TYPE_CHANGE_SUCCESS: {
      const { cohortId, isCohortMember, listId } = data;

      dispatch({ type: ListEvents.DELETE_SUCCESS, payload: listId });

      return history.replace(
        `/${isCohortMember ? `cohort/${cohortId}` : 'dashboard'}`
      );
    }
    case ListEvents.REMOVE_BY_SOMEONE: {
      const { cohortId, listId } = data;

      dispatch({ type: ListEvents.DELETE_SUCCESS, payload: listId });

      return history.replace(cohortId ? `/cohort/${cohortId}` : '/dashboard');
    }
    case ListEvents.ARCHIVE_SUCCESS: {
      const { cohortId, listId, isGuest } = data;

      dispatch({ type: ListActionTypes.DELETE_SUCCESS, payload: listId });

      return history.replace(
        isGuest || !cohortId ? '/dashboard' : `/cohort/${cohortId}`
      );
    }
    case ListEvents.DELETE_AND_REDIRECT: {
      const { cohortId, listId } = data;

      dispatch({ type: ListActionTypes.DELETE_SUCCESS, payload: listId });

      return history.replace(cohortId ? `/cohort/${cohortId}` : '/dashboard');
    }
    case ListEvents.RESTORE_AND_REDIRECT: {
      const { listId, listData } = data;

      dispatch({
        type: ListActionTypes.RESTORE_SUCCESS,
        payload: { data: listData, listId }
      });

      return history.replace(`/sack/${listId}`);
    }
    default:
      return dispatch({ type: event, payload: data });
  }
};
