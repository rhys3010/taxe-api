/**
  * routes.js
  * Bootstrap all app's routes
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const router = require('express').Router();
const usersRoute = require('./routes/users');

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

module.exports = router;
