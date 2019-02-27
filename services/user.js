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
const User = db.User;

/**
  * Export all user tasks
*/
module.exports = {
  authenticate,
  create,
  getByEmail,
  getAll
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
  if(user && bcrypt.compareSync(password, user.hashed_password)){
    // Omit hashed pasword from the return value
    const {hashed_password, ...userWithoutHash} = user.toObject();

    // Create a jwt access token signed with the user's id and role as the payload.
    const token = jwt.sign({sub: user.id, role: user.role}, jwtSecret, {expiresIn: expiryTime});

    // Return user summary (omitting password) and the jwt token.
    return {
      ...userWithoutHash,
      token
    };
  }
}

/**
  * Create a new user record.
  * TODO: Validation
  * @param userInfo - Object that contains new user's email, password and name
*/
async function create(userInfo){
  // Verify that user's email is unique
  if(await User.findOne({email: userInfo.email})){
    // If user already exists, throw error and return.
    const error = new Error('User Already Exists with Email "' + userInfo.email + '"');
    error.name = "UserAlreadyExistsError";
    throw error;
    return;
  }

  // Create a new user
  const user = new User(userInfo);

  // Hash the user's password
  if(userInfo.password){
    user.hashed_password = bcrypt.hashSync(userInfo.password, 10);
  }

  // Commit user to DB
  await user.save();
}

/**
  * Get a user record from Email
  * @param email - The user's Email
  * @returns The user's record with password omitted
*/
async function getByEmail(email){
  // Find user by Email in DB
  const user = await User.findOne({email: email});

  // If no user was found, throw 404 error and return
  if(!user){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
    return;
  }

  // Return user and omit password
  const {hashed_password, ...userWithoutPassword} = user.toObject();
  return userWithoutPassword;
}

/**
  * Get all registered users from mongo DB
  * Print only name and id
  * @returns - A list of users
*/
async function getAll(){
  // Get all users
  const users = User.find({}).select("name");

  // If no users were found, throw 404
  if(users.length == 0){
    const error = new Error();
    error.name = "NoUsersFoundError";
    throw error;
    return;
  }

  return users;
}
