/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

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
  getAll,
  edit,
  getBookings
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
  // If credentials is null, throw error
  if(!credentials){
    const error = new Error();
    error.name = "MissingAuthenticationError";
    throw error;
  }

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
  * Retrieves all users and prints their name and id
  * @param req - HTTP request object
  * @param res - HTTP repsonse object
  * @param next - next middleware to be executed
*/
function getAll(req, res, next){
  userService.getAll()
    .then(users => res.status(200).json(users))
    .catch(err => next(err));

}

/**
 * Edits (if authorized) a user's profile (name and password).
 * @param req - HTTP request object
 * @param res - HTTP repsonse object
 * @param next - next middleware to be executed
 */
function edit(req, res, next){
  userService.edit(res.locals.userId, req.params.id, req.body)
      .then(() => res.status(200).json({message: "User Successfully Edited"}))
      .catch(err => next(err));
}

/**
 * Retrieves all of the user's bookings
 * @param req
 * @param res
 * @param next
 */
function getBookings(req, res, next){
  userService.getUserBookings(req.params.id, res.locals.userId, req.query.limit, req.query.active)
      .then(bookings => res.status(200).json(bookings))
      .catch(err => next(err));
}
