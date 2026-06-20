const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createSchoolSchema, updateSchoolSchema } = require('./schoolSchemas');
const schoolController = require('./schoolController');

router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), schoolController.getAllSchools)
    .post(authenticate, checkRole(['admin']), validateBody(createSchoolSchema), schoolController.createSchool);

router.route('/options')
    .get(authenticate, checkRole(['admin', 'staff']), schoolController.getSchoolOptions);

router.route('/statistics')
    .get(authenticate, checkRole(['admin']), schoolController.getStatistics);

router.route('/:id')
    .get(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), schoolController.getSchoolById)
    .put(authenticate, checkRole(['admin']), validateParams(idParamSchema), validateBody(updateSchoolSchema), schoolController.updateSchool)
    .delete(authenticate, checkRole(['admin']), validateParams(idParamSchema), schoolController.deleteSchool);

module.exports = router;
