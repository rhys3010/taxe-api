/**
  * db.js
  * MongoDB Wrapper, used to configure mongoose etc.
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const config = require('../config.json');
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

// If testing environment, run mongoDB in memory using mockgoose
if(process.env.NODE_ENV === 'test'){
  mockgoose.prepareStorage().then(function(){
    mongoose.connect(process.env.MONGO_URI || config.mongoURI, {useCreateIndex: true, useNewUrlParser: true});
    mongoose.Promise = global.Promise;
  });
  // If dev environment, connect to MongoDB without auth credentials
}else if (process.env.NODE_ENV === 'dev'){
  // Establish connection to mongoose
  mongoose.connect(process.env.MONGO_URI || config.mongoURI, {useCreateIndex: true, useNewUrlParser: true});
  mongoose.Promise = global.Promise;
  // If prod environment, connect to MongoDB with auth credentials
}else if(process.env.NODE_ENV === 'prod'){
  mongoose.connect(process.env.MONGO_URI || config.mongoURI, {
    "user": process.env.MONGO_USER || config.mongoUser,
    "pass": process.env.MONGO_PASSWORD || config.mongoPassword,
    "useMongoClient": true
  });
  mongoose.Promise = global.Promise;
  // If NODE_ENV isn't set, report error
} else{
  console.log("NODE_ENV must be set to either dev, prod or test for MongoDB connection to work");
}

module.exports = {
  User: require('../models/user'),
  Booking: require('../models/booking'),
  Company: require('../models/company')
};
