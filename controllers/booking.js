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
    getById
};

/**
 * Create a new booking by calling the 'create' function in
 * the booking service
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next){
    bookingService.create(req.body)
        .then(bookingId => res.status(201).json(bookingId))
        .catch(err => next(err));
}

/**
 * Retrieve a booking by its ID
 * @param req
 * @param res
 * @param next
 */
function getById(req, res, next){
    bookingService.getById(req.params.id)
        .then(booking => res.status(200).json(booking))
        .catch(err => next(err));
}