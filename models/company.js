/**
 * company.js
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
    operating: {type: Boolean, required: true, default: false},
    bookings: [{type: mongoose.Types.ObjectId, ref: 'booking'}],
    admins: [{type: mongoose.Types.ObjectId, ref: 'user'}],
    created_at: {type: Date, default: Date.now}
});

companySchema.set('toJSON', {virtuals: true});

module.exports = mongoose.Model('company', companySchema);