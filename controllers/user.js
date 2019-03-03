/**
  * user.js
  * Controller class for user, all needed function to route
  * requests.
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const userService = require('../services/user');
const config = require('../config.json');
const jwt = require('jsonwebtoken');
const auth = require('basic-auth');

module.exports = {
  authenticate,
  register,
  getById,
  getAll
};

/**
  * Authenticate users by calling the authentication task in
  * the user service file
  * @param req - HTTP Request object
  * @param res - HTTP Response object
  * @param next - The next middleware to execute
*/
function authenticate(req, res, next){
  // Get user's credentials from the request header
  const credentials = auth(req);
  userService.authenticate(credentials.name, credentials.pass)
    .then(function(user){
      if(user){
        // If user was successfully authed, send return value
        res.json(user);
      }else{
        // If user authentication failed, send error
        const error = new Error();
        error.name = "AuthenticationFailedError";
        throw error;
      }
    }).catch(err => next(err));
}

/**
  * Register a new user by calling the create function in
  * the user service
  * @param req - HTTP request object
  * @param res - HTTP response object
  * @param next - the next middleware to be executed
*/
function register(req, res, next){
  userService.create(req.body)
    .then(() => res.status(201).json({message: "Successfully Registered"}))
    .catch(err => next(err));
}

/**
 * Searches for and returns a user based on provided user ID
 * @param req - HTTP request object
 * @param res - HTTP repsonse object
 * @param next - next middleware to be executed
 */
function getById(req, res, next){
  userService.getById(req.params.id)
      .then(user => res.status(200).json(user))
      .catch(err => next(err));
}

/**
  * Retrieves all ussers and prints their name and id
  * @param req - HTTP request object
  * @param res - HTTP repsonse object
  * @param next - next middleware to be executed
*/
function getAll(req, res, next){
  userService.getAll()
    .then(users => res.status(200).json(users))
    .catch(err => next(err));

}
