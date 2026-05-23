const express = require('express');
const router = express.Router();
const { checkRole } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validate');
const { idParamSchema } = require('../../../schemas/commonSchemas');
const { createStudentSchema, updateStudentSchema } = require('./studentSchemas');
const upload = require('../../../middleware/upload');
const studentController = require('./studentController');

router.route('/')
    .get(checkRole(['admin']), studentController.getAllStudents)
    .post(checkRole(['staff', 'admin']), validateBody(createStudentSchema), studentController.createStudent);

router.route('/import')
    .post(checkRole(['staff', 'admin']), upload.array('files'), studentController.importStudents);

router.route('/:id')
    .get(checkRole(['admin']), validateParams(idParamSchema), studentController.getStudentById)
    .put(validateParams(idParamSchema), validateBody(updateStudentSchema), studentController.updateStudent)
    .delete(validateParams(idParamSchema), studentController.deleteStudent);

module.exports = router;