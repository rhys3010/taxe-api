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
    if(!isEmail(info.email)){
        errors.push("Invalid Email Entered");
    }

    // Make sure that the provided password meets the password requirements
    if(!isValidPassword(info.password)){
        errors.push("Password must be at least 8 characters long and contain at least one number");
    }

    // Make sure that the provided name doesn't contain any number or special characters
    // With the exception of a hyphen
    if(!isValidName(info.name)){
        errors.push("Names cannot contain any numbers or special characters");
    }

    // If there are errors, throw them
    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}

/**
 * Utility function to evaluate whether a given input is an email or not
 * Regular Expresssion taken from: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
 * @param input - The Email the user has entered
 */
function isEmail(input){
    let regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regExp.test(String(input).toLowerCase());
}

/**
 * Util function to evaluate whether a given input meets the following requirements
 * Must be atleast 8 characters long
 * Must contain atleast one number
 * @param input - the password the user's entered
 */
function isValidPassword(input) {
    // Verify length
    if (input.length < 8) {
        return false;
    }

    // Verify that it contains a number
    return /\d/.test(input);
}

/**
 * Util function to evaluate whether a given input meets the following requirements
 * Cannot contain any numbers or symbols (other than -). (A-Z) only
 * @param input
 */
function isValidName(input){

    // Verify that name only contains hyphen, space or A-Z
    return /^[a-zA-z-" "]+$/.test(input);
}
