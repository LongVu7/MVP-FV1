const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const sourceDataController = require('./sourceDataController');

// ─── Dropdown APIs
router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), sourceDataController.getRootOptions);

router.route('/:id/children')
    .get(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), sourceDataController.getChildrenById);

module.exports = router;
    