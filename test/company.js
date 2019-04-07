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
     * Test GET /users/:id route
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
     * Test GET /users/:id/bookings route
     */
    describe('/GET users/:id/bookings', function(){

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
});