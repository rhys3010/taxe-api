/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

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
const Company = db.Company;
const mongoose = require('mongoose');
const Status = require('../helpers/status');
const Role = require('../helpers/role');

/**
 * Export all the tasks
 */

module.exports = {
    create,
    getById,
    edit,
    getUnallocatedBookings,
    claimBooking,
    releaseBooking
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
 * @param userRole
 * @param bookingId
 * @returns the booking or not found error
 */
async function getById(userId, userRole, bookingId){
    // Get booking by ID in mongoose and populate the 'customer' and 'driver' field with their respective names
    const booking = await Booking.findById(bookingId).populate('customer', 'name').populate('driver', 'name');
    // Get the user
    const user = await User.findById(userId);

    // If no booking was found, throw 404 error and return
    if(!booking){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    const unpopulatedBooking = await Booking.findById(bookingId);
    // If user is not authed, return UnauthorizedViewError
    if(!isUserAuthorized(unpopulatedBooking, user)){
        const error = new Error();
        error.name = "UnauthorizedViewError";
        throw error;
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
 * - Change Company
 * - Add Notes
 *
 * @param editorId - The user editing's ID
 * @param editorRole - the Role of the editing user
 * @param bookingId - The ID of the booking being editted
 * @param bookingInfo - Updated booking information
 * @returns {Promise<void>}
 */
async function edit(editorId, editorRole, bookingId, bookingInfo) {
    // Get the booking
    const booking = await Booking.findById(bookingId);
    // Get the user
    const user = await User.findById(editorId);

    // If no booking matching that id was found, throw 404
    if(!booking) {
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    // If user is not authed, return UnauthorizedEditError
    if(!isUserAuthorized(booking, user)){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    // Make the edit(s)

    // Update Driver
    if(bookingInfo.driver && editorRole !== Role.Customer) {
        // Verify that driver exists
        let driver = await User.findById(bookingInfo.driver);
        if(!driver){
            const error = new Error();
            error.name = "NoUsersFoundError";
            throw error;
        }

        // Verify that driver is actually a driver and is in the company
        if(driver.role !== Role.Driver || !driver.company.equals(booking.company)){
            const error = new Error();
            error.name = "UnauthorizedEditError";
            throw error;
        }

        // Remove booking from old driver's account
        if(booking.driver){
            // Get the old driver
            const oldDriver = await User.findById(booking.driver);
            if(oldDriver){
                oldDriver.bookings.remove(bookingId);
                await oldDriver.save();
            }
        }

        // Add booking to driver's account
        await User.findOneAndUpdate(
            {_id: bookingInfo.driver},
            {$push: {bookings: bookingId}});

        booking.driver = bookingInfo.driver;
    }

    // Update Status
    if(bookingInfo.status) {
        // Add Note to Booking
        bookingInfo.note = "Booking Status Changed From " + booking.status + " to " + bookingInfo.status;
        booking.status = bookingInfo.status;
    }

    // Update Time
    if(bookingInfo.time) {
        booking.time = bookingInfo.time;
    }

    // Add Note
    if(bookingInfo.note){
        await Booking.findOneAndUpdate(
            {_id: booking.id},
            {$push: {notes: bookingInfo.note}}
        );
    }

    // TODO: Send Notification(s)

    // Commit changes to DB
    await booking.save();
}

/**
 * Returns a list of all the bookings that are currently 'unallocated'
 * (their status are pending)
 * @returns {Promise<void>}
 */
async function getUnallocatedBookings(){
    // Get all bookings with status 'pending'
    const bookings = await Booking.find({status: Status.PENDING});

    // If no bookings were found return 404
    if(bookings.length === 0){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    return bookings;
}

/**
 * Allow company admins to claim a specific booking for their own company
 * @param userId
 * @param bookingId
 * @param companyId
 * @returns {Promise<void>}
 */
async function claimBooking(userId, bookingId, companyId){
    // Verify that booking exists
    const booking = await Booking.findById(bookingId);
    if(!booking){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    // Verify that booking is UNALLOCATED
    if(booking.status !== Status.PENDING){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    // Verify that company exists
    const company = await Company.findById(companyId);
    if(!company){
        const error = new Error();
        error.name = "CompanyNotFoundError";
        throw error;
    }

    // Verify that user is an admin of the booking
    if(!company.admins.some(admin => admin.equals(userId))){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    // Set booking's status to 'In Progress'
    booking.status = Status.IN_PROGRESS;

    // Set booking's company to company
    booking.company = companyId;

    // Add booking to company's record
    await Company.findOneAndUpdate(
        {_id: companyId},
        {$push: {bookings: bookingId}});

    // Add note to Booking
    await Booking.findOneAndUpdate(
        {_id: booking.id},
        {$push: {notes: "Booking Claimed by: " + company.name}}
    );


    await booking.save();
}

/**
 * Allow Company Admins and Drivers to release a booking back to the collective
 * unallocated pool
 * @param userId
 * @param bookingId
 * @returns {Promise<void>}
 */
async function releaseBooking(userId, bookingId){
    // Verify that the booking exists
    const booking = await Booking.findById(bookingId);
    const user = await User.findById(userId);

    if(!booking){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    // Verify that user is authorized to release the booking
    if(!isUserAuthorized(booking, user) || booking.status === Status.PENDING){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    // Get the company responsible for the booking
    const company = await Company.findById(booking.company);

    // Check if the user releasing the booking is the booking's driver
    let driver;
    if(user._id.equals(booking.driver)){
        driver = user;
    }else{
        driver = await User.findById(booking.driver);
    }

    // Set Booking status
    booking.status = Status.PENDING;

    // Set booking's company to null
    booking.company = undefined;
    // Set booking's driver to null
    booking.driver = undefined;

    // Remove booking reference from driver's account (if exists)
    if(driver){
        driver.bookings.remove(bookingId);
        await driver.save();
    }

    // Remove booking reference from company's account
    company.bookings.remove(bookingId);

    // Add note to Booking
    await Booking.findOneAndUpdate(
        {_id: booking.id},
        {$push: {notes: "Booking Released"}}
    );

    await booking.save();
    await company.save();
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
    return !(booking.status === Status.FINISHED || booking.status === Status.CANCELLED);
}

/**
 * Function to decide whether the user viewing / altering a booking
 * is authorized to do so
 * @param booking
 * @param user
 */
function isUserAuthorized(booking, user){
    // Only customer, driver and company admin of the booking' company can edit/view

    if(!user){
        return false;
    }

    // If the user is the customer or the driver, they are authed unconditionally
    if(user._id.equals(booking.customer) || user._id.equals(booking.driver)){
        return true;
    }

    // If the user is an Admin of the booking's company
    if(user.role === Role.Company_Admin && user.company.equals(booking.company)){
        return true;
    }

    return false;
}