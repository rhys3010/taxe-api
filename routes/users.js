/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
  * users.js
  * Define the users route to handle all things users.
  * Includes, authentication, registration, viewing profiles etc
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const router = require('express').Router();
const userController = require('../controllers/user');
const authenticateToken = require('../middlewares/authenticateToken');
const validate = require('../middlewares/validate');

/**
  * GET /users
  * List all users
 * Middleware: Auth
*/
router.get('/', authenticateToken, userController.getAll);

/**
  * POST /users
  * Create new user
 * Middleware: Validate (User Creation)
*/
router.post('/', validate.userCreate, userController.register);

/**
  * POST /users/login
  * Authenticate with basic auth and return token if successful
*/
router.post('/login', userController.authenticate);

/**
 * GET /users/:id
 * View individual user record by id
 * Middleware: Auth, Validate (MongoDB Object Id)
 */
router.get('/:id', [authenticateToken, validate.mongoObjectId], userController.getById);

/**
  * PATCH /users/:id
  * Edit individual user record
  * Middleware: Auth, Validate (Mongo Object Id and User Edit)
*/
router.patch('/:id', [authenticateToken, validate.mongoObjectId, validate.userEdit], userController.edit);

/**
 * GET /users/:id/bookings
 * Retrieve a list (potentially filtered) of all the user's bookings
 * Middleware: Auth, Validate (Mongo Object ID)
 */
router.get('/:id/bookings', [authenticateToken, validate.mongoObjectId], userController.getBookings);


module.exports = router;
