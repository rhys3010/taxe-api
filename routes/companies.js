/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

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
 * Retrieves a list of all the company's drivers
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.get('/:id/drivers', [authenticateToken, validate.mongoObjectId], companyController.getDrivers);

/**
 * GET /companies/:id/admins
 * Retrieves a list of all the company's admins
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.get('/:id/admins', [authenticateToken, validate.mongoObjectId], companyController.getAdmins);

/**
 * PATCH /companies/:id/drivers
 * Adds a new driver to the company's drivers list
 * Middleware: Auth, Validate (Mongo Object Id)
 */
router.patch('/:id/drivers', [authenticateToken, validate.addDriver], companyController.addDriver);

/**
 * PATCH /companies/:companyId/drivers/:driverId
 * Removes a driver from the company's drivers list
 * Middleware: Auth
 */
router.patch('/:companyId/drivers/:driverId', authenticateToken, companyController.removeDriver);

module.exports = router;

