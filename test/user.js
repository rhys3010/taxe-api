/**
 * user.js
 * All user related test (specifically the /users/) route
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
const URI_PREFIX = "/api/v1";
const jwt = require('jsonwebtoken');
const config = require('../config');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

chai.use(chaiHttp);

// Parent testing block
describe('Users', function(){

    // The sample user to create token
    let user = new User({email: "me@gmail.com", name: "Rhys Evans", password: "passwordpassword12354", role: "Customer", _id: mongoose.Types.ObjectId});
    user.save();
    // Use sample user to generate token
    let newUser = User.find({email: "me@gmail.com"});
    let token = jwt.sign({sub: newUser.id, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
    token = "Bearer " + token;

    // Before each test empty out the Users database
    beforeEach((done) => {
        User.remove({}, (err) => {
            done();
        });
    });

    /**
     * Test GET /users route
     */
    describe('/GET users', function(){

        // Get Users using a missing token
        it('responds with status 401', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/users")
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });
        });

        // Get users with an invalid token
        it('responds with status 403', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/users")
                // Skew token slightly
                .set('Authorization', token + "akhfgaokg")
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(1);
                    done();
                });
        });

        // Get users where there are none
        it('responds with status 404', function(done){
           chai.request(app)
               .get(URI_PREFIX + "/users")
               .set('Authorization', token)
               .end((err, res) => {
                  res.should.have.status(404);
                  res.body.should.have.property('code').eql(4);
                   done();
               });
        });


        // Get users where there are some
        it('responds with status 200 and is of length 1 (1 user)', function(done){
            // Create a user and add to DB
            let user = new User({email: "joebloggs@gmail.com", name: "Joe Bloggs", password: "qwerty123456"});
            user.save();
            chai.request(app)
                .get(URI_PREFIX + "/users")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    done();
                });
        });

    });

    /**
     * Test POST /users route
     * (Register)
     */
    describe('/POST users', function(){

        // Attempt to register with email that already exists
        it('responds with status 400 and returns error', function(done){
            // Create A user
            let user = new User({email: "joebloggs@gmail.com", name: "Joe Bloggs", password: "password1234"});
            user.save();

            // Create another user with the same email
            let newUser = {
                email: "joebloggs@gmail.com",
                name: "Joseph Bloggs",
                password: "uniquepassword422"
            };

            chai.request(app)
                .post(URI_PREFIX + "/users")
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(5);
                    done();
                });
        });

        // Attempt to register with invalid email
        it('responds with status 400 and returns validation error', function(done){
           let newUser = {
               email: "invalidemail.com",
               name: "Mr Invalid",
               password: "testing123455"
           };

           chai.request(app)
               .post(URI_PREFIX + "/users")
               .send(newUser)
               .end((err, res) => {
                   res.should.have.status(400);
                   res.body.should.have.property('code').eql(7);
                   done();
               });
        });

        // Attempt to register with invalid password
        it('responds with status 400 and returns validation error', function(done){
           let newUser = {
               email: "cwl@aber.ac.uk",
               name: "Chris Loftus",
               password: "badpass"
           };

           chai.request(app)
               .post(URI_PREFIX + "/users")
               .send(newUser)
               .end((err, res) => {
                   res.should.have.status(400);
                   res.body.should.have.property('code').eql(7);
                   done();
               });
        });

        // Attempt to register with invalid name
        it('responds with status 400 and returns validation error', function(done){
            let newUser = {
                email: "sap59@aber.ac.uk",
                name: "Sara Parry!!",
                password: "password123456798"
            };

            chai.request(app)
                .post(URI_PREFIX + "/users")
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });


        // Attempt to register with missing required field
        it('responds with status 400 and returns validation error', function(done){
            let newUser = {
                name: "Miss Inga Field",
                password: "passwording123"
            };

            chai.request(app)
                .post(URI_PREFIX + "/users")
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt a successful registration
        it('responds with status 201 and user is created', function(done){
           // Create user object
            let newUser = {
                email: "rhe24@aber.ac.uk",
                name: "Rhys Evans",
                password: "gotcha1234"
            };

            chai.request(app)
                .post(URI_PREFIX + "/users")
                .send(newUser)
                .end((err, res) => {
                   res.should.have.status(201);
                   res.body.should.have.property("message").eql("Successfully Registered");
                   done();
                });
        });

    });

    /**
     * Test GET /users/:id route
     */
    describe('/GET users/:id', function(){

        // Attempt to view user profile without token
        it('responds with 401 status and missing token error', function(done){
            // The sample user to view profile
            let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "ajmigofayhc9uhabwiugb12"});
            user.save();
            // ID to use to search for user
            const idToSearch = mongoose.Types.ObjectId();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + idToSearch)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });
        });

        // Atttempt to get user info using an invalid object ID
        it('responds with 400 status and InvalidObjectId error', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/users/invalidIDsearch")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(8);
                    done();
                });
        });

        // Attempt to get user info where the ID is valid but user doesn't exist
        it('responds with 404 status and returns usernotfound error', function(done){
            // Generate ID for new user
            let userId = mongoose.Types.ObjectId();
            // The sample user to view profile
            let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "ajmigofayhc9uhabwiugb12", _id: userId});
            user.save();
            // Generate a (valid) random ID to use to search with
            let unknownId = mongoose.Types.ObjectId();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + unknownId)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });


        // Successfully view user info
        it('responds with 200 status and returns info about user, omitting password', function(done){
            // Generate ID for new user
            let userId = mongoose.Types.ObjectId();
            // The sample user to view profile
            let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "ajmigofayhc9uhabwiugb12", _id: userId});
            user.save();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + userId)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('email').eql("johndoe@gmail.com");
                    res.body.should.have.property('role').eql("Customer");
                    res.body.should.not.have.property('password');
                    done();
                });
        });

    });

    /**
     * Test POST /users/login route
     * (Login)
     */
    describe('/POST users/login', function(){

        // Create user information and hash password
        let newUser = {
            email: "me@rhysevans.xyz",
            name: "Rhys Evans",
            password: "asdf12345",
        };
        // Hash the password before saving
        newUser.password = bcrypt.hashSync(newUser.password, 10);


        // Attempt to log in with an empty field
        it('responds with 403 and returns Authentication Error', function(done){

            // Save new user to database
            let user = new User(newUser);
            user.save();

            // Login info with missing password
            let loginInfo = {
                email: "test@gmail.com"
            };

            chai.request(app)
                .post(URI_PREFIX + "/users/login")
                .set("Authorization", toAuth(loginInfo.email, loginInfo.password))
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(6);
                    done();
                });
        });

        // Attempt to log in with invalid credentials
        it('responds with 403 and returns Authentication Error', function(done){

            let user = new User(newUser);
            // Save to DB
            user.save();

            let loginInfo = {
                email: "me@rhysevans.xyz",
                password: "wrongpassword1223"
            };

            // Attempt to log in with incorrect credentials
            chai.request(app)
                .post(URI_PREFIX + "/users/login")
                .set("Authorization", toAuth(loginInfo.email, loginInfo.password))
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(6);
                    done();
                });
        });

        // Successfully log in
        it('responds with 200 and returns user info and token', function(done){

            let user = new User(newUser);
            // Save to DB
            user.save();

            let loginInfo = {
                email: "me@rhysevans.xyz",
                password: "asdf12345"
            };

            // Attempt login
            chai.request(app)
                .post(URI_PREFIX + "/users/login")
                .set("Authorization", toAuth(loginInfo.email, loginInfo.password))
                .end((err, res) => {
                   res.should.have.status(200);
                   res.body.should.have.property('token');
                   done();
                });
        });
    });

    /**
     * Test GET /users/:id/bookings route
     * (Get all user's bookings)
     */
    describe('/GET users/:id/bookings', function(){

        // Attempt to get a list of bookings from an account that doesn't exist
        it('responds with 404 error and returns NoUsersFoundError', function(done){

            let userId = mongoose.Types.ObjectId();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + userId + "/bookings")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });

        });


        // Attempt to get a list of bookings from an account that doesn't have any
        it('responds with 404 error and returns BookingNotFoundError', function(done){
            // Create a user with no bookings
            let newUserId = mongoose.Types.ObjectId();
            let newUser = {
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Customer",
                _id: newUserId
            };

            let user = new User(newUser);
            user.save();

            // Create token that matches the user's ID
            let validToken = jwt.sign({sub: newUser._id, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/users/" + newUserId + "/bookings")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(10);
                    done();
                });

        });

        // Attempt to get a list of bookings from an account that doesn't belong to you
        it('responds with 403 error and returns UnauthorizedViewError', function(done){
            // Create an account
            let newUserId = mongoose.Types.ObjectId();
            let newBookingId = mongoose.Types.ObjectId();

            // Create a new booking to place in account
            let newBooking = {
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: newUserId,
                no_passengers: 1,
                _id: newBookingId
            };

            let booking = new Booking(newBooking);
            booking.save();

            let newUser = {
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Customer",
                bookings: [newBookingId],
                _id: newUserId
            };

            let user = new User(newUser);
            user.save();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + newUserId + "/bookings")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(12);
                    done();
                });
        });

        // Attempt to get a list of bookings successfully
        it('responds with 200 status and returns a list of bookings', function(done){
            // Create an account
            let newUserId = mongoose.Types.ObjectId();
            let newBookingId = mongoose.Types.ObjectId();
            let newBooking2Id = mongoose.Types.ObjectId();

            // Create 2 bookings
            let newBooking = {
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: newUserId,
                no_passengers: 1,
                _id: newBookingId
            };

            let newBooking2 = {
                pickup_location: "Gaz",
                destination: "Baz",
                time: new Date(),
                customer: newUserId,
                no_passengers: 1,
                _id: newBooking2Id
            };

            let booking = new Booking(newBooking);
            booking.save();

            let booking2 = new Booking(newBooking2);
            booking2.save();

            let newUser = {
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Customer",
                bookings: [newBookingId, newBooking2Id],
                _id: newUserId
            };

            let user = new User(newUser);
            user.save();

            // Create a valid token to use to access bookings
            let validToken = jwt.sign({sub: newUser._id, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/users/" + newUserId + "/bookings")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(2);
                    done();
                });

        });

        // Attempt to get a list of booking and successfully limit the list
        it('responds with status 200 and returns a list with only a single booking', function(done){
            // Create an account
            let newUserId = mongoose.Types.ObjectId();
            let newBookingId = mongoose.Types.ObjectId();
            let newBooking2Id = mongoose.Types.ObjectId();

            // Create 2 bookings
            let newBooking = {
                pickup_location: "Foo",
                destination: "Bar",
                time: new Date(),
                customer: newUserId,
                no_passengers: 1,
                _id: newBookingId
            };

            let newBooking2 = {
                pickup_location: "Gaz",
                destination: "Baz",
                time: new Date(),
                customer: newUserId,
                no_passengers: 1,
                _id: newBooking2Id
            };

            let booking = new Booking(newBooking);
            booking.save();

            let booking2 = new Booking(newBooking2);
            booking2.save();

            let newUser = {
                email: "johndoe@gmail.com",
                name: "John Doe",
                password: "examplepassword12345",
                role: "Customer",
                bookings: [newBookingId, newBooking2Id],
                _id: newUserId
            };

            let user = new User(newUser);
            user.save();

            // Create a valid token to use to access bookings
            let validToken = jwt.sign({sub: newUser._id, role: newUser.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .get(URI_PREFIX + "/users/" + newUserId + "/bookings?limit=1")
                .set('Authorization', validToken)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.length(1);
                    done();
                });
        });
    });

    /**
     * Test PUT /users/:id route
     * (Edit User)
     */
    describe('/PUT users/:id', function(){

        // Create mongoose ID to apply to user
        let templateUserId = mongoose.Types.ObjectId();
        // Template to create new user
        let userTemplate = {
            email: "johndoe@gmail.com",
            name: "John Doe",
            password: "examplepassword12345",
            role: "Customer",
            _id: templateUserId
        };

        // Attempt to edit account without a token
        it('responds with 401 status and returns MissingTokenError', function(done){
            // Template for user account edits
            let userEdits = {
                name: "Jane Doe",
                password: "newpassword12345"
            };

            let user = new User(userTemplate);
            user.save();

            // Create token that matches the user's ID
            let validToken = jwt.sign({sub: userTemplate._id, role: userTemplate.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .put(URI_PREFIX + "/users/" + userTemplate._id)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });

        });

        // Attempt to edit account that doesn't exist
        it('responds with 404 status and user not found error is returned', function(done){
            // Template for user account edits
            let userEdits = {
                name: "Jane Doe",
                password: "newpassword12345"
            };
            // Create and save new user
            let  user = new User(userTemplate);
            user.save();
            // Generate (Valid) but non existing account ID
            let searchId = mongoose.Types.ObjectId();

            chai.request(app)
                .put(URI_PREFIX + "/users/" + searchId)
                .set("Authorization", token)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });

        // Attempt to edit account that doesn't belong to you
        it('responds with 403 status and returns UnauthorizedEditError', function(done){
            // Template for user account edits
            let userEdits = {
                name: "Jane Doe",
                password: "newpassword12345"
            };
            // Create and save new user
            let user = new User(userTemplate);
            user.save();

            chai.request(app)
                .put(URI_PREFIX + "/users/" + userTemplate._id)
                .set("Authorization", token)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.have.property('code').eql(9);
                    done();
                });
        });

        // Attempt to edit account with empty HTTP body
        it('responds with 400 status and returns ValidationError', function(done){
           // Template for user account edits
           let userEdits = {};

           // Create and save user
            let user = new User(userTemplate);
            user.save();

            // Create token that matches the user's ID
            let validToken = jwt.sign({sub: userTemplate._id, role: userTemplate.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .put(URI_PREFIX + "/users/" + userTemplate._id)
                .set("Authorization", validToken)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Attempt to edit account with invalid password and name
        it('responds with 400 status and returns ValidationError', function(done){
            // Template for user account edits
            let userEdits = {
                name: "JaneDoe!!",
                password: "badpassword"
            };

            // Create and save user
            let user = new User(userTemplate);
            user.save();

            // Create token that matches the user's ID
            let validToken = jwt.sign({sub: userTemplate._id, role: userTemplate.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .put(URI_PREFIX + "/users/" + userTemplate._id)
                .set("Authorization", validToken)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('code').eql(7);
                    done();
                });
        });

        // Successfully Edit account
        it('responds with 200 status and returns success message', function(done){

            // Template for user account edits
            let userEdits = {
                name: "Jane Doe",
                password: "newpassword12345"
            };

            // Create and save user
            let user = new User(userTemplate);
            user.save();

            // Create token that matches the user's ID
            let validToken = jwt.sign({sub: userTemplate._id, role: userTemplate.role}, config.jwtSecret, {expiresIn: 600});
            validToken = "Bearer " + validToken;

            chai.request(app)
                .put(URI_PREFIX + "/users/" + userTemplate._id)
                .set("Authorization", validToken)
                .send(userEdits)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("message").eql("User Successfully Edited");
                    done();
                });
        });

    });
});

/**
 * Utility function to take in email and password credentials
 * And return basic auth string (base-64)
 * @param email
 * @param password
 */
function toAuth(email, password){
    // Concatenate email and password together
    let credentials = email + ":" + password;

    // Convert to basic string
    return "Basic " + Buffer.from(credentials).toString('base64');
}