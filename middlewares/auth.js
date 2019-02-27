/**
  * auth.js
  * Authorization middleware to verify and validate user's
  * access token.
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const config = require('../config.json');
const jwt = require('jsonwebtoken');

/**
  * Verify that user's auth token is valid
  * @param req - HTTP request object
  * @param res - HTTP response object
  * @param next - The next middleware to execute
*/
function auth(req, res, next){
  // Get the auth header
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];

  // Verify that it had contents
  if(!authHeader){
    // Throw error if no header contents
    const error = new Error();
    error.name = "MissingTokenError";
    throw error;
    return
  }else{
    // Remove 'bearer'
    const token = authHeader.split(" ")[1];

    // Verify integrity of token
    if(!token){
      // If token is invalid, throw error
      const error = new Error();
      error.name = "InvalidTokenError";
      throw error;
      return;
      // If token is valid
    }else{
      // Get payload from token
      var payload = jwt.verify(token, config.jwtSecret);
      // Attach user info from token payload to the response object
      res.locals.userId = payload.sub;
      res.locals.userRole = payload.role;
    }
  }

  next();
}

module.exports = auth;
