const express = require('express');
const router = express.Router();
const { checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createInquirySchema, updateInquirySchema, assignStudentSchema, assignStaffSchema } = require('./inquirySchemas');
const inquiryController = require('./inquiryController');

// ─── Search routes (must be BEFORE /:id to avoid conflicts) ───────────────────
router.route('/search/students')
    .get(checkRole(['admin', 'staff']), inquiryController.searchStudents);

router.route('/search/staff')
    .get(checkRole(['admin', 'staff']), inquiryController.searchStaff);

// ─── CRUD routes ──────────────────────────────────────────────────────────────
router.route('/')
    .get(checkRole(['admin', 'staff']), inquiryController.getAllInquiries)
    .post(checkRole(['admin', 'staff']), validateBody(createInquirySchema), inquiryController.createInquiry);

router.route('/:id')
    .get(checkRole(['admin', 'staff']), validateParams(idParamSchema), inquiryController.getInquiryById)
    .put(checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(updateInquirySchema), inquiryController.updateInquiry)
    .delete(checkRole(['admin', 'staff']), validateParams(idParamSchema), inquiryController.deleteInquiry);

// ─── Assignment routes ────────────────────────────────────────────────────────
router.route('/:id/assign-student')
    .put(checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(assignStudentSchema), inquiryController.assignStudentToInquiry);

router.route('/:id/assign-staff')
    .put(checkRole(['admin', 'staff']), validateParams(idParamSchema), validateBody(assignStaffSchema), inquiryController.assignStaffToInquiry);

module.exports = router;
