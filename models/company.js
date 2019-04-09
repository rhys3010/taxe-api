/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
 * companies.js
 *
 * Define MongoDB company model
 *
 * @author Rhys Evans
 * @version 0.1
 */

'use strict';

const mongoose = require('mongoose');


/**
 * Company Data Schema
 */
const companySchema = mongoose.Schema({
    name: {type: String, unique: true, required: true},
    bookings: [{type: mongoose.Schema.Types.ObjectId, ref: 'booking'}],
    drivers: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    created_at: {type: Date, default: Date.now}
});

companySchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('company', companySchema);