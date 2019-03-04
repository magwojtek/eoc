import _keyBy from 'lodash/keyBy';

import { ENDPOINT_URL } from 'common/constants/variables';
import { CohortActionTypes } from './actionTypes';
import { getData, patchData, postData } from 'common/utils/fetchMethods';
import { MessageType as NotificationType } from 'common/constants/enums';
import { createNotificationWithTimeout } from 'modules/notification/model/actions';

const createCohortSuccess = data => ({
  type: CohortActionTypes.CREATE_COHORT_SUCCESS,
  payload: data
});

const createCohortFailure = errMessage => ({
  type: CohortActionTypes.CREATE_COHORT_FAILURE,
  errMessage
});

const createCohortRequest = () => ({
  type: CohortActionTypes.CREATE_COHORT_REQUEST
});

const fetchCohortsMetaDataSuccess = data => ({
  type: CohortActionTypes.FETCH_META_DATA_SUCCESS,
  payload: data
});

const fetchCohortsMetaDataFailure = errMessage => ({
  type: CohortActionTypes.FETCH_META_DATA_FAILURE,
  errMessage
});

const fetchCohortsMetaDataRequest = () => ({
  type: CohortActionTypes.FETCH_META_DATA_REQUEST
});

const updateCohortRequest = () => ({
  type: CohortActionTypes.UPDATE_REQUEST
});

const updateCohortSuccess = data => ({
  type: CohortActionTypes.UPDATE_SUCCESS,
  payload: data
});

const updateCohortFailure = err => ({
  type: CohortActionTypes.UPDATE_FAILURE,
  payload: err.message
});

export const createCohort = (name, description, adminId) => dispatch => {
  dispatch(createCohortRequest());
  return postData(`${ENDPOINT_URL}/cohorts/create`, {
    name,
    description,
    adminId
  })
    .then(resp => resp.json())
    .then(json => dispatch(createCohortSuccess(json)))
    .catch(err => {
      dispatch(createCohortFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, creating new cohort failed..."
      );
    });
};

export const fetchCohortsMetaData = () => dispatch => {
  dispatch(fetchCohortsMetaDataRequest());
  return getData(`${ENDPOINT_URL}/cohorts/meta-data`)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchCohortsMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchCohortsMetaDataFailure(err.message));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, fetching cohorts meta data failed..."
      );
    });
};

export const updateCohort = (cohortId, data) => dispatch => {
  dispatch(updateCohortRequest());
  return patchData(`${ENDPOINT_URL}/cohorts/${cohortId}/update`, data)
    .then(resp => resp.json())
    .then(json => {
      dispatch(updateCohortSuccess({ ...data, cohortId }));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.SUCCESS,
        json.message
      );
    })
    .catch(err => {
      dispatch(updateCohortFailure(err));
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        err.message || "Oops, we're sorry, updating cohort failed..."
      );
    });
};
