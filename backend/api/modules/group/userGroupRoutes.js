const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const userGroupController = require('./userGroupController');

// ─── CRUD routes
router.route('/')
    .get(authenticate, authorize('group.read'), userGroupController.getAllGroups)
    .post(authenticate, authorize('group.create'), userGroupController.createGroup);

router.route('/:id')
    .get(authenticate, authorize('group.read'), userGroupController.getGroupById)
    .put(authenticate, authorize('group.update'), userGroupController.updateGroup)
    .delete(authenticate, authorize('group.delete'), userGroupController.deleteGroup);

// ─── Group members management
router.route('/:id/add-member')
    .put(authenticate, authorize('group.update'), userGroupController.addMemberToGroup);

router.route('/:id/remove-member')
    .put(authenticate, authorize('group.update'), userGroupController.removeMemberFromGroup);

module.exports = router;
