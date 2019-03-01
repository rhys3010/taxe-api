/**
 * validate.js
 * Validation middleware to check HTTP requests are valid (duh)
 * and meet all necessary criteria
 * @author Rhys Evans
 * @version 0.1
 * */

module.exports = {
    userCreate
};

/**
 * Validate input for user creation
 * @param req
 * @param res
 * @param next
 */
function userCreate(req, res, next){
    info = req.body;

    // A list of errors to potentially throw within
    // ValidationError (as nested errors)
    const errors = [];

    // Make sure that each required field of user info exists and
    if(!info.email || !info.name || !info.password){
        errors.push("Email, Name or Password was not provided");
    }

    // Make sure that there are no duplicate fields
    // by checking each key in the info object to see if its an array.
    // If there are multiple entries of the same key in a HTTP request body
    // they are formed into an array under the same key.
    if(Array.isArray(info.name) || Array.isArray(info.email) || Array.isArray(info.password)){
        errors.push("Duplicate Entries Found");
    }

    // Make sure that the provided email is actually an email

    // Make sure that the provided password meets the password requirements

    // Make sure that the provided name is of valid length etc.

    // If there are errors, throw them
    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}