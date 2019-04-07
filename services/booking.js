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

    // Update Company
    if(bookingInfo.company && editorRole !== Role.Customer){
        // Verify that company exists
        let company = await Company.findById(bookingInfo.company);
        if(!company){
            const error = new Error();
            error.name = "CompanyNotFoundError";
            throw error;
        }

        booking.company = bookingInfo.company;
    }

    // Update Driver
    if(bookingInfo.driver && editorRole !== Role.Customer) {
        // Verify that driver exists
        let driver = await User.findById(bookingInfo.driver);
        if(!driver){
            const error = new Error();
            error.name = "NoUsersFoundError";
            throw error;
        }

        // Verify that driver is actually a driver
        if(driver.role !== Role.Driver){
            const error = new Error();
            error.name = "InvalidRoleError";
            throw error;
        }

        // TODO: Verify that driver works for owning company?

        booking.driver = bookingInfo.driver;
    }

    // Update Status (if not customer)
    if(bookingInfo.status && editorRole !== Role.Customer) {
        // Add Note to Booking
        bookingInfo.note = "Booking Status Changed From " + booking.status + " to " + bookingInfo.status;
        // If the booking status is being changed to 'Pending', it is being returned to the collective field
        if(bookingInfo.status === Status.PENDING){
            booking.company = null;
            booking.driver = null;

            // Remove any reference of this booking from the driver and company's booking records
            await User.update(
                {_id: booking.driver},
                {$pull: {bookings: {_id: booking.id}}});

            await Company.update(
                {_id: booking.company},
                {$pull: {bookings: {_id: booking.id}}});
        }

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

/**
 * Function to decide whether the user viewing / altering a booking
 * is authorized to do so
 * @param booking
 * @param user
 */
function isUserAuthorized(booking, user){
    // If the booking's status is pending:
    // Any COMPANY ADMIN can edit/view the booking
    // If the booking is any other status:
    // Only customer, driver and company admin of the booking' company can edit/view

    if(!user){
        return false;
    }

    // If the user is the customer or the driver, they are authed unconditionally
    if(user._id.equals(booking.customer) || user._id.equals(booking.driver)){
        return true;
    }

    // If the status is pending, impose the relevant rules
    if(booking.status === Status.PENDING){
        // If the user is a company admin, auth them.
        if(user.role === Role.Company_Admin){
            return true;
        }
    }else{
        // If status is not pending, allow company admin of the booking to
        // view /edit
        if(user.role === Role.Company_Admin && user.company === booking.company){
            return true;
        }
    }

    return false;
}