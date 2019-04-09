/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
 * bookings.js
 *
 * Define the bookings route to handle all things bookings.
 * @author Rhys Evans
 * @version 0.2
 */

'use strict';

const router = require('express').Router();
const bookingController = require('../controllers/booking');
const authenticateToken = require('../middlewares/authenticateToken');
const validate = require('../middlewares/validate');
const authorizeRole = require('../middlewares/authorizeRole');
const Role = require('../helpers/role');

/**
 * GET /bookings/
 * Returns a list of all unallocated bookings
 * Middleware: Auth, AuthorizeRole (Company Admin)
 */
router.get('/', [authenticateToken, authorizeRole(Role.Company_Admin)], bookingController.getUnallocatedBookings);

/**
 * POST /bookings
 * Create a new booking
 * Middleware: Auth, Validate, AuthorizeRole (Customer)
 */
router.post('/', [authenticateToken, validate.bookingCreate, authorizeRole(Role.Customer)], bookingController.create);

/**
 * GET /bookings/:id
 * View individual booking by id
 * Middleware: Auth, Validate (MongoDB Object Id)
 */
router.get('/:id', [authenticateToken, validate.mongoObjectId], bookingController.getById);

/**
 * PATCH /bookings/:id
 * Edit individual booking
 * Middleware: Auth, Validate (Mongo Object Id and Booking Edit)
 */
router.patch('/:id', [authenticateToken, validate.mongoObjectId, validate.bookingEdit], bookingController.edit);

/**
 * PATCH /bookings/:id/claim
 * Allow Company Admins to claim a booking
 * Middleware: Auth, Validate (Mongo Object ID, Claim Booking), Authorize Role (Company Admin)
 */
router.patch('/:id/claim', [authenticateToken, validate.mongoObjectId, validate.claimBooking, authorizeRole(Role.Company_Admin)], bookingController.claimBooking);

/**
 * PATCH /bookings/:id/release
 * Allow Company Admins to release a boooking
 * Middleware: Auth, Validate (Mongo Object ID), Authorize Role (Company Admin, Driver)
 */
router.patch('/:id/release', [authenticateToken, validate.mongoObjectId, authorizeRole([Role.Company_Admin, Role.Driver])], bookingController.releaseBooking);

module.exports = router;