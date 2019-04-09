/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
  * user.js
  * Handle all user tasks by communicating with database.
  * Behaves as a layer of abstraction between the controller class
  * and database
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../helpers/db');
const mongoose = require('mongoose');
const User = db.User;
const Company = db.Company;
const auth = require('basic-auth');
const Status = require('../helpers/status');
const Role = require('../helpers/role');

/**
  * Export all user tasks
*/
module.exports = {
  authenticate,
  create,
  getById,
  getAll,
  edit,
  getUserBookings
};

/**
  * Authenticate user by email and password
  * If user is successfully authenticated, return jwt token and user summary
  * @param email - User's entered email
  * @param password - User's entered password hash
  * @param returns - User summary (with password omitted) and jwt access token
*/
async function authenticate(email, password){
  // Get user from DB
  const user = await User.findOne({email: email});
  // Get jwt expiry time
  const expiryTime = process.env.JWT_EXPIRY || config.jwtExpiry;
  // Get jwt secret
  const jwtSecret = process.env.JWT_SECRET || config.jwtSecret;

  // Verify that user exists then check if password hash matches that stored
  // in user record
  if(user && bcrypt.compareSync(password, user.password)){
    // Omit hashed pasword from the return value
    const {password, ...userWithoutHash} = user.toObject();

    // Create a jwt access token signed with the user's id and role as the payload.
    let token = jwt.sign({sub: user.id, role: user.role}, jwtSecret, {expiresIn: expiryTime});

    // Return user summary (omitting password) and the jwt token.
    return {
      ...userWithoutHash,
      token
    };
  }
}

/**
  * Create a new user record and save to Mongo DB.
  * @param userInfo - Object that contains new user's email, password and name directly from
  * http request.
*/
async function create(userInfo){
  // Verify that user's email is unique
  if(await User.findOne({email: userInfo.email})){
    // If user already exists, throw error and return.
    const error = new Error('User Already Exists with Email "' + userInfo.email + '"');
    error.name = "UserAlreadyExistsError";
    throw error;
  }

  // Create a new user
  // calling new User(userInfo) would allow client to manually create fields within document
  // that shouldn't be done. For example populate created_at field through req body.
  const newUser = new User({email: userInfo.email, password: userInfo.password, name: userInfo.name});

  // Hash the user's password
  if(userInfo.password){
    newUser.password = bcrypt.hashSync(userInfo.password, 10);
  }

  // Commit user to DB
  await newUser.save();
}

/**
 * Get a user record from DB by ID
 * @param id
 * @returns The user's record without password
 */
async function getById(id){
  // Find user by ID in DB
  const user = await User.findById(id);

  // If no user was found, throw 404 error and return
  if(!user){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
  }

  // Return user and omit password
  const {password, ...userWithoutPassword} = user.toObject();
  return userWithoutPassword;
}

/**
  * Get all registered users from mongo DB
  * Print only name and id
  * @returns - A list of users
*/
async function getAll(){
  // Get all users
  const users = await User.find({}).select("name");

  // If no users were found, throw 404
  if(!users.length){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
  }

  return users;
}


/**
 * If authorized, edit the specified user
 * @param editorId - User editing's ID
 * @param userId - User to edit's Database ID
 * @param userInfo - Updated name and/or password
 * @returns {Promise<void>}
 */
async function edit(editorId, userId, userInfo){
  // Get the user
  const user = await User.findById(userId);

  // If no user matching that ID was found, throw 404
  if(!user){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
  }

  // Verify that record belongs to user using the token's payload
  if(editorId !== userId){
    const error = new Error();
    error.name = "UnauthorizedEditError";
    throw error;
  }

  // Make the edit(s)..
  // Update name
  if(userInfo.name){
    user.name = userInfo.name;
  }

  // Update Password
  if(userInfo.password){
    // Verify that user has also provided a *valid* old password
    if(!userInfo.old_password || !bcrypt.compareSync(userInfo.old_password, user.password)){
      const error = new Error();
      error.name = "AuthenticationFailedError";
      throw error;
    }

    // Hash and store the new password
    user.password = bcrypt.hashSync(userInfo.password, 10);
  }

  // Update Availability
  if(userInfo.available){
    user.available = userInfo.available;
  }

  // Commit changes to DB
  await user.save();
}

/**
 * If authorized, return a *filtered* list of all of the user's
 * bookings
 * @param userId
 * @param viewerId
 * @param limit
 * @param active
 * @returns {Promise<void>}
 */
async function getUserBookings(userId, viewerId, limit, active){
  // Get the user
  // TODO: Slice using mongoose so that only the *needed* bookings are retrieved
  // ^ https://github.com/Automattic/mongoose/issues/5737
  const user = await User.findById(userId).populate('bookings');

  // If no user matching that ID was found, throw an error
  if(!user){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
  }

  // Verify that the record belongs to the user
  if (!user._id.equals(viewerId)) {
    const error = new Error();
    error.name = "UnauthorizedViewError";
    throw error;
  }

  // If user has no bookings, return Error
  if(user.bookings.length === 0){
    const error = new Error();
    error.name = "BookingNotFoundError";
    throw error;
  }

  // Sort the bookings by datetime in descending order
  // Array is already 'sorted' given the order the booking was added
  // to the account, so just reverse the array. *cough* Bodge *cough*
  let bookings = user.bookings.reverse();

  // Limit the array by the number provided
  bookings = bookings.slice(0, limit);

  // If user requests only active bookings, filter the list
  if(active){
    bookings = bookings.filter(booking => booking.status !== Status.CANCELLED && booking.status !== Status.FINISHED);
  }

  // Return the list of bookings
  return bookings;
}
