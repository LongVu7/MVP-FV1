const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const cityController = require('./cityController');

router.route('/')
    .get(authenticate, authorize('city.read'), cityController.getAllCities);

module.exports = router;
