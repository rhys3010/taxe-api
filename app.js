/**
  * app.js
  * Main Express API declarations
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middlewares/error-handler');
const morgan = require('morgan');

// Parse x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Allow Cross Origin Request Sharing in API
app.use(cors());

// Log Requests to console using morgan (if not testing)
if(process.env.NODE_ENV !== 'test'){
    app.use(morgan('dev'));
}


// Use routes.js file to declare app's routes
app.use('/api/v1', routes);

// Enable Error Handler Middleware
app.use(errorHandler);

module.exports = app;
