const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const majorDataController = require('./majorDataController');

// ─── Dropdown APIs
router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), majorDataController.getRootOptions);

router.route('/:id/children')
    .get(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), majorDataController.getChildrenById);

module.exports = router;
