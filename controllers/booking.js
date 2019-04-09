/**
 * booking.js
 *
 * Booking Controller Class, all needed functions for each route
 * @author Rhys Evans
 * @version 0.2
 */

'use strict';

const bookingService = require('../services/booking');

module.exports = {
    create,
    getById,
    edit,
    getUnallocatedBookings,
    claimBooking,
    releaseBooking
};

/**
 * Create a new booking by calling the 'create' function in
 * the booking service
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next){
    bookingService.create(res.locals.userId, req.body)
        .then(bookingId => res.status(201).json({message: "Booking Successfully Created", booking_id: bookingId}))
        .catch(err => next(err));
}

/**
 * Retrieve a booking by its ID
 * @param req
 * @param res
 * @param next
 */
function getById(req, res, next){
    bookingService.getById(res.locals.userId, res.locals.userRole, req.params.id)
        .then(booking => res.status(200).json(booking))
        .catch(err => next(err));
}

/**
 * Edit (if authorized) a booking
 * @param req
 * @param res
 * @param next
 */
function edit(req, res, next){
    bookingService.edit(res.locals.userId, res.locals.userRole, req.params.id, req.body)
        .then(() => res.status(200).json({message: "Booking Successfully Edited"}))
        .catch(err => next(err));
}

/**
 * Retrieve a list of all unallocated bookings
 * @param req
 * @param res
 * @param next
 */
function getUnallocatedBookings(req, res ,next){
    bookingService.getUnallocatedBookings()
        .then(bookings => res.status(200).json(bookings))
        .catch(err => next(err));
}

/**
 * Allow company admins to claim an unallocated booking for their company
 * @param req
 * @param res
 * @param next
 */
function claimBooking(req, res, next){
    bookingService.claimBooking(res.locals.userId, req.params.id, req.body.company)
        .then(() => res.status(200).json({message: "Booking Successfully Claimed"}))
        .catch(err => next(err));
}

/**
 * Release a booking back into the unallocated pool
 * @param req
 * @param res
 * @param next
 */
function releaseBooking(req, res, next){
    bookingService.releaseBooking(res.locals.userId, req.params.id)
        .then(() => res.status(200).json({message: "Booking Successfully Released"}))
        .catch(err => next(err));
}
