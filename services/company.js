/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

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
const User = db.User;
const Booking = db.Booking;
const Status = require('../helpers/status');
const Role = require('../helpers/role');
const mongoose = require('mongoose');

/**
 * Export all company tasks
 */
module.exports = {
    getById,
    getCompanyBookings,
    getDrivers,
    addDriver,
    removeDriver
};

/**
 * Returns a company record with populated list of admins
 * @param viewerId
 * @param id
 */
async function getById(viewerId, id){
    const company = await Company.findById(id);

    authorizeRequest(viewerId, company, true);

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

    authorizeRequest(viewerId, company, true);

    // If company has no bookings
    if(company.bookings.length === 0){
        const error = new Error();
        error.name = "BookingNotFoundError";
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

/**
 * Returns a populated list of all the company's drivers
 * @param userId
 * @param companyId
 * @returns {Promise<void>}
 */
async function getDrivers(userId, companyId){
    const company = await Company.findById(companyId);

    authorizeRequest(userId, company, true);

    // If no drivers were found, throw 404
    if(!company.drivers.length){
        const error = new Error();
        error.name = "NoUsersFoundError";
        throw error;
    }

    const companyPopulated = await Company.findById(companyId).populate('drivers', 'name');

    return companyPopulated.drivers;
}

/**
 * Add a new driver to a given company
 * @param userId
 * @param companyId
 * @param driverId
 * @returns {Promise<void>}
 */
async function addDriver(userId, companyId, driverId){
    const company = await Company.findById(companyId);
    const driver = await User.findById(driverId);

    authorizeRequest(userId, company, false);

    // Verify that driver exists
    if(!driver){
        const error = new Error();
        error.name = "NoUsersFoundError";
        throw error;
    }

    // Verify that driver isn't already a driver
    if(driver.role === Role.Driver || driver.company || company.drivers.some(driver => driver.equals(driverId))){
        const error = new Error();
        error.name = "DriverAlreadyAddedError";
        throw error;
    }

    // Add driver to company:
    // Change role to Driver
    driver.role = Role.Driver;

    // Set Driver->Company to company's ID
    driver.company = companyId;

    // Add driver to company's drivers list
    await Company.findOneAndUpdate(
        {_id: companyId},
        {$push: {drivers: driverId}});

    await driver.save();
}

/**
 * Remove a driver from a given company
 * @param userId
 * @param companyId
 * @param driverId
 * @returns {Promise<void>}
 */
async function removeDriver(userId, companyId, driverId){
    const company = await Company.findById(companyId);
    const driver = await User.findById(driverId);

    authorizeRequest(userId, company, true);

    // Verify that driver exists
    if(!driver){
        const error = new Error();
        error.name = "NoUsersFoundError";
        throw error;
    }

    // Verify that the user is either an admin or the driver themselves
    // (prevents drivers from removing other drivers)
    // If the user isn't an admin and isn't the driver being removed..
    if(!company.admins.some(admin => admin.equals(userId)) &&
        userId !== driverId){
        const error = new Error();
        error.name = "UnauthorizedEditError";
        throw error;
    }

    // Verify that driver is indeed in the company
    if(!company.drivers.some(driver => driver.equals(driverId))){
        const error = new Error();
        error.name = "NoUsersFoundError";
        throw error;
    }

    // Remove Driver from company:
    // Change role to Customer
    driver.role = Role.Customer;

    // Set Driver->Company to null
    driver.company = undefined;

    // Remove driver from company's drivers list
    company.drivers.remove(driverId);

    // Remove driver from all of their ACTIVE bookings
    const populatedDriver = await User.findById(driverId).populate('bookings');
    const bookings = populatedDriver.bookings;

    for(let i = 0; i < bookings.length; i++){
        // If the booking is active, remove:
        if(bookings[i].status !== Status.FINISHED && bookings[i].status !== Status.CANCELLED){
            // Remove driver from the booking
            let booking = await Booking.findById(bookings[i].id);
            booking.driver = undefined;
            await booking.save();

            // Remove the booking from the driver's list
            driver.bookings.remove(bookings[i].id);
        }
    }

    await company.save();
    await driver.save();
}

////////////////////////
// PRIVATE FUNCTIONS //
///////////////////////

/**
 * Generic util function to verify that company does exist and that
 * user is an admin of the company
 * @param userId
 * @param company
 * @param allowDriver - Boolean whether to auth drivers or not
 */
function authorizeRequest(userId, company, allowDriver){
    // If no company by that ID exists, throw 404
    if(!company){
        const error = new Error();
        error.name = "CompanyNotFoundError";
        throw error;
    }

    if(allowDriver){
        // Verify that the viewing user is a company admin OR a driver for that company
        if(!company.admins.some(admin => admin.equals(userId)) &&
            !company.drivers.some(drivers => drivers.equals(userId))){
            const error = new Error();
            error.name = "UnauthorizedViewError";
            throw error;
        }
    }else{
        // Verify that the viewing user is a company admin for that company
        if(!company.admins.some(admin => admin.equals(userId))){
            const error = new Error();
            error.name = "UnauthorizedViewError";
            throw error;
        }
    }
}