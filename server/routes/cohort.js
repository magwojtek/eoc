const express = require('express');

const router = express.Router();

const {
  addMember,
  addOwnerRole,
  archiveCohort,
  createCohort,
  deleteCohort,
  getArchivedCohortsMetaData,
  getCohortDetails,
  getCohortsMetaData,
  leaveCohort,
  removeMember,
  removeOwnerRole,
  updateCohortById
} = require('../controllers/cohort');
const { authorize } = require('../middleware/authorize');

router.get('/meta-data', authorize, getCohortsMetaData);
router.post('/create', authorize, createCohort);
router.get('/archived', authorize, getArchivedCohortsMetaData);
router.patch('/:id/update', authorize, updateCohortById);
router.get('/:id/data', authorize, getCohortDetails);
router.delete('/:id/delete', authorize, deleteCohort);
router.patch('/:id/remove-member', authorize, removeMember);
router.patch('/:id/add-owner-role', authorize, addOwnerRole);
router.patch('/:id/remove-owner-role', authorize, removeOwnerRole);
router.patch('/:id/add-member', authorize, addMember);
router.patch('/:id/leave-cohort', leaveCohort);
router.patch('/:id/archive', authorize, archiveCohort);

module.exports = router;
