const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createStudentSchema, updateStudentSchema } = require('./studentSchemas');
const upload = require('../../../middleware/upload');
const studentController = require('./studentController');

router.route('/')
    .get(authenticate, checkRole(['admin']), studentController.getAllStudents)
    .post(authenticate, checkRole(['staff', 'admin']), validateBody(createStudentSchema), studentController.createStudent);

router.route('/import')
    .post(authenticate, checkRole(['staff', 'admin']), upload.array('files'), studentController.importStudents);

router.route('/:id')
    .get(authenticate, checkRole(['admin']), validateParams(idParamSchema), studentController.getStudentById)
    .put(authenticate, validateParams(idParamSchema), validateBody(updateStudentSchema), studentController.updateStudent)
    .delete(authenticate, validateParams(idParamSchema), studentController.deleteStudent);

module.exports = router;