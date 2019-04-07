/**
 * companies.js
 *
 * Controller class for company, allow route requests to communicate with company service
 *
 * @author Rhys Evans
 * @version 0.1
 */

'use strict';

const companyService = require('../services/company');

module.exports = {
    getById,
    getBookings
};

/**
 * Returns information about a given company
 * @param req
 * @param res
 * @param next
 */
function getById(req, res, next){
    companyService.getById(res.locals.userId, req.params.id)
        .then(company => res.status(200).json(company))
        .catch(err => next(err));
}

/**
 * Returns a list of all the company's bookings
 * @param req
 * @param res
 * @param next
 */
function getBookings(req, res, next){
    companyService.getCompanyBookings(req.params.id, res.locals.userId, req.query.limit, req.query.active)
        .then(bookings => res.status(200).json(bookings))
        .catch(err => next(err));
}