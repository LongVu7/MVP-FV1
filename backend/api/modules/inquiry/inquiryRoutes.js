const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const authorize = require('../../../middleware/authorize');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createInquirySchema, updateInquirySchema, assignStudentSchema, assignAccountSchema } = require('./inquirySchemas');
const { resolveInquiryOwnership } = require('../../../authorization/scope/inquiryScope');
const inquiryController = require('./inquiryController');



const withOwnership = { ownership: { resolver: resolveInquiryOwnership } };
// ─── Search routes
router.route('/search/students')
    .get(authenticate, authorize('inquiry.read'), inquiryController.searchStudents);

router.route('/search/accounts')
    .get(authenticate, authorize('inquiry.assign'), inquiryController.searchAccounts);

// ─── CRUD routes
router.route('/')
    .get(authenticate, authorize('inquiry.read'), inquiryController.getAllInquiries)
    .post(authenticate, authorize('inquiry.create'), validateBody(createInquirySchema), inquiryController.createInquiry);

router.route('/:id')
    .get(authenticate, authorize('inquiry.read', withOwnership), validateParams(idParamSchema), inquiryController.getInquiryById)
    .put(authenticate, authorize('inquiry.update', withOwnership), validateParams(idParamSchema), validateBody(updateInquirySchema), inquiryController.updateInquiry)
    .delete(authenticate, authorize('inquiry.delete', withOwnership), validateParams(idParamSchema), inquiryController.deleteInquiry);

// ─── Assignment routes
router.route('/:id/assign-student')
    .put(authenticate, authorize('inquiry.update', withOwnership), validateParams(idParamSchema), validateBody(assignStudentSchema), inquiryController.assignStudentToInquiry)
    .delete(authenticate, authorize('inquiry.update', withOwnership), validateParams(idParamSchema), validateBody(assignStudentSchema), inquiryController.unassignStudentFromInquiry);

router.route('/:id/assign-account')
    .put(authenticate, authorize('inquiry.assign'), validateParams(idParamSchema), validateBody(assignAccountSchema), inquiryController.assignAccountToInquiry);

module.exports = router;
