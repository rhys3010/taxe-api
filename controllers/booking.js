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
    edit
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
    bookingService.getById(res.locals.userId, req.params.id)
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
    bookingService.edit(res.locals.userId, req.params.id, req.body)
        .then(() => res.status(200).json({message: "Booking Successfully Edited"}))
        .catch(err => next(err));
}