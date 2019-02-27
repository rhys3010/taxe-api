/**
  * error-handler.js
  * Middleware to catch errors and return detailed description
  * Error codes used for client localization
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

/**
  * Based on 'error' param, return json with details of error
  * and return correct HTTP status code
  * @param error - The error received by controller
  * @param req - The HTTP request
  * @param res - The HTTP response object
  * @param next -  The next middleware to be executed.
  * @returns - HTTP response object with HTTP status code and JSON output.
*/
function errorHandler(error, req, res, next){

  /**
    * Invalid Token Error
  */
  if(error.name == "InvalidTokenError" || error.name == "UnauthorizedError" || error.name == "JsonWebTokenError"){
    return res.status(403).json({
      "code": 1,
      "message": "Token Validation Error",
      "description": "Invalid Token Provided"
    });
  }

  /**
    * Token Expiry Error
  */
  if(error.name == "TokenExpiredError"){
    return res.status(403).json({
      "code": 2,
      "message": "Token Expired Error",
      "description": "The provided token has expired."
    });
  }

  /**
    * Token not found error
  */
  if(error.name == "MissingTokenError"){
    return res.status(401).json({
      "code": 3,
      "message": "Missing Token Error",
      "description": "Could not find auth token in request header."
    });
  }

  /**
    * No users found Error
  */
  if(error.name == "NoUsersFoundError"){
    return res.status(404).json({
      "code": 4,
      "message": "User Not Found Error",
      "description": "The email you entered does not match any current records."
    });
  }

  /**
    * User already exists error
  */
  if(error.name == "UserAlreadyExistsError"){
    return res.status(400).json({
      "code": 5,
      "message": "User Already Exists Error",
      "description": error.message
    });
  }

  /**
    * Authentication Failure Error
  */
  if(error.name == "AuthenticationFailedError"){
    return res.status(403).json({
      "code": 6,
      "message": "Authentication Error",
      "description": "Invalid Email or Password"
    });
  }

  /**
    * Validation Error
    * TODO express-validator
    * TODO user already exists
  */

  /**
    * Default case, internal server error with details of error
  */
  return res.status(500).json({
    "code": 0,
    "message": "Internal Server Occured",
    "description": error.message
  });
}

module.exports = errorHandler;
