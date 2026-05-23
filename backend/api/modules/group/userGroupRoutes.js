const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const userGroupController = require('./userGroupController');
const roleController = require('../role/roleController');

// ─── CRUD routes
router.route('/')
    .get(authenticate, checkRole(['admin']), userGroupController.getAllGroups)
    .post(authenticate, checkRole(['admin']), userGroupController.createGroup);

router.route('/:id')
    .get(authenticate, checkRole(['admin']), userGroupController.getGroupById)
    .put(authenticate, checkRole(['admin']), userGroupController.updateGroup)
    .delete(authenticate, checkRole(['admin']), userGroupController.deleteGroup);

// ─── Group members management
router.route('/:id/add-member')
    .put(authenticate, checkRole(['admin']), userGroupController.addMemberToGroup);

router.route('/:id/remove-member')
    .put(authenticate, checkRole(['admin']), userGroupController.removeMemberFromGroup);

module.exports = router;
