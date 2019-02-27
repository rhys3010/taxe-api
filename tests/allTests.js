/**
  * allTests.js
  * Run all API unit tests in mocha environment
  * @author Rhys Evans
  * @version 0.1
*/

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

chai.use(chaiHttp);

// Naive test for default route
describe('/GET default', () => {
  it('It should return HTTP status 200', (done) => {
      chai.request(app)
        .get('/api/v1')
        .end((err, res) => {
          res.should.have.status(200);
        done();
    });
  });
});

// Failing Test
describe('/GET users', () => {
  it('It shouldnt return HTTP status 200', (done) => {
    chai.request(app)
      .get('/api/v1/users')
      .end((err, res) => {
        res.should.have.status(200);
      done();
    });
  });
});
