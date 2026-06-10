const fs = require('fs');
const studentService = require('./studentService');

// Helper: translate service errors to HTTP responses
const handleError = (res, error) => {
  const status = error.status || 500;
  res.status(status).json({ 
    error: error.message,
    ...(status === 500 && { details: error.message }) });
};

const createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      message: 'Student created successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      student
    });
  } catch (error) {
    handleError(res, error);
  }
};

const { parsePagination } = require('../../utils/pagination');

const getAllStudents = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = req.query.search || '';

    const { students, pagination } = await studentService.getAllStudents({ page, limit, skip, search });

    res.status(200).json({
      message: 'Students retrieved successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data: students,
      pagination
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getStudentById = async (req, res) => {
  try {
    const data = await studentService.getStudentById(req.params.id);
    res.status(200).json({
      message: 'Student retrieved successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

const updateStudent = async (req, res) => {
  try {
    const data = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      message: 'Student updated successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId,
      data
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.status(200).json({
      message: 'Student deleted successfully',
      requestedByRole: req.user?.roleName,
      requestedByAccountId: req.user?.accountId
    });
  } catch (error) {
    handleError(res, error);
  }
};

const importStudents = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const isConfirm = req.body.confirm === 'true' || req.body.confirm === true;
    const result = await studentService.importStudents(req.files, isConfirm);

    // Clean up uploaded files after processing
    req.files.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });

    if (!result.confirmed) {
      return res.status(200).json({
        message: 'Analysis complete. Please confirm to proceed with UPSERT.',
        totalParsed: result.totalParsed,
        duplicateCount: result.duplicateCount,
        duplicates: result.duplicates,
        requiresConfirmation: true
      });
    }

    res.status(200).json({
      message: 'Import successful',
      insertedCount: result.insertedCount,
      updatedCount: result.updatedCount
    });
  } catch (error) {
    // Clean up files on error
    if (req.files) {
      req.files.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    handleError(res, error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  importStudents,
  getStudentById
};
