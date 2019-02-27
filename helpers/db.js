/**
  * db.js
  * MongoDB Wrapper, used to configure mongoose etc.
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const config = require('../config.json');
const mongoose = require('mongoose');

// Establish connection to mongoose
mongoose.connect(process.env.MONGO_URI || config.mongoURI, {useCreateIndex: true, useNewUrlParser: true});
mongoose.Promise = global.Promise;

module.exports = {
  User: require('../models/user')
};
