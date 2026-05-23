const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const roleController = require('./roleController');

// ─── Roles list 
router.route('/')
    .get(authenticate, checkRole(['admin']), roleController.getAllRoles);

module.exports = router;