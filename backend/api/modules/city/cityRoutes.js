const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const cityController = require('./cityController');

router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), cityController.getAllCities);

module.exports = router;
