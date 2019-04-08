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

/**
 * GET /companies/:id/drivers
 * Retrieves a list of all the company's driverrs
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.get('/:id/drivers', [authenticateToken, validate.mongoObjectId], companyController.getDrivers);

/**
 * PUT /companies/:id/drivers
 * Adds a new driver to the company's drivers list
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.put('/:id/drivers', [authenticateToken, validate.mongoObjectId, validate.addDriver], companyController.addDriver);

/**
 * DELETE /companies/:companyId/drivers/:driverId
 * Removes a driver from teh company's drivers list
 * Middleware: Auth
 */
router.delete('/:companyId/drivers/:driverId', authenticateToken, companyController.removeDriver);

module.exports = router;

