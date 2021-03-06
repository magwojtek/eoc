import _filter from 'lodash/filter';
import _keyBy from 'lodash/keyBy';

import {
  CommentActionTypes,
  ItemActionTypes,
  ItemStatusType
} from 'modules/list/components/Items/model/actionTypes';
import { filterDefined, shouldAnimate } from 'common/utils/helpers';

const comments = (state = {}, action) => {
  switch (action.type) {
    case CommentActionTypes.ADD_SUCCESS: {
      const {
        payload: { comment }
      } = action;

      return { [comment._id]: comment, ...state };
    }
    case CommentActionTypes.FETCH_SUCCESS: {
      const {
        payload: { comments }
      } = action;

      return comments;
    }
    default:
      return state;
  }
};

const items = (state = {}, action) => {
  switch (action.type) {
    case ItemActionTypes.ADD_SUCCESS: {
      const {
        payload: {
          item,
          item: { _id },
          listState
        }
      } = action;
      const items = { [_id]: item, ...state };

      return {
        ...items,
        [_id]: { ...item, animate: shouldAnimate(items, item, listState) }
      };
    }
    case ItemActionTypes.CLONE_SUCCESS: {
      const {
        payload: {
          item,
          item: { _id }
        }
      } = action;

      return { [_id]: { ...item, animate: true }, ...state };
    }
    case ItemActionTypes.SET_VOTE_SUCCESS: {
      const {
        payload: { itemId, isVoted }
      } = action;

      const previousItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...previousItem,
          isVoted: isVoted !== undefined ? isVoted : previousItem.isVoted,
          votesCount: previousItem.votesCount + 1
        }
      };
    }
    case ItemActionTypes.CLEAR_VOTE_SUCCESS: {
      const {
        payload: { itemId, isVoted }
      } = action;

      const previousItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...previousItem,
          isVoted: isVoted !== undefined ? isVoted : previousItem.isVoted,
          votesCount: previousItem.votesCount - 1
        }
      };
    }
    case ItemActionTypes.UPDATE_SUCCESS: {
      const {
        payload: { itemId, updatedData }
      } = action;

      const updatedItem = filterDefined(updatedData);
      const previousItem = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...previousItem,
          ...updatedItem
        }
      };
    }
    case ItemActionTypes.ARCHIVE_SUCCESS: {
      const {
        payload: { itemId, editedBy, listState }
      } = action;
      const archivedItem = {
        ...state[itemId],
        editedBy,
        isArchived: true
      };
      const items = {
        ...state,
        [itemId]: archivedItem
      };

      return {
        ...items,
        [itemId]: {
          ...items[itemId],
          animate: shouldAnimate(items, archivedItem, listState)
        }
      };
    }
    case ItemActionTypes.RESTORE_SUCCESS: {
      const {
        payload: { item, itemId, listState }
      } = action;
      const previousItem = state[itemId];
      const restoredItem = previousItem
        ? { ...previousItem, ...item, isArchived: false }
        : { ...item };

      const items = {
        ...state,
        [itemId]: restoredItem
      };

      return {
        ...items,
        [itemId]: {
          ...restoredItem,
          animate: shouldAnimate(items, restoredItem, listState)
        }
      };
    }
    case ItemActionTypes.FETCH_ARCHIVED_SUCCESS: {
      const {
        payload: { data }
      } = action;

      return { ...state, ...data };
    }
    case ItemActionTypes.REMOVE_ARCHIVED:
      return _keyBy(
        _filter(state, item => !item.isArchived),
        '_id'
      );
    case ItemActionTypes.MOVE_SUCCESS:
    case ItemActionTypes.DELETE_SUCCESS: {
      const {
        payload: { itemId }
      } = action;
      const { [itemId]: deleted, ...rest } = state;

      return rest;
    }
    case ItemStatusType.LOCK:
    case ItemStatusType.UNLOCK: {
      const {
        payload: { itemId, locks }
      } = action;
      const blockedItem = state[itemId];

      if (blockedItem) {
        const { locks: prevLocks } = blockedItem;
        const updatedLocks = filterDefined(locks);

        return {
          ...state,
          [itemId]: {
            ...blockedItem,
            locks: { ...prevLocks, ...updatedLocks }
          }
        };
      }

      return state;
    }
    case ItemActionTypes.MARK_AS_DONE_SUCCESS: {
      const { itemId, editedBy, listState } = action.payload;
      const item = { ...state[itemId], editedBy, done: true };
      const items = { ...state, [itemId]: item };

      return {
        ...items,
        [itemId]: {
          ...items[itemId],
          animate: shouldAnimate(items, item, listState)
        }
      };
    }
    case ItemActionTypes.MARK_AS_UNHANDLED_SUCCESS: {
      const { itemId, editedBy, listState } = action.payload;
      const item = { ...state[itemId], editedBy, done: false };
      const items = { ...state, [itemId]: item };

      return {
        ...items,
        [itemId]: {
          ...items[itemId],
          animate: shouldAnimate(items, item, listState)
        }
      };
    }
    case ItemActionTypes.DISABLE_ANIMATIONS_SUCCESS: {
      const {
        payload: { itemId }
      } = action;

      return { ...state, [itemId]: { ...state[itemId], animate: false } };
    }
    case CommentActionTypes.ADD_SUCCESS:
    case CommentActionTypes.FETCH_SUCCESS: {
      const {
        payload: { itemId }
      } = action;
      const { comments: previousComments } = state[itemId];

      return {
        ...state,
        [itemId]: {
          ...state[itemId],
          comments: comments(previousComments, action)
        }
      };
    }
    default:
      return state;
  }
};

export default items;
