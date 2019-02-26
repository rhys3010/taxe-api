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
*/
function errorHandler(error, req, res, next){

  /**
    * Invalid Token Error
  */
  if(error.name == "InvalidTokenError" || error.name == "UnauthorizedError"){
    return res.status(401).json({
      "code": 2,
      "message": "Token Validation Failed"
    });
  }

  /**
    * Token Expiry Error
  */
  if(error.name == "TokenExpiredError"){
    return res.status(401).json({
      "code": 3,
      "message": "Token Expired"
    });
  }

  /**
    * No users found Error
  */
  if(error.name == "NoUsersFoundError"){
    return res.status(404).json({
      "code": 4,
      "message": "No Users Found"
    });
  }

  /**
    * Validation Error
    * TODO express-validator
  */

  /**
    * Default case, internal server error with details of error
  */
  return res.status(500).json({
    "code": 1,
    "message": "Internal Server Occured",
    "description": error.message

  });
}

module.exports = errorHandler;
