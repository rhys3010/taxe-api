/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
 * company.js
 *
 * All company related tests
 *
 * @author Rhys Evans
 * @version 0.1
 */

'use strict';

const app = require("../app");
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const User = require('../helpers/db').User;
const Booking = require('../helpers/db').Booking;
const Company = require('../helpers/db').Company;
const URI_PREFIX = "/api/v1";
const jwt = require('jsonwebtoken');
const config = require('../config');
const auth = require('basic-auth');
const mongoose = require('mongoose');

chai.use(chaiHttp);

// Parent Testing Block
describe('Company', function(){

    // Generate a sample user to create token for
    let user = new User({email: "me@gmail.com", name: "Rhys Evans", password: "password123", role: "Company_Admin", _id: mongoose.Types.ObjectId()});
    user.save();
    // Use sample user to generate token
    let newUser = User.find({email: "me@gmail.com"});
    let token = jwt.sign({sub: newUser.id, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
    token = "Bearer " + token;

    // Before each test empty out the Users database
    beforeEach((done) => {

        Company.remove({}, (err) => {
        });

        Booking.remove({}, (err) => {
        });

        User.remove({}, (err) => {
            done();
        });
    });

    /**
     * Test GET /companies/:id route
     */
    describe('/GET companies/:id', function(){

        // Attempt to view company profile without token
        it('responds with 401 status and a missing token error', function(done){
           // The sample company to view
            let company = new Company({
                name: "A Taxi Co",
                bookings: [],
                admins: [],
                drivers: []
            });
            company.save();

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + mongoose.Types.ObjectId())
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });
        });

        // Attempt to view company profile where ID is valid but doesn't exist
        it('responds with 404 status and returns CompanyNotFound error', function(done){

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + mongoose.Types.ObjectId())
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(15);
                    done();
                });
        });

        // Attempt to view company profile without being an admin
        it('responds with 403 status and returns UnauthorizedViewError', function(done){
            // Create the sample company
            let companyId = mongoose.Types.ObjectId();
            let company = new Company({
                _id: companyId,
                name: "A Taxi Co",
                bookings: [],
                admins: [],
                drivers: []
            });
            company.save();

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Successfully view company profile
        it('responds with 200 status and returns json object for company profile', function(done){
            // Create a user and make them an admin of the company
            let userId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let user = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Company_Admin",
                name: "Rhys Evans",
                bookings: [],
                _id: userId
            });

            user.save();

            let company = new Company({
                name: "Generic Taxi Co",
                bookings: [],
                drivers: [],
                admins: [userId],
                _id: companyId
            });

            company.save();

            // Generate token based on user
            let sampleToken = jwt.sign({sub: userId, role: 'Company_Admin'}, config.jwtSecret, {expiresIn: 600});
            sampleToken = "Bearer " + sampleToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId)
                .set('Authorization', sampleToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('name').eql("Generic Taxi Co");
                    res.body.should.have.property('admins');
                    res.body.should.have.property('bookings');
                    res.body.should.have.property('drivers');
                    done();
                });
        });
    });

    /**
     * Test GET /companies/:id/bookings route
     */
    describe('/GET companies/:id/bookings', function(){

        // Attempt to get a list of bookings for a company that doesn't exist
        it('responds with 404 error and returns CompanyNotFound', function(done){

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + mongoose.Types.ObjectId() + "/bookings")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(15);
                    done();
                });
        });

        // Attempt to get a list of bookings for a company that doesn't have any
        it('responds with 404 error and returns BookingNotFound error', function(done){
            // Create company without any bookings
            let userId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let user = new User({
                name: "Rhys Evans",
                email: "rhys301097@gmail.com",
                password: "apassword123",
                role: "Company_Admin",
                company: companyId,
                bookings: [],
                _id: userId
            });

            user.save();

            let company = new Company({
                name: "Generic Taxi Co",
                drivers: [],
                admins: [userId],
                bookings: [],
                _id: companyId
            });

            company.save();

            // Generate token based on user
            let sampleToken = jwt.sign({sub: userId, role: 'Company_Admin'}, config.jwtSecret, {expiresIn: 600});
            sampleToken = "Bearer " + sampleToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/bookings")
                .set('Authorization', sampleToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(10);
                    done();
                });
        });

        // Attempt to view company bookings without being an admin
        it('responds with 403 status and returns UnauthorizedViewError', function(done){
            // Create the sample company
            let companyId = mongoose.Types.ObjectId();
            let bookingId = mongoose.Types.ObjectId();

            let booking = new Booking({
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: mongoose.Types.ObjectId(),
                company: companyId,
                no_passengers: 1,
                _id: bookingId
            });

            booking.save();

            let company = new Company({
                _id: companyId,
                name: "A Taxi Co",
                bookings: [bookingId],
                admins: [],
                drivers: []
            });
            company.save();

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/bookings")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Successfully get a list of a company's bookings
        it('responds with 200 status and returns a list of bookings', function(done){
            let userId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();
            let booking1Id = mongoose.Types.ObjectId();
            let booking2Id = mongoose.Types.ObjectId();

            // Create User
            let user = new User({
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Company_Admin",
                company: companyId,
                bookings: [],
                _id: userId
            });

            user.save();

            // Create Company
            let company = new Company({
                name: "Generic Taxi Co",
                bookings: [booking1Id, booking2Id],
                admins: [userId],
                drivers: [],
                _id: companyId,
            });

            company.save();

            // Create 2 bookings
            let newBooking = {
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: mongoose.Types.ObjectId(),
                no_passengers: 1,
                _id: booking1Id
            };

            let newBooking2 = {
                pickup_location: "Gaz",
                destination: "Baz",
                time: new Date(),
                customer: mongoose.Types.ObjectId(),
                no_passengers: 1,
                _id: booking2Id
            };

            let booking = new Booking(newBooking);
            booking.save();

            let booking2 = new Booking(newBooking2);
            booking2.save();

            // Create a valid token to use to access bookings
            let validToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/bookings")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(2);
                    done();
                });
        });

        // Successfully get a list of a company's *active* bookings
        it('responds with status 200 and returns a list with only the active bookings', function(done){
            let userId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();
            let activeBookingId = mongoose.Types.ObjectId();
            let inactiveBookingId = mongoose.Types.ObjectId();

            // Create User
            let user = new User({
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Company_Admin",
                company: companyId,
                bookings: [],
                _id: userId
            });

            user.save();

            // Create Company
            let company = new Company({
                name: "Generic Taxi Co",
                bookings: [activeBookingId, inactiveBookingId],
                admins: [userId],
                drivers: [],
                _id: companyId,
            });

            company.save();

            // Create 2 bookings
            let activeBooking = new Booking({
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: mongoose.Types.ObjectId(),
                status: "In_Progress",
                no_passengers: 1,
                _id: activeBookingId
            });

            activeBooking.save();

            let inactiveBooking = new Booking({
                pickup_location: "Gaz",
                destination: "Baz",
                time: new Date(),
                status: "Cancelled",
                customer: mongoose.Types.ObjectId(),
                no_passengers: 1,
                _id: inactiveBookingId
            });

            inactiveBooking.save();

            // Create a valid token to use to access bookings
            let validToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/bookings?active=true")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(1);
                    done();
                });
        });
    });

    /**
     * Test GET /companies/:id/drivers route
     */
    describe('/GET companies/:id/drivers', function(){

        // Attempt to get a list of company's drivers where the company doesn't exist
        it('responds with 404 status and returns CompanyNotFoundError', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/companies/" + mongoose.Types.ObjectId() + "/drivers")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(15);
                    done();
                });
        });

        // Attempt to get a list of company's drivers without being authorized
        it('responds with 403 status and returns UnauthorizedViewError', function(done){

            let companyId = mongoose.Types.ObjectId();
            let company = new Company({
                name: "Generic Taxi Co",
                admins: [],
                bookings: [],
                drivers: [],
                _id: companyId
            });

            company.save();

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Attempt to get a list of company's drivers where there are none
        it('responds with 404 status and returns NoUsersFoundError', function(done){

            let companyId = mongoose.Types.ObjectId();
            let userId = mongoose.Types.ObjectId();

            let company = new Company({
                name: "Generic Taxi Co",
                admins: [userId],
                bookings: [],
                drivers: [],
                _id: companyId
            });

            company.save();

            let user = new User({
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "qwerty123456",
                role: "Company_Admin",
                company: companyId,
                _id: userId
            });

            user.save();

            // Generate Token
            let validToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });

        // Successfully retrieve a list of company's drivers
        it('responds with 200 status and returns a populated list of drivers', function(done){
            let companyId = mongoose.Types.ObjectId();
            let driverId = mongoose.Types.ObjectId();
            let secondDriverId = mongoose.Types.ObjectId();

            let company = new Company({
                name: "Generic Taxi Co",
                bookings: [],
                admins: [],
                drivers: [driverId, secondDriverId],
                _id: companyId
            });

            company.save();

            let driver = new User({
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "qwerty123456",
                role: "Driver",
                company: companyId,
                _id: driverId
            });

            driver.save();

            let secondaryDriver = new User({
                email: "janedoe@gmail.com",
                name: "Jane Doe",
                password: "qwerty1243",
                role: "Driver",
                company: companyId,
                _id: secondDriverId
            });

            secondaryDriver.save();

            // Generate Token
            let validToken = jwt.sign({sub: driverId, role: driver.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(2);
                    done();
                });
        });
    });

    /**
     * Test GET /companies/:id/admins route
     */
    describe('/GET companies/:id/admins', function(){

        // Attempt to get a list of company's admins where the company doesn't exist
        it('responds with 404 status and returns CompanyNotFoundError', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/companies/" + mongoose.Types.ObjectId() + "/admins")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(15);
                    done();
                });
        });

        // Attempt to get a list of company's admins without being authorized
        it('responds with 403 status and returns UnauthorizedViewError', function(done){

            let companyId = mongoose.Types.ObjectId();
            let company = new Company({
                name: "Generic Taxi Co",
                admins: [],
                bookings: [],
                drivers: [],
                _id: companyId
            });

            company.save();

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/admins")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Successfully retrieve a list of company's admins
        it('responds with 200 status and returns a populated list of admins', function(done){
            let companyId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let secondAdminId = mongoose.Types.ObjectId();

            let company = new Company({
                name: "Generic Taxi Co",
                bookings: [],
                drivers: [],
                admins: [adminId, secondAdminId],
                _id: companyId
            });

            company.save();

            let admin = new User({
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "qwerty123456",
                role: "Company_Admin",
                company: companyId,
                _id: adminId
            });

            admin.save();

            let secondAdmin = new User({
                email: "janedoe@gmail.com",
                name: "Jane Doe",
                password: "qwerty1243",
                role: "Company_Admin",
                company: companyId,
                _id: secondAdminId
            });

            secondAdmin.save();

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/companies/" + companyId + "/admins")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(2);
                    done();
                });
        });
    });

    /**
     * Test PATCH /companies/:id/drivers route
     */
    describe('/PATCH companies/:id/drivers', function(){

        // Attempt to add driver to company without being authorized
        it('responds with 403 status and returns UnauthorizedViewError', function(done){
            let userId = mongoose.Types.ObjectId();
            let user = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                role: "Customer",
                _id: userId
            });

            user.save();

            let companyId = mongoose.Types.ObjectId();
            let company = new Company({
                name: "Generic Taxi Co",
                admins: [],
                bookings: [],
                drivers: [],
                _id: companyId
            });

            company.save();

            let reqBody = {
                driver: user.email
            };

            // Generate Token
            let invalidToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            invalidToken = "Bearer " + invalidToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .send(reqBody)
                .set('Authorization', invalidToken)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Attempt to add driver to company when they're already a member
        it('responds with 403 status and returns DriverAlreadyAddedError', function(done){
            let driverId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: companyId,
                role: "Driver",
                _id: driverId
            });

            driver.save();

            let admin =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Company_Admin",
                _id: adminId,
            });

            admin.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [adminId],
                drivers: [driverId],
                bookings: [],
                _id: companyId

            });

            company.save();

            let reqBody = {
                driver: driver.email
            };

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', validToken)
                .send(reqBody)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(16);
                    done();
                });
        });

        // Attempt to add driver to company when they're already a member of another company
        it('responds with 403 status and returns DriverAlreadyAddedError', function(done){
            let driverId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: mongoose.Types.ObjectId(),
                role: "Driver",
                _id: driverId
            });

            driver.save();

            let admin =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Company_Admin",
                _id: adminId,
            });

            admin.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [adminId],
                drivers: [],
                bookings: [],
                _id: companyId

            });

            company.save();

            let reqBody = {
                driver: driver.email
            };

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', validToken)
                .send(reqBody)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(16);
                    done();
                });
        });

        // Successfully add Driver to company
        it('responds with 200 status and returns Success Message', function(done){
            let driverId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: null,
                role: "Customer",
                _id: driverId
            });

            driver.save();

            let admin =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Company_Admin",
                _id: adminId,
            });

            admin.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [adminId],
                drivers: [],
                bookings: [],
                _id: companyId

            });

            company.save();

            let reqBody = {
                driver: driver.email
            };

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers")
                .set('Authorization', validToken)
                .send(reqBody)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property("message").eql("Driver Successfully Added");
                    done();
                });
        });

    });

    /**
     * Test PATCH /companies/:id/drivers/:id route
     */
    describe('/PATCH companies/:id/drivers/:id', function(){

        // Attempt to remove driver from company without being authorized
        it('responds with 403 status and returns UnauthorizedViewError', function(done){
            let userId = mongoose.Types.ObjectId();
            let user = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                role: "Customer",
                _id: userId
            });

            user.save();

            let companyId = mongoose.Types.ObjectId();
            let company = new Company({
                name: "Generic Taxi Co",
                admins: [],
                bookings: [],
                drivers: [],
                _id: companyId
            });

            company.save();

            // Generate Token
            let invalidToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            invalidToken = "Bearer " + invalidToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers/" + mongoose.Types.ObjectId())
                .set('Authorization', invalidToken)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Attempt to remove driver from company when they're not a member
        it('responds with 404 status and returns NoUsersFoundError', function(done){
            let driverId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: null,
                role: "Customer",
                _id: driverId
            });

            driver.save();

            let admin =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Company_Admin",
                _id: adminId,
            });

            admin.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [adminId],
                drivers: [],
                bookings: [],
                _id: companyId

            });

            company.save();

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers/" + driverId)
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });

        // Attempt to remove a driver from company as a driver within the company
        it('responds with 403 status and returns UnauthorizedEditError', function(done){
            let driverId = mongoose.Types.ObjectId();
            let userId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: null,
                role: "Customer",
                _id: driverId
            });

            driver.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [],
                drivers: [userId],
                bookings: [],
                _id: companyId
            });

            company.save();

            let user =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Driver",
                _id: userId,
            });

            user.save();

            // Generate Token
            let validToken = jwt.sign({sub: userId, role: user.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers/" + driverId)
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(9);
                    done();
                });
        });

        // Successfully remove a driver from the company as Company Admin
        it('it responds with 200 status and returns success message', function(done){
            let driverId = mongoose.Types.ObjectId();
            let adminId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: companyId,
                role: "Driver",
                _id: driverId
            });

            driver.save();

            let admin =  new User({
                name: "Jane Bloggs",
                email: "janebloggs@gmail.com",
                password: "test1234",
                companyId: companyId,
                role: "Company_Admin",
                _id: adminId,
            });

            admin.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [adminId],
                drivers: [driverId],
                bookings: [],
                _id: companyId

            });

            company.save();

            // Generate Token
            let validToken = jwt.sign({sub: adminId, role: admin.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers/" + driverId)
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("message").eql("Driver Successfully Removed");
                    done();
                });

        });

        // Successfully remove a driver from the company as the driver himself
        it('responds with status 200 and returns a success message', function(done){
            let driverId = mongoose.Types.ObjectId();
            let companyId = mongoose.Types.ObjectId();

            let driver = new User({
                name: "Joe Bloggs",
                email: "joebloggs@gmail.com",
                password: "test1234",
                company: companyId,
                role: "Driver",
                _id: driverId
            });

            driver.save();

            let company = new Company({
                name: "Taxi Co",
                admins: [],
                drivers: [driverId],
                bookings: [],
                _id: companyId
            });

            company.save();

            // Generate Token
            let validToken = jwt.sign({sub: driverId, role: driver.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .patch(URI_PREFIX + "/companies/" + companyId + "/drivers/" + driverId)
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("message").eql("Driver Successfully Removed");
                    done();
                });

        });

    });
});
