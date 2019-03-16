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
const mongoose = require('mongoose');

/**
 * Export all the tasks
 */

module.exports = {
    create,
    getById
};


/**
 * Create a new booking by providing all the necessary information as a json object.
 * @param bookingInfo
 * @returns The id of the booking created
 */
async function create(bookingInfo){
    // Check if listed customer already has an active booking...

    let newBooking;
    // Generate booking ID to return later and store in database
    // TODO: Duplicate IDs?
    let bookingId = mongoose.Types.ObjectId();

    // Create a new booking (with notes)
    if(bookingInfo.notes){
        newBooking = new Booking({pickup_location: bookingInfo.pickup_location, destination: bookingInfo.destination,
            time: bookingInfo.time, no_passengers: bookingInfo.no_passengers, customer: bookingInfo.customer,
            notes: bookingInfo.notes, _id: bookingId});

        // Create a new booking (without notes)
    }else{
        newBooking = new Booking({pickup_location: bookingInfo.pickup_location, destination: bookingInfo.destination,
            time: bookingInfo.time, no_passengers: bookingInfo.no_passengers, customer: bookingInfo.customer, _id: bookingId});
    }

    // Commit new booking to DB
    await newBooking.save();

    // Return the booking ID
    return bookingId;
}

/**
 * Get a Booking by its ID
 * @param id
 * @returns the booking or not found error
 */
async function getById(id){
    // Get booking by ID in mongoose
    const booking = await Booking.findById(id);

    // If no booking was found, throw 404 error and return
    if(!booking){
        const error = new Error();
        error.name = "NoBookingsFoundError";
        throw error;
    }

    // Return booking
    return booking.toObject();
}