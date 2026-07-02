const express = require('express');
const router = express.Router();
const { authenticate, checkRole } = require('../../../middleware/auth');
const accountController = require('./accountController');



// ─── CRUD routes
router.route('/')
    .get(authenticate, checkRole(['admin', 'staff']), accountController.getAllAccounts)
    .post(authenticate, checkRole(['admin']), accountController.createAccount);

router.route('/:id')
    .get(authenticate, checkRole(['admin']), accountController.getAccountById)
    .put(authenticate, checkRole(['admin']), accountController.updateAccount)
    .delete(authenticate, checkRole(['admin']), accountController.deleteAccount);

// ─── Role assignment
router.route('/:id/assign-role')
    .put(authenticate, checkRole(['admin']), accountController.assignRole);

module.exports = router;
