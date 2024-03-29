/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
  * routes.js
  * Bootstrap all app's routes
  * @author Rhys Evans
  * @version 0.2
*/

'use strict';

const router = require('express').Router();
const usersRoute = require('./routes/users');
const bookingsRoute = require('./routes/bookings');
const companiesRoute = require('./routes/companies');

/**
  * Default route, present welcome message to api
*/
router.get('/', function(req, res){
  res.json({"message": "Welcome to the Tax-E REST API"});
});

/**
  * Users route
*/
router.use('/users', usersRoute);

/**
 * Bookings route
 */
router.use('/bookings', bookingsRoute);

/**
 * Companies route
 */
router.use('/companies', companiesRoute);

module.exports = router;
