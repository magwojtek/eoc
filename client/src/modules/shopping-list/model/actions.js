import _keyBy from 'lodash/keyBy';

import { ENDPOINT_URL } from 'common/constants/variables';
import {
  getData,
  postData,
  deleteData,
  onFetchError
} from 'common/utils/fetchMethods';
import { ShoppingListActionTypes } from './actionTypes';
import { MessageType as NotificationType } from 'common/constants/enums';
import { createNotificationWithTimeout } from 'modules/notification/model/actions';

// Action creators
const fetchProductsFailure = errMessage => ({
  type: ShoppingListActionTypes.FETCH_PRODUCTS_FAILURE,
  payload: errMessage
});
export const fetchProductsSuccess = (json, listId) => ({
  type: ShoppingListActionTypes.FETCH_PRODUCTS_SUCCESS,
  payload: { products: json, listId }
});

const fetchProductRequest = () => ({
  type: ShoppingListActionTypes.FETCH_PRODUCTS_REQUEST
});

const createNewShoppingListSuccess = data => ({
  type: ShoppingListActionTypes.CREATE_SHOPPING_LIST_SUCCESS,
  payload: data
});

const createNewShoppingListFailure = errMessage => ({
  type: ShoppingListActionTypes.CREATE_SHOPPING_LIST_FAILURE,
  payload: errMessage
});

const createNewShoppingListRequest = () => ({
  type: ShoppingListActionTypes.CREATE_SHOPPING_LIST_REQUEST
});

const deleteListSuccess = id => ({
  type: ShoppingListActionTypes.DELETE_LIST_SUCCESS,
  id
});

const deleteListFailure = errMessage => ({
  type: ShoppingListActionTypes.DELETE_LIST_FAILURE,
  errMessage
});

const deleteListRequest = () => ({
  type: ShoppingListActionTypes.DELETE_LIST_REQUEST
});

const fetchShoppingListMetaDataSuccess = data => ({
  type: ShoppingListActionTypes.FETCH_META_DATA_SUCCESS,
  payload: data
});
const fetchShoppingListsMetaDataFailure = errMessage => ({
  type: ShoppingListActionTypes.FETCH_META_DATA_FAILURE,
  payload: errMessage
});
const fetchShoppingListsMetaDataRequest = () => ({
  type: ShoppingListActionTypes.FETCH_META_DATA_REQUEST
});

// Dispatchers
export const fetchItemsFromGivenList = listId => dispatch => {
  dispatch(fetchProductRequest());
  getData(`${ENDPOINT_URL}/shopping-lists/${listId}/products`)
    .then(resp => resp.json())
    .then(json => dispatch(fetchProductsSuccess(json, listId)))
    .catch(err => {
      dispatch(fetchProductsFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        "Oops, we're sorry, fetching products failed..."
      );
    });
};

export const createShoppingList = (name, description, adminId) => dispatch => {
  dispatch(createNewShoppingListRequest());
  postData(`${ENDPOINT_URL}/shopping-lists/create`, {
    name,
    description,
    adminId
  })
    .then(resp => resp.json())
    .then(json => dispatch(createNewShoppingListSuccess(json)))
    .catch(err => {
      dispatch(createNewShoppingListFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        "Oops, we're sorry, creating new list failed..."
      );
    });
};

export const fetchShoppingListsMetaData = () => dispatch => {
  dispatch(fetchShoppingListsMetaDataRequest());
  getData(`${ENDPOINT_URL}/shopping-lists/meta-data`)
    .then(resp => resp.json())
    .then(json => {
      const dataMap = _keyBy(json, '_id');
      dispatch(fetchShoppingListMetaDataSuccess(dataMap));
    })
    .catch(err => {
      dispatch(fetchShoppingListsMetaDataFailure());
      createNotificationWithTimeout(
        dispatch,
        NotificationType.ERROR,
        "Oops, we're sorry, fetching lists failed..."
      );
    });
};

export const deleteList = (id, successRedirectCallback) => dispatch => {
  dispatch(deleteListRequest());
  deleteData(`${ENDPOINT_URL}/shopping-lists/${id}/delee`)
    .then(resp =>
      resp.text().then(message => {
        if (resp.ok) {
          dispatch(deleteListSuccess());
          createNotificationWithTimeout(
            dispatch,
            NotificationType.SUCCESS,
            message
          );
          successRedirectCallback();
        } else {
          const error = new Error(message);
          error.fromBackend = true;
          throw error;
        }
      })
    )
    .catch(err => {
      const message = err.fromBackend
        ? err.message
        : "Oops, we're sorry, deleting list failed...";
      onFetchError(dispatch, message, () => dispatch(deleteListFailure()));
    });
};
