/**
 * companies.js
 *
 * Service for company model, handle all backend behaviour for any company routes.
 *
 * @author Rhys Evans
 * @version 0.1
 */

'use strict';

const db = require('../helpers/db');
const Company = db.Company;
const Status = require('../helpers/status');
const mongoose = require('mongoose');

/**
 * Export all company tasks
 */
module.exports = {
    getById,
    getCompanyBookings
};

/**
 * Returns a company record with populated list of admins
 * @param viewerId
 * @param id
 */
async function getById(viewerId, id){
    const company = await Company.findById(id);

    // If no company exists, return 404
    if(!company){
        const error = new Error();
        error.name = "CompanyNotFoundError";
        throw error;
    }

    // Verify that the viewing user is a company admin for that company
    if(!company.admins.some(admin => admin.equals(viewerId))){
        const error = new Error();
        error.name = "UnauthorizedViewError";
        throw error;
    }

    return company.toObject();
}

/**
 * If authorized, returns a *filtered* list of all the company's bookings
 * @param companyId
 * @param viewerId
 * @param limit
 * @param active
 * @returns {Promise<void>}
 */
async function getCompanyBookings(companyId, viewerId, limit, active){
    // Get the company record
    const company = await Company.findById(companyId).populate('bookings');

    // If no company by that ID exists, throw 404
    if(!company){
        const error = new Error();
        error.name = "CompanyNotFoundError";
        throw error;
    }

    // If company has no bookings
    if(company.bookings.length === 0){
        const error = new Error();
        error.name = "BookingNotFoundError";
        throw error;
    }

    // Verify that the viewing user is a company admin for that company
    if(!company.admins.includes(viewerId)){
        const error = new Error();
        error.name = "UnauthorizedViewError";
        throw error;
    }

    // Sort the bookings by datetime in descending order
    // Array is already 'sorted' given the order the booking was added
    // to the account, so just reverse the array. *cough* Bodge *cough*
    let bookings = company.bookings.reverse();

    // Limit the array by the number provided
    bookings = bookings.slice(0, limit);

    // If user requests only active bookings, filter the list
    if(active){
        bookings = bookings.filter(booking => booking.status !== Status.CANCELLED && booking.status !== Status.FINISHED);
    }

    // Return the list of bookings
    return bookings;
}