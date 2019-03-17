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

/**
 * POST /bookings
 * Create a new booking
 * Middleware: Auth, Validate
 */
router.post('/', [authenticateToken, validate.bookingCreate], bookingController.create);

/**
 * GET /bookings/:id
 * View individual booking by id
 * Middleware: Auth, Validate (MongoDB Object Id)
 */
router.get('/:id', [authenticateToken, validate.mongoObjectId], bookingController.getById);

/**
 * PUT /bookings/:id
 * Edit individual booking
 * Middleware: Auth, Validate (Mongo Object Id and Booking Edit)
 */
router.put('/:id', [authenticateToken, validate.mongoObjectId, validate.bookingEdit], bookingController.edit);

module.exports = router;