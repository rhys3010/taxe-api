/**
 * validate.js
 * Validation middleware to check HTTP requests are valid (duh)
 * and meet all necessary criteria
 * @author Rhys Evans
 * @version 0.2
 * */

const mongoose = require('mongoose');
const Status = require('../helpers/status');

'use strict';

module.exports = {
    userCreate,
    userEdit,
    mongoObjectId,
    bookingCreate,
    bookingEdit,
    addDriver,
    claimBooking
};

/**
 * Constant for the time restrictions of bookings
 */
// How far in the future are we willing to take bookings for?
const MAX_HOURS_FUTURE = 3;
// How much notice do we need for a booking (i.e. 10 minutes in future..)
const MIN_MINUTES_NOTICE = 10;

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
    if(!info.name && !info.password && !info.available){
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
        error.name = "InvalidObjectIdError";
        throw error;
    }

    next();
}

/**
 * Validate input for booking creation
 * @param req
 * @param res
 * @param next
 */
function bookingCreate(req, res, next){
    const info = req.body;

    // A list of errors to potentially throw within
    // ValidationError (as nested errors)
    let errors = [];

    // Make sure that each required field of user info exists and
    if(!info.pickup_location || !info.destination || !info.time || !info.no_passengers){
        // If any fields are missing, throw error and return now
        // to avoid any null pointers
        errors.push("Pickup Location, Destination, Time, Number of Passengers and Customer ID must be provided");
        errors.name = "ValidationError";
        throw errors;
    }

    // Make sure that there are no duplicate fields
    // by checking each key in the info object to see if its an array.
    // If there are multiple entries of the same key in a HTTP request body
    // they are formed into an array under the same key.
    if(Array.isArray(info.pickup_location) || Array.isArray(info.destination) || Array.isArray(info.time) || Array.isArray(info.no_passengers)){
        errors.push("Duplicate Entries Found");
    }

    // Make sure that the time provided isn't too far in the future, isn't too soon and isnt in past
    if(!isValidTime(info.time)){
        errors.push("Booking time cannot be in the past, further than " + MAX_HOURS_FUTURE + " hours away, or sooner than " + MIN_MINUTES_NOTICE + " minutes away");
    }

    // Make sure that the provided number of passengers is valid
    if(info.no_passengers < 1){
        errors.push("Must have at least one passenger");
    }

    // If there are errors, throw them
    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}

/**
 * Validate input for booking edit
 * @param req
 * @param res
 * @param next
 */
function bookingEdit(req, res, next){
    // Updated user info from http body
    const info = req.body;

    // Keep a list of validation errors to output
    let errors = [];

    // If no updated information was provided, throw error
    if(!info.driver && !info.status && !info.time && !info.note){
        errors.push("No updated information found: Update-able fields include: Time, Status, Driver, and Notes");
        errors.name = "ValidationError";
        throw errors;
    }

    // Make sure that there are no duplicate fields
    // by checking each key in the info object to see if its an array.
    // If there are multiple entries of the same key in a HTTP request body
    // they are formed into an array under the same key.
    if(Array.isArray(info.driver) || Array.isArray(info.time) || Array.isArray(info.status) || Array.isArray(info.note)){
        errors.push("Duplicate Entries Found");
    }

    // Make sure the time is valid
    if(info.time){
        if(!isValidTime(info.time)){
            errors.push("Booking time cannot be in the past, further than " + MAX_HOURS_FUTURE + " hours away, or sooner than " + MIN_MINUTES_NOTICE + " minutes away");
        }
    }

    // Make sure that the status is valid
    if(info.status){
        if(!isValidStatus(info.status)){
            errors.push("Booking Status cannot be set to 'Pending', for this use the Booking Release Route.")
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
 * Validate input for adding a new driver
 * @param req
 * @param res
 * @param next
 */
function addDriver(req, res, next){
    let errors = [];

    // Body should contain driver
    if(!req.body.driver){
        errors.push("New Driver's ID Must Be Provided")
    }

    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
    }

    next();
}

/**
 * Validate input for claiming a booking
 * @param req
 * @param res
 * @param next
 */
function claimBooking(req, res, next){
    let errors = [];

    // Body should contain driver
    if(!req.body.company){
        errors.push("Company's ID Must Be Provided")
    }

    if(errors.length !== 0){
        errors.name = "ValidationError";
        throw errors;
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

/**
 * Util function to evaluate whether a provided time meets the following requirements
 * Cannot be too far into the future (see const)
 * Cannot be in the past
 * Cannot be too soon (see const)
 * @param input
 */
function isValidTime(input){
    // Parse the ISO time string to a JS date object
    let bookingTime =  Date.parse(input);

    // Get the number of hours from now to the booking time
    let hours = Math.abs(bookingTime - Date.now()) / 36e5;

    // If the difference in hours between now and booking time is more than specified, return false
    if(hours > MAX_HOURS_FUTURE){
        return false;
    }

    // If the booking time is in the PAST, return false
    if(bookingTime < Date.now()){
        return false;
    }

    // If the difference in minutes between now and booking time is less than specified, return false
    if((hours*60) < MIN_MINUTES_NOTICE){
        return false;
    }

    return true;
}

/**
 * Util function to evaluate whether a provided status meets the following requirements:
 * - Cannot be changed TO pending
 * @param input
 */
function isValidStatus(input){
    return input !== Status.PENDING;
}
