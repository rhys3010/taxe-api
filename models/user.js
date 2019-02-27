/**
  * user.js
  * Define the MongoDB User model using mongoose schema
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
  * Data schema for user
*/
const userSchema = mongoose.Schema({
  email: {type: String, unique: true, required: true},
  hashed_password: {type: String, required: true},
  name: {type: String, required: true},
  role: {type: String, enum: ['Customer', 'Driver', 'Company_Admin'], default: 'Customer'},
  created_at: {type: Date, default: Date.now}
});

userSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('user', userSchema);
