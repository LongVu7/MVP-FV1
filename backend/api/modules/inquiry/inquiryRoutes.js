const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createInquirySchema, updateInquirySchema, assignStudentSchema, assignAccountSchema } = require('./inquirySchemas');
const inquiryController = require('./inquiryController');

// ─── Search routes 
router.route('/search/students')
    .get(authenticate, checkRole(['admin', 'staff']), inquiryController.searchStudents);

router.route('/search/accounts')
    .get(authenticate, checkRole(['admin', 'staff']), inquiryController.searchAccounts);

// ─── CRUD routes
router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), inquiryController.getAllInquiries)
    .post(authenticate, checkRole(['admin', 'staff']), validateBody(createInquirySchema), inquiryController.createInquiry);

router.route('/:id')
    .get(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), inquiryController.getInquiryById)
    .put(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(updateInquirySchema), inquiryController.updateInquiry)
    .delete(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), inquiryController.deleteInquiry);

// ─── Assignment routes
router.route('/:id/assign-student')
    .put(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(assignStudentSchema), inquiryController.assignStudentToInquiry)
    .delete(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(assignStudentSchema), inquiryController.unassignStudentFromInquiry);

router.route('/:id/assign-account')
    .put(authenticate, checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(assignAccountSchema), inquiryController.assignAccountToInquiry);

module.exports = router;
