const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const { validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const statusDataController = require('./statusDataController');

// ─── Dropdown APIs
router.route('/')
    .get(authenticate, authorize('status_data.read'), statusDataController.getRootOptions);

router.route('/:id/children')
    .get(authenticate, authorize('status_data.read'), validateParams(idParamSchema), statusDataController.getChildrenById);

router.route('/:id')
    .get(authenticate, authorize('status_data.read'), validateParams(idParamSchema), statusDataController.getStatusDataById);

module.exports = router;
