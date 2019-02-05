const express = require('express');

const router = express.Router();
const {
  createNewList,
  getAllShoppingLists,
  getShoppingListById
} = require('../controllers/shoppingList');

router.get('/', getAllShoppingLists);
router.get('/:id', getShoppingListById);
router.post('/create', createNewList);

module.exports = app => app.use('/shopping-lists', router);
