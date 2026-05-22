const express = require('express');
const router = express.Router();
const { checkRole } = require('../../middleware/auth');
const studentController = require('../controllers/studentController');
const upload = require('../../middleware/upload');

router.route('/')
    .get(checkRole(['admin']), studentController.getAllStudents)
    .post(checkRole(['staff', 'admin']), studentController.createStudent);

router.route('/import')
    .post(checkRole(['staff', 'admin']), upload.array('files'), studentController.importStudents);

router.route('/:id')
    .get(checkRole(['admin']), studentController.getStudentById)
    .put(studentController.updateStudent)
    .delete(studentController.deleteStudent);

module.exports = router;