/**
  * routes.js
  * Bootstrap all app's routes
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const routes = require('express').Router();

// TEMP
routes.get('/', (req, res) => {
  res.status(200).json({message: 'Hello World!'});
});

module.exports = routes;
