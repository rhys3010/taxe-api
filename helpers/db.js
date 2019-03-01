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

// If testing environment, run mongoDB in memory
if(process.env.NODE_ENV === 'test'){
  mockgoose.prepareStorage().then(function(){
    mongoose.connect(process.env.MONGO_URI || config.mongoURI, {useCreateIndex: true, useNewUrlParser: true});
    mongoose.Promise = global.Promise;
  });

}else{
  // Establish connection to mongoose
  mongoose.connect(process.env.MONGO_URI || config.mongoURI, {useCreateIndex: true, useNewUrlParser: true});
  mongoose.Promise = global.Promise;
}


module.exports = {
  User: require('../models/user')
};
