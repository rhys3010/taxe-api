/**
 * validate.js
 * Validation middleware to check HTTP requests are valid (duh)
 * and meet all necessary criteria
 * @author Rhys Evans
 * @version 0.1
 * */

const mongoose = require('mongoose');

'use strict';

module.exports = {
    userCreate,
    userEdit,
    mongoObjectId
};

/**
 * Validate input for user creation
 * @param req
 * @param res
 * @param next
 */
function userCreate(req, res, next){
    const info = req.body;

    // A list of errors to potentially throw within
    // ValidationError (as nested errors)
    let errors = [];

    // Make sure that each required field of user info exists and
    if(!info.email || !info.name || !info.password){
        // If any fields are missing, throw error and return now
        // to avoid any null pointers
        errors.push("Email, Name or Password was not provided");
        errors.name = "ValidationError";
        throw errors;
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
        errors.push("Names cannot contain any numbers or special characters and must be atlesat 3 characters");
    }

    // If there are errors, throw them
    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}

/**
 * Validate input for user edit
 * @param req
 * @param res
 * @param next
 */
function userEdit(req, res, next){
    // Updated user info from http body
    const info = req.body;

    // Keep a list of validation errors to output
    let errors = [];

    // If no updated password or name were provided, throw error
    if(!info.name && !info.password){
        errors.push("No updated information found");
        errors.name = "ValidationError";
        throw errors;
    }

    // Make sure there aren't any duplicate fields
    if(Array.isArray(info.name) || Array.isArray(info.password)){
        errors.push("Duplicate Entries Found");
    }

    // Make sure that the provided password meets the password requirements
    if(info.password) {
        if (!isValidPassword(info.password)) {
            errors.push("Password must be at least 8 characters long and contain at least one number");
        }
    }

    // Make sure that the provided name doesn't contain any number or special characters
    // With the exception of a hyphen
    if(info.name){
        if(!isValidName(info.name)){
            errors.push("Names cannot contain any numbers or special characters and must be atlesat 3 characters");
        }
    }

    // If there are errors, throw them
    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}

/**
 * Validate MongoDB Object Id
 * @param req
 * @param res
 * @param next
 */
function mongoObjectId(req, res, next){
    const id = req.params.id;

    // Verify that 'id' is valid
    // If it isn't throw error
    if(!mongoose.Types.ObjectId.isValid(id)){
        const error = new Error();
        error.name = "InvalidObjectId";
        throw error;
    }

    next();
}

//////////////////////////////////
/////// PRIVATE FUNCTIONS ////////
//////////////////////////////////

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
 * and must be at least 3 characters
 * @param input
 */
function isValidName(input){

    // Verify that name only contains hyphen, space or A-Z
    // and that it is atleast 3 characters long
    return input.length > 3 && /^[a-zA-z- ]+$/.test(input);
}
