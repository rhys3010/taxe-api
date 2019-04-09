/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
 *  booking.js
 *
 *  Define the MongoDB Booking model using a mongoose schema
 *  @author Rhys Evans
 *  @version 0.2
 */

'use strict';

const mongoose = require('mongoose');

/**
 * Data schema for Booking
 */
const bookingSchema = mongoose.Schema({
    pickup_location: {type: String, required: true},
    destination: {type: String, required: true},
    time: {type: Date, required: true},
    no_passengers: {type: Number, required: true},
    notes: [{type: String}],
    status: {type: String, required: true, enum: ['Pending', 'In_Progress', 'Arrived', 'Cancelled', 'Finished'], default: 'Pending'},
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    driver: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'company'},
    created_at: {type: Date, default: Date.now}
});

bookingSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('booking', bookingSchema);