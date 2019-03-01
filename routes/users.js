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
const auth = require('../middlewares/auth')
const validate = require('../middlewares/validate');

/**
  * GET /users
  * List all users
*/
router.get('/', auth, userController.getAll);

/**
  * POST /users
  * Create new user
*/
router.post('/', validate.userCreate, userController.register);

/**
  * POST /users/login
  * Authenticate with basic auth and return token if successful
*/
router.post('/login', userController.authenticate);

/**
  * GET /users/:id
  * View individual user record
*/
router.get('/:email', auth, userController.getByEmail);

/**
  * PUT /users/:id
  * Edit individual user record
*/
router.put('/:email', function(req, res, next){
  res.json({"message": "edit user info here"});
});


module.exports = router;
