const express = require('express');
const router = express.Router();
const { checkRole } = require('../../middleware/auth');
const inquiryController = require('../controllers/inquiryController');

// ─── Search routes (must be BEFORE /:id to avoid conflicts) ───────────────────
router.route('/search/students')
    .get(checkRole(['admin', 'staff']), inquiryController.searchStudents);

router.route('/search/staff')
    .get(checkRole(['admin', 'staff']), inquiryController.searchStaff);

// ─── CRUD routes ──────────────────────────────────────────────────────────────
router.route('/')
    .get(checkRole(['admin', 'staff']), inquiryController.getAllInquiries)
    .post(checkRole(['admin', 'staff']), inquiryController.createInquiry);

router.route('/:id')
    .get(checkRole(['admin', 'staff']), inquiryController.getInquiryById)
    .put(checkRole(['admin', 'staff']), inquiryController.updateInquiry)
    .delete(checkRole(['admin', 'staff']), inquiryController.deleteInquiry);

// ─── Assignment routes ────────────────────────────────────────────────────────
router.route('/:id/assign-student')
    .put(checkRole(['admin', 'staff']), inquiryController.assignStudentToInquiry);

router.route('/:id/assign-staff')
    .put(checkRole(['admin', 'staff']), inquiryController.assignStaffToInquiry);

module.exports = router;
