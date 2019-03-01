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
