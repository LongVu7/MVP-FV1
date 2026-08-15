const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const { authorizeLookup } = require('../../../authorization/lookupPolicy');
const cityController = require('./cityController');

router.route('/')
    .get(authenticate, authorizeLookup('city.read'), cityController.getAllCities);

module.exports = router;
