const express = require('express');
const router = express.Router();
const { checkRole } = require('../../../middleware/auth');
const userGroupController = require('./userGroupController');
const roleController = require('../role/roleController');

// ─── CRUD routes
router.route('/')
    .get(checkRole(['admin']), userGroupController.getAllGroups)
    .post(checkRole(['admin']), userGroupController.createGroup);

router.route('/:id')
    .get(checkRole(['admin']), userGroupController.getGroupById)
    .put(checkRole(['admin']), userGroupController.updateGroup)
    .delete(checkRole(['admin']), userGroupController.deleteGroup);

// ─── Group members management
router.route('/:id/add-member')
    .put(checkRole(['admin']), userGroupController.addMemberToGroup);

router.route('/:id/remove-member')
    .put(checkRole(['admin']), userGroupController.removeMemberFromGroup);

module.exports = router;
