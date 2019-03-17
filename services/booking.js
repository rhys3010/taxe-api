/**
 * booking.js
 *
 * Handle all booking tasks by interfacing with database, this module
 * behaves as a layer of abstraction between the controller class and the database
 * perform all DB calls asynchronously
 * @author Rhys Evans
 * @version 0.2
 */

'use strict';

const db = require('../helpers/db');
const Booking = db.Booking;
const User = db.User;
const mongoose = require('mongoose');
const Status = require('../helpers/status');

/**
 * Export all the tasks
 */

module.exports = {
    create,
    getById,
    edit
};


/**
 * Create a new booking by providing all the necessary information as a json object.
 * @param userId - The ID of the user creating the booking (the customer)
 * @param bookingInfo
 * @returns The id of the booking created
 */
async function create(userId, bookingInfo){
    // Check if listed customer exists
    let user = await User.findById(userId);

    if(!user){
        const error = new Error();
        error.name = "NoUsersFoundError";
        throw error;
    }

    // Check if listed customer already has an active booking by popping latest
    // booking and checking its status
    let recentBooking = await Booking.findById(user.bookings.pop());
    if(isBookingActive(recentBooking)){
        const error = new Error();
        error.name = "CustomerAlreadyHasActiveBookingError";
        throw error;
    }

    let newBooking;
    // Generate booking ID to return later and store in database
    // TODO: Duplicate IDs?
    let bookingId = mongoose.Types.ObjectId();

    // Create a new booking (with notes)
    if(bookingInfo.notes){
        newBooking = new Booking({pickup_location: bookingInfo.pickup_location, destination: bookingInfo.destination,
            time: bookingInfo.time, no_passengers: bookingInfo.no_passengers, customer: userId,
            notes: bookingInfo.notes, _id: bookingId});

        // Create a new booking (without notes)
    }else{
        newBooking = new Booking({pickup_location: bookingInfo.pickup_location, destination: bookingInfo.destination,
            time: bookingInfo.time, no_passengers: bookingInfo.no_passengers, customer: userId, _id: bookingId});
    }

    // Commit new booking to DB
    await newBooking.save();

    // When booking is created, also save it to the customer's record
    await User.findOneAndUpdate(
        {_id: userId},
        {$push: {bookings: bookingId}}
    );

    // Return the booking ID
    return bookingId;
}

/**
 * Get a Booking by its ID
 * @param userId
 * @param bookingId
 * @returns the booking or not found error
 */
async function getById(userId, bookingId){
    // Get booking by ID in mongoose and populate the 'customer' and 'driver' field with their respective names
    const booking = await Booking.findById(bookingId).populate('customer', 'name').populate('driver', 'name');

    // If no booking was found, throw 404 error and return
    if(!booking){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }


    // If user making the request isn't either the listed customer or driver, throw 403
    // Note: although not ideal, driver or customer COULD be null at this point so messy if statements
    // needed
    // TODO: Consider moving to middleware?
    if(!booking.customer){
        const error = new Error();
        error.name = "UnauthorizedViewError";
        throw error;
    }

    if(!booking.driver){
        if (!booking.customer._id.equals(userId)) {
            const error = new Error();
            error.name = "UnauthorizedViewError";
            throw error;
        }
    }else{
        if(!booking.customer._id.equals(userId) && !booking.driver._id.equals(userId)){
            const error = new Error();
            error.name = "UnauthorizedViewError";
            throw error;
        }
    }


    // Return booking
    return booking.toObject();
}


/**
 * If authorized, edit the specified booking, allowed edits:
 *
 * - Change Driver
 * - Change Time
 * - Change Status
 *
 * @param editorId - The user editing's ID
 * @param bookingId - The ID of the booking being editted
 * @param bookingInfo - Updated booking information
 * @returns {Promise<void>}
 */
async function edit(editorId, bookingId, bookingInfo) {
    // Get the booking
    const booking = await Booking.findById(bookingId);

    // If no booking matching that id was found, throw 404
    if (!booking) {
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    // Verify that the user editing the booking is either the customer or the driver
    // TODO: Consider moving to middleware?
    if(!booking.customer){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    if(!booking.driver){
        if (!booking.customer.equals(editorId)) {
            const error = new Error();
            error.name = "UnauthorizedEditError";
            throw error;
        }
    }else{
        if (!booking.customer.equals(editorId) && !booking.driver.equals(editorId)) {
            const error = new Error();
            error.name = "UnauthorizedEditError";
            throw error;
        }
    }

    // Make the edit(s)
    if (bookingInfo.driver) {
        // Verify that driver exists
        let driver = await User.findById(bookingInfo.driver);
        if(!driver){
            const error = new Error();
            error.name = "NoUsersFoundError";
            throw error;
        }

        // Verify that driver is actually a driver
        if(driver.role === 'Customer'){
            const error = new Error();
            error.name = "InvalidRoleError";
            throw error;
        }

        booking.driver = bookingInfo.driver;
    }

    if (bookingInfo.status) {
        booking.status = bookingInfo.status;
    }

    if (bookingInfo.time) {
        booking.time = bookingInfo.time;
    }

    // Commit changes to DB
    await booking.save();
}


///////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

/**
 * Utility function to check if a booking is active
 * @param booking - The booking to evaluate
 */
function isBookingActive(booking){
    // If recent booking doesn't exist, return false
    if(!booking){
        return false;
    }

    // If booking is Finished or Cancelled, its inactive
    if(booking.status === Status.FINISHED || booking.status === Status.CANCELLED){
        return false;
    }

    return true;
}