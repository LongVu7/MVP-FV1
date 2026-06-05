const inquiryService = require('./inquiryService');

// Helper: translate service errors to HTTP responses
const handleError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message, ...(status === 500 && { details: error.message }) });
};

// ─── List all inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await inquiryService.getAllInquiries();
    res.status(200).json({
      message: 'Inquiries retrieved successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      inquiries
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Get specific inquiry
const getInquiryById = async (req, res) => {
  try {
    const data = await inquiryService.getInquiryById(req.params.id);
    res.status(200).json({
      message: 'Inquiry retrieved successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Create inquiry
const createInquiry = async (req, res) => {
  try {
    const data = await inquiryService.createInquiry(req.body);
    res.status(201).json({
      message: 'Inquiry created successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Update inquiry
const updateInquiry = async (req, res) => {
  try {
    const data = await inquiryService.updateInquiry(req.params.id, req.body);
    res.status(200).json({
      message: 'Inquiry updated successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Delete inquiry (preserves student records)
const deleteInquiry = async (req, res) => {
  try {
    await inquiryService.deleteInquiry(req.params.id);
    res.status(200).json({
      message: 'Inquiry deleted successfully. Associated student records were preserved.',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Assign a student to an inquiry
const assignStudentToInquiry = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required in the request body' });
    }

    const data = await inquiryService.assignStudentToInquiry(req.params.id, studentId);
    res.status(200).json({
      message: 'Student assigned to inquiry successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Unassign a student from an inquiry
const unassignStudentFromInquiry = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required in the request body' });
    }

    await inquiryService.unassignStudentFromInquiry(req.params.id, studentId);
    res.status(200).json({
      message: 'Student unassigned from inquiry successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Assign a staff member to an inquiry
const assignStaffToInquiry = async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({ error: 'staffId is required in the request body' });
    }

    const data = await inquiryService.assignStaffToInquiry(req.params.id, staffId);
    res.status(200).json({
      message: 'Staff assigned to inquiry successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Search students (for assignment UI)
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const results = await inquiryService.searchStudents(q);
    res.status(200).json({
      message: 'Students search results',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      results
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ─── Search staff accounts (for assignment UI)
const searchStaff = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const results = await inquiryService.searchStaff(q);
    res.status(200).json({
      message: 'Staff search results',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      results
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  assignStudentToInquiry,
  unassignStudentFromInquiry,
  assignStaffToInquiry,
  searchStudents,
  searchStaff
};
