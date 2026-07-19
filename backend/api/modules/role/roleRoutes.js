const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const roleController = require('./roleController');

// ─── Roles list 
router.route('/')
    .get(authenticate, authorize('role.read'), roleController.getAllRoles);

module.exports = router;