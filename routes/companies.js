/**
 * companies.js
 *
 * @author Rhys Evans
 * @version 0.1
 */

'use strict';

const router = require('express').Router();
const companyController = require('../controllers/company');
const authenticateToken = require('../middlewares/authenticateToken');
const validate = require('../middlewares/validate');

/**
 * GET /companies/:id
 * View individual company record by id
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.get('/:id', [authenticateToken, validate.mongoObjectId], companyController.getById);

/**
 * GET /companies/:id/bookings
 * Retrieves a list (potentially filtered) of all the company's bookings
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.get('/:id/bookings', [authenticateToken, validate.mongoObjectId], companyController.getBookings);

module.exports = router;

