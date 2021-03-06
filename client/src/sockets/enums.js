import {
  ListActionTypes,
  ListHeaderStatusType
} from 'modules/list/model/actionTypes';
import {
  CohortActionTypes,
  CohortHeaderStatusTypes
} from 'modules/cohort/model/actionTypes';
import {
  ItemActionTypes,
  ItemStatusType,
  CommentActionTypes
} from 'modules/list/components/Items/model/actionTypes';
import { AuthorizationActionTypes } from 'modules/user/model/actions';
import { enumerable } from 'common/utils/helpers';

export const ItemsEvents = Object.freeze({
  ADD_SUCCESS: ItemActionTypes.ADD_SUCCESS,
  ARCHIVE_SUCCESS: ItemActionTypes.ARCHIVE_SUCCESS,
  CLEAR_VOTE_SUCCESS: ItemActionTypes.CLEAR_VOTE_SUCCESS,
  CLONE_SUCCESS: ItemActionTypes.CLONE_SUCCESS,
  DELETE_SUCCESS: ItemActionTypes.DELETE_SUCCESS,
  MARK_AS_DONE_SUCCESS: ItemActionTypes.MARK_AS_DONE_SUCCESS,
  MARK_AS_UNHANDLED_SUCCESS: ItemActionTypes.MARK_AS_UNHANDLED_SUCCESS,
  RESTORE_SUCCESS: ItemActionTypes.RESTORE_SUCCESS,
  SET_VOTE_SUCCESS: ItemActionTypes.SET_VOTE_SUCCESS,
  UPDATE_SUCCESS: ItemActionTypes.UPDATE_SUCCESS
});

export const ListHeaderEvents = Object.freeze({
  LOCK: ListHeaderStatusType.LOCK,
  UNLOCK: ListHeaderStatusType.UNLOCK
});

export const ListEvents = Object.freeze({
  ADD_MEMBER_ROLE_SUCCESS: ListActionTypes.ADD_MEMBER_ROLE_SUCCESS,
  ADD_OWNER_ROLE_SUCCESS: ListActionTypes.ADD_OWNER_ROLE_SUCCESS,
  ADD_VIEWER_SUCCESS: ListActionTypes.ADD_VIEWER_SUCCESS,
  ARCHIVE_COHORT_SUCCESS: 'list/ARCHIVE_COHORT_SUCCESS',
  ARCHIVE_SUCCESS: ListActionTypes.ARCHIVE_SUCCESS,
  CHANGE_TYPE_SUCCESS: ListActionTypes.CHANGE_TYPE_SUCCESS,
  DELETE_SUCCESS: ListActionTypes.DELETE_SUCCESS,
  FETCH_ARCHIVED_META_DATA_SUCCESS:
    ListActionTypes.FETCH_ARCHIVED_META_DATA_SUCCESS,
  FETCH_META_DATA_SUCCESS: ListActionTypes.FETCH_META_DATA_SUCCESS,
  LEAVE_COHORT: CohortActionTypes.LEAVE_SUCCESS,
  LEAVE_SUCCESS: ListActionTypes.LEAVE_SUCCESS,
  MEMBER_UPDATE_SUCCESS: ListActionTypes.MEMBER_UPDATE_SUCCESS,
  REMOVE_BY_IDS: ListActionTypes.REMOVE_BY_IDS,
  REMOVE_COHORT_MEMBER: CohortActionTypes.REMOVE_MEMBER_SUCCESS,
  REMOVE_MEMBER_ROLE_SUCCESS: ListActionTypes.REMOVE_MEMBER_ROLE_SUCCESS,
  REMOVE_MEMBER_SUCCESS: ListActionTypes.REMOVE_MEMBER_SUCCESS,
  REMOVE_OWNER_ROLE_SUCCESS: ListActionTypes.REMOVE_OWNER_ROLE_SUCCESS,
  RESTORE_SUCCESS: ListActionTypes.RESTORE_SUCCESS,
  UPDATE_SUCCESS: ListActionTypes.UPDATE_SUCCESS
});

export const CohortEvents = Object.freeze({
  ADD_MEMBER_SUCCESS: CohortActionTypes.ADD_MEMBER_SUCCESS,
  ADD_OWNER_ROLE_SUCCESS: CohortActionTypes.ADD_OWNER_ROLE_SUCCESS,
  ARCHIVE_SUCCESS: CohortActionTypes.ARCHIVE_SUCCESS,
  DELETE_SUCCESS: CohortActionTypes.DELETE_SUCCESS,
  FETCH_META_DATA_SUCCESS: CohortActionTypes.FETCH_META_DATA_SUCCESS,
  FETCH_DETAILS_SUCCESS: CohortActionTypes.FETCH_DETAILS_SUCCESS,
  LEAVE_SUCCESS: CohortActionTypes.LEAVE_SUCCESS,
  REMOVE_MEMBER_SUCCESS: CohortActionTypes.REMOVE_MEMBER_SUCCESS,
  REMOVE_OWNER_ROLE_SUCCESS: CohortActionTypes.REMOVE_OWNER_ROLE_SUCCESS,
  RESTORE_SUCCESS: CohortActionTypes.RESTORE_SUCCESS,
  UPDATE_SUCCESS: CohortActionTypes.UPDATE_SUCCESS
});

export const CohortHeaderEvents = Object.freeze({
  LOCK: CohortHeaderStatusTypes.LOCK,
  UNLOCK: CohortHeaderStatusTypes.UNLOCK
});

export const CommentEvents = Object.freeze({
  ADD_SUCCESS: CommentActionTypes.ADD_SUCCESS
});

export const AppEvents = enumerable()('JOIN_ROOM', 'LEAVE_ROOM');

export const UserEvents = Object.freeze({
  LOGOUT_SUCCESS: AuthorizationActionTypes.LOGOUT_SUCCESS
});

export { ItemStatusType };
