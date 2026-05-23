const express = require('express');
const router = express.Router();
const { checkRole } = require('../../../middleware/auth');
const roleController = require('./roleController');

// ─── Roles list 
router.route('/')
    .get(checkRole(['admin']), roleController.getAllRoles);

module.exports = router;