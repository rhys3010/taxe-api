/**
  * users.js
  * Define the users route to handle all things users.
  * Includes, authentication, registration, viewing profiles etc
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const router = require('express').Router();

// TODO: Link up controller

/**
  * GET /users
  * List all users
*/
router.get('/', function(req, res){
  res.json({"message": "show all users here"});
});

/**
  * POST /users
  * Create new user
*/
router.post('/', function(req, res){
  res.json({"message": "create new user here"});
});

/**
  * POST /users/login
  * Authenticate with basic auth and return token if successful
*/
router.post('/login', function(req, res){
  res.json({"message": "login user here"});
});

/**
  * GET /users/:id
  * View individual user record
*/
router.get('/:id', function(req, res){
  res.json({"message": "show user info here"});
});

/**
  * PUT /users/:id
  * Edit individual user record
*/
router.put('/:id', function(req, res){
  res.json({"message": "edit user info here"});
});


module.exports = router;
