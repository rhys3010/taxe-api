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
    getBookings,
    getDrivers,
    addDriver,
    removeDriver
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

/**
 * Returns a list of all the company's drivers
 * @param req
 * @param res
 * @param next
 */
function getDrivers(req, res, next){
    companyService.getDrivers(res.locals.userId, req.params.id)
        .then(drivers => res.status(200).json(drivers))
        .catch(err => next(err));
}

/**
 * Adds a driver to a given company
 * @param req
 * @param res
 * @param next
 */
function addDriver(req, res, next){
    companyService.addDriver(res.locals.userId, req.params.id, req.body.driver)
        .then(() => res.status(201).json("Driver Successfully Added"))
        .catch(err => next(err));
}

/**
 * Removes a driver from a given company
 * @param req
 * @param res
 * @param next
 */
function removeDriver(req, res, next){
    companyService.removeDriver(res.locals.userId, req.params.companyId, req.params.driverId)
        .then(() => res.status(204).json("Driver Successfully Removed"))
        .catch(err => next(err));

}