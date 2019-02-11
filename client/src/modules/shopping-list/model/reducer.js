import { initialStatus } from './initialState';
import { ShoppingListActionTypes } from './actionTypes';
import { ProductActionTypes } from 'modules/shopping-list/components/InputBar/model/actionTypes';
import { StatusType } from 'common/constants/enums';

export const shoppingLists = (state = {}, action) => {
  switch (action.type) {
    case ShoppingListActionTypes.FETCH_META_DATA_SUCCESS:
      return { ...action.payload };
    case ShoppingListActionTypes.ADD_LIST_SUCCESS:
      return {
        ...state,
        [action.payload._id]: { ...action.payload }
      };
    case ShoppingListActionTypes.FETCH_PRODUCTS_SUCCESS: {
      const updatedShoppingList = {
        ...state[action.payload.listId],
        products: action.payload.products
      };
      return {
        ...state,
        [action.payload.listId]: updatedShoppingList
      };
    }
    case ProductActionTypes.ADD_PRODUCT_SUCCESS: {
      const updatedShoppingList = {
        ...state[action.payload.listId],
        products: [
          ...state[action.payload.listId].products,
          action.payload.product
        ]
      };
      return {
        ...state,
        [action.payload.listId]: updatedShoppingList
      };
    }
    case ProductActionTypes.TOGGLE_PRODUCT: {
      const updatedShoppingList = {
        ...state[action.payload.listId],
        products: [...state[action.payload.listId].products].map(product =>
          product._id === action.payload.product._id
            ? {
                ...action.payload.product,
                isOrdered: action.payload.product.isOrdered
              }
            : product
        )
      };
      return {
        ...state,
        [action.payload.listId]: updatedShoppingList
      };
    }
    case ProductActionTypes.VOTE_FOR_PRODUCT: {
      const updatedShoppingList = {
        ...state[action.payload.listId],
        products: [...state[action.payload.listId].products].map(product =>
          product._id === action.payload.product._id
            ? {
                ...action.payload.product,
                voterIds: action.payload.product.voterIds
              }
            : product
        )
      };
      return {
        ...state,
        [action.payload.listId]: updatedShoppingList
      };
    }
    default:
      return state;
  }
};

export const uiStatus = (state = initialStatus, action) => {
  switch (action.type) {
    case ShoppingListActionTypes.FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        fetchStatus: StatusType.ERROR
      };
    case ShoppingListActionTypes.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        fetchStatus: StatusType.RESOLVED
      };
    case ProductActionTypes.ADD_PRODUCT_FAILURE:
      return {
        ...state,
        newProductStatus: StatusType.ERROR
      };
    case ProductActionTypes.ADD_PRODUCT_SUCCESS:
      return {
        ...state,
        newProductStatus: StatusType.RESOLVED
      };
    default:
      return state;
  }
};
