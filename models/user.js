/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
  * user.js
  * Define the MongoDB User model using mongoose schema
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const mongoose = require('mongoose');

/**
  * Data schema for user
*/
const userSchema = mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, enum: ['Customer', 'Driver', 'Company_Admin'], default: 'Customer'},
    bookings: [{type: mongoose.Schema.Types.ObjectId, ref: 'booking'}],
    available: {type: Boolean, default: false, required: true},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'company'},
    created_at: {type: Date, default: Date.now}
});

userSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('user', userSchema);
