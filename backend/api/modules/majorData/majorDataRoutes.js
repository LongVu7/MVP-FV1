const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const { validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const majorDataController = require('./majorDataController');

// ─── Dropdown APIs
router.route('/')
    .get(authenticate, authorize('major_data.read'), majorDataController.getRootOptions);

router.route('/:id/children')
    .get(authenticate, authorize('major_data.read'), validateParams(idParamSchema), majorDataController.getChildrenById);

module.exports = router;
