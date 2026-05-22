const express = require('express');
const router = express.Router();
const { checkRole } = require('../../middleware/auth');
const accountController = require('../controllers/accountController');

// ─── Roles list 
router.route('/roles')
    .get(checkRole(['admin']), accountController.getAllRoles);

// ─── CRUD routes
router.route('/')
    .get(checkRole(['admin']), accountController.getAllAccounts)
    .post(checkRole(['admin']), accountController.createAccount);

router.route('/:id')
    .get(checkRole(['admin']), accountController.getAccountById)
    .put(checkRole(['admin']), accountController.updateAccount)
    .delete(checkRole(['admin']), accountController.deleteAccount);

// ─── Role assignment
router.route('/:id/assign-role')
    .put(checkRole(['admin']), accountController.assignRole);

module.exports = router;
