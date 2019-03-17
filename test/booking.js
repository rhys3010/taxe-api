/**
 * booking.js
 * All booking related tests (/bookings/) route
 * @author Rhys Evans
 * @version 0.2
 */

'use strict';

const app = require("../app");
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const jwt = require('jsonwebtoken');
const User = require('../helpers/db').User;
const Booking = require('../helpers/db').Booking;
const URI_PREFIX = "/api/v1";
const config = require('../config');
const mongoose = require('mongoose');
const Status = require('../helpers/status');

chai.use(chaiHttp);

// Parent Testing Block
describe('Bookings', function(){

    // Generate ID for user
    let newUserId = mongoose.Types.ObjectId();
    // Sample user to create token
    let user = new User({email: "me@gmail.com", name: "Rhys Evans", password: "passwordpassword12354", role: "Customer", _id: newUserId});
    user.save();
    // Use sample user to generate token
    let newUser = User.find({email: "me@gmail.com"});
    let token = jwt.sign({sub: newUserId, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
    token = "Bearer " + token;

    // Before each test, empty out the Bookings database
    beforeEach((done) => {
        Booking.remove({}, (err) => {
        });

        User.remove({}, (err) => {
            done();
        });
    });


    /**
     * Test GET /bookings/:id route
     */
    describe('/GET bookings/:id', function(){

        // Get a booking without a valid token
        it('responds with 401 status and a missing token error', function(done){
            // ID to search
            const idToSearch = mongoose.Types.ObjectId();

            chai.request(app)
                .get(URI_PREFIX + "/bookings/" + idToSearch)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });
        });

        // Get a booking using an invalid object ID
        it('responds with 400 status and InvalidObjectId error', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/bookings/invalidIDsearch")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(8);
                    done();
                });
        });

        // Get a booking where there is none
        it('responds with 404 status and returns BookingNotFoundError', function(done){
            // Generate ID to search for
            let unknownId = mongoose.Types.ObjectId();

            chai.request(app)
                .get(URI_PREFIX + "/bookings/" + unknownId)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(10);
                    done();
                });
        });

        // Get a booking that doesn't belong to you
        it('responds with 403 and returns an error', function(done){
            // Generate ID for user that owns booking
            let userId = mongoose.Types.ObjectId();
            // Generate ID for sample booking
            let bookingId = mongoose.Types.ObjectId();

            let user = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [bookingId],
                _id: userId
            });

            user.save();

            // Create Booking
            let booking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: userId,
                _id: bookingId
            });

            booking.save();

            chai.request(app)
                .get(URI_PREFIX + "/bookings/" + bookingId)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Successfully view a booking
        it('responds with 200 status and returns info about booking', function(done){
            // Create a user and a booking in that user's name
            let userId = mongoose.Types.ObjectId();
            let bookingId = mongoose.Types.ObjectId();

            let user = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [bookingId],
                _id: userId
            });

            user.save();

            let booking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: userId,
                _id: bookingId
            });

            booking.save();

            // Generate token based on user
            let sampleToken = jwt.sign({sub: userId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            sampleToken = "Bearer " + sampleToken;

            chai.request(app)
                .get(URI_PREFIX + "/bookings/" + bookingId)
                .set('Authorization', sampleToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('pickup_location').eql("Fferm Penglais");
                    res.body.should.have.property('destination').eql("Borth");
                    res.body.should.have.property('no_passengers').eql(1);
                    res.body.should.have.property('customer');
                    done();
                });
        });
    });


    /**
     * Test POST /bookings route
     * (Create new Booking)
     */
    describe('/POST bookings', function(){

        // Attempt to create a booking without token
        it('responds with status 401 and returns error', function(done){
            // Generate random ID to use as customer
            let customerId = mongoose.Types.ObjectId();
            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: customerId
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });

        });

        // Attempt to create a booking with an already active booking in progress
        it('responds with status 403 and returns error', function(done){
            // Create a user with an active booking
            let customerId = mongoose.Types.ObjectId();
            let bookingId = mongoose.Types.ObjectId();

            let activeBooking = new Booking({
                pickup_location: "Uni Campus",
                destination: "Fferm Penglais Block 12",
                time: new Date().toISOString(),
                no_passengers: 1,
                customer: customerId,
                _id: bookingId
            });

            let sampleUser = new User({
                email: "johndoes@gmail.com",
                password: "johndoesnt123",
                role: "Customer",
                name: "John Doe",
                _id: customerId,
                bookings: [bookingId]
            });

            activeBooking.save();
            sampleUser.save();

            // Create the token
            let sampleToken = jwt.sign({sub: customerId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            sampleToken = "Bearer " + sampleToken;


            // Create a booking date for an hour in the future
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() + 1);

            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: bookingDate.toISOString(),
                no_passengers: 1
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', sampleToken)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(11);
                    done();
                });
        });

        // Attempt to create a booking with missing or duplicate fields
        it('responds with status 400 and returns a validation error', function(done){
            // Create a booking date for an hour in the future
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() + 1);

            // Create the new booking to use
            let newBooking = {
                pickup_location: "Fferm Penglais",
                time: bookingDate.toISOString(),
                no_passengers: 1
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', token)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt to create a booking in the past
        it('responds with status 400 and returns a validation error', function(done){
            // Create a booking date for an hour in the past
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() - 1);

            // Create a booking
            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: bookingDate.toISOString(),
                no_passengers: 1
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', token)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt to create a booking for within 10 minutes
        it('responds with status 400 and returns a validation error', function(done){
            // Create a booking
            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date().toISOString(),
                no_passengers: 1
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', token)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt to create a booking with 0 passengers
        it('responds with status 400 and returns a validation error', function(done) {
            // Create a booking date for an hour in the future
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() + 1);

            // Create a booking
            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: bookingDate.toISOString(),
                no_passengers: 0
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', token)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });

        });


        // Attempt a successful booking creation
        it('responds with status 201 and a new booking is created', function(done){
            // Create a booking date for an hour in the future
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() + 1);

            // Create sample customer
            let customerId = mongoose.Types.ObjectId();
            let sampleUser = new User({
                email: "johndoes@gmail.com",
                password: "johndoesnt123",
                role: "Customer",
                name: "John Doe",
                _id: customerId
            });

            sampleUser.save();

            // Create the token
            let sampleToken = jwt.sign({sub: customerId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            sampleToken = "Bearer " + sampleToken;

            // Create a booking
            let newBooking = {
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: bookingDate.toISOString(),
                no_passengers: 1
            };

            chai.request(app)
                .post(URI_PREFIX + "/bookings")
                .set('Authorization', sampleToken)
                .send(newBooking)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('message').eql("Booking Successfully Created");
                    res.body.should.have.property('booking_id');
                    done();
                });
        });

    });

    /**
     * Test PUT /bookings route
     * (Update Booking)
     */
    describe('/PUT bookings', function(){

        // Attempt to edit booking that doesn't belong to you
        it('responds with 403 error and returns an error', function(done){
            // Generate ID for user that owns booking
            let userId = mongoose.Types.ObjectId();
            // Generate ID for sample booking
            let bookingId = mongoose.Types.ObjectId();

            // Create Booking
            let booking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: userId,
                _id: bookingId
            });

            booking.save();

            // Booking changes
            let bookingEdit = {
                status: Status.CANCELLED
            };

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + bookingId)
                .set('Authorization', token)
                .send(bookingEdit)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(9);
                    done();
                });
        });

        // Attempt to edit a booking that doesn't exist
        it('responds with status 404 and returns BookingNotFoundError', function(done){

            let bookingEdits = {
                status: Status.CANCELLED
            };

            let bookingId = mongoose.Types.ObjectId();

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + bookingId)
                .set("Authorization", token)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(10);
                    done();
                });
        });


        // Attempt to edit a booking with empty HTTP body
        it('responds with status 400 and returns ValidationError', function(done){
            // Create a user and a booking in that user's name
            let validUserId = mongoose.Types.ObjectId();
            let validBookingId = mongoose.Types.ObjectId();

            let validUser = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [validBookingId],
                _id: validUserId
            });

            validUser.save();

            let validBooking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: validUserId,
                _id: validBookingId
            });

            validBooking.save();

            // Generate token based on user
            let validToken = jwt.sign({sub: validUserId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            let bookingEdits = {};

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + validBookingId)
                .set("Authorization", validToken)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt to edit booking with a driver that doesn't exist
        it('responds with status 404 and returns UserNotFoundError', function(done){
            // Create a user and a booking in that user's name
            let validUserId = mongoose.Types.ObjectId();
            let validBookingId = mongoose.Types.ObjectId();

            let validUser = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [validBookingId],
                _id: validUserId
            });

            validUser.save();

            let validBooking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: validUserId,
                _id: validBookingId
            });

            validBooking.save();

            // Generate token based on user
            let validToken = jwt.sign({sub: validUserId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            let bookingEdits = {
                driver: mongoose.Types.ObjectId()
            };

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + validBookingId)
                .set("Authorization", validToken)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });

        // Attempt to edit booking with a driver that is actually a customer
        it('responds with 403 status and returns InvalidRoleError', function(done){
            // Create a user and a booking in that user's name
            let validUserId = mongoose.Types.ObjectId();
            let validBookingId = mongoose.Types.ObjectId();
            let invalidDriverId = mongoose.Types.ObjectId();

            let validUser = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [validBookingId],
                _id: validUserId
            });

            validUser.save();

            let invalidDriver = new User({
                email: "johndoe@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "John Doe",
                _id: invalidDriverId
            });

            invalidDriver.save();

            let validBooking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: validUserId,
                _id: validBookingId
            });

            validBooking.save();

            // Generate token based on user
            let validToken = jwt.sign({sub: validUserId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            let bookingEdits = {
                driver: invalidDriverId
            };

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + validBookingId)
                .set("Authorization", validToken)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(13);
                    done();
                });
        });

        // Attempt to edit booking with invalid time
        it('responds with 400 status and returns ValidationError', function(done){
            // Create a user and a booking in that user's name
            let validUserId = mongoose.Types.ObjectId();
            let validBookingId = mongoose.Types.ObjectId();

            let validUser = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [validBookingId],
                _id: validUserId
            });

            validUser.save();

            let validBooking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: validUserId,
                _id: validBookingId
            });

            validBooking.save();

            // Generate token based on user
            let validToken = jwt.sign({sub: validUserId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            let bookingEdits = {
                time: new Date().toISOString()
            };

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + validBookingId)
                .set("Authorization", validToken)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt successful edit
        it('responds with 200 status and returns success message', function(done){
            // Create a user and a booking in that user's name
            let validUserId = mongoose.Types.ObjectId();
            let validBookingId = mongoose.Types.ObjectId();
            let validDriverId = mongoose.Types.ObjectId();

            let validUser = new User({
                email: "rhys301097@gmail.com",
                password: "qwerty123",
                role: "Customer",
                name: "Rhys Evans",
                bookings: [validBookingId],
                _id: validUserId
            });

            validUser.save();

            let validDriver = new User({
                email: "johndoe@gmail.com",
                password: "qwerty123",
                role: "Driver",
                name: "John Doe",
                _id: validDriverId
            });

            validDriver.save();

            let validBooking = new Booking({
                pickup_location: "Fferm Penglais",
                destination: "Borth",
                time: new Date(),
                no_passengers: 1,
                customer: validUserId,
                _id: validBookingId
            });

            validBooking.save();

            // Generate token based on user
            let validToken = jwt.sign({sub: validUserId, role: 'Customer'}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            // Get a valid time
            let bookingDate = new Date();
            bookingDate.setHours(bookingDate.getHours() + 1);

            let bookingEdits = {
                status: Status.IN_PROGRESS,
                time: bookingDate,
                driver: validDriverId
            };

            chai.request(app)
                .put(URI_PREFIX + "/bookings/" + validBookingId)
                .set("Authorization", validToken)
                .send(bookingEdits)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('message').eql("Booking Successfully Edited");
                    done();
                });
        });

    });
});