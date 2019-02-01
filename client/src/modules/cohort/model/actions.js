import { CohortActionTypes } from './actionTypes';

// Action creators
const fetchCohortsSuccess = () => ({
  type: CohortActionTypes.FETCH_COHORTS_SUCCESS
});

// Dispatchers
export const fetchCohorts = () => dispatch => dispatch(fetchCohortsSuccess());