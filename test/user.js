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
const URI_PREFIX = "/api/v1";
const jwt = require('jsonwebtoken');
const config = require('../config');
const auth = require('basic-auth');
const bcrypt = require('bcryptjs');

chai.use(chaiHttp);

// Parent testing block
describe('Users', function(){

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
        // Create a new user to grant token to
        let user = new User({email: "janedoe@gmail.com", name: "Jane Doe", password: "qwerty123456"});
        user.save();

        // Get the newly created user in order to generate a token
        let newUser = User.find({email: "janedoe@gmail.com"});
        let token = jwt.sign({sub: newUser.id, role: newUser.role}, config.jwtSecret, {expiresIn: 60});
        token = "Bearer " + token;

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
     * Test GET /users/:email route
     */
    describe('/GET users/:email', function(){

        // Email to use to search for user
        const emailToSearch = "johndoe@gmail.com";
        // The sample user to view profile
        let user = new User({email: "me@gmail.com", name: "Rhys Evans", password: "passwordpassword12354"});
        user.save();
        // Use sample user to generate token
        let newUser = User.find({email: "me@gmail.com"});
        let token = jwt.sign({sub: newUser.id, role: newUser.role}, config.jwtSecret, {expiresIn: 60});
        token = "Bearer " + token;

        // Attempt to view user profile without token
        it('responds with 401 status and missing token error', function(done){
            // The sample user to view profile
            let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "ajmigofayhc9uhabwiugb12"});
            user.save();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + emailToSearch)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('code').eql(3);
                    done();
                });
        });

        // Atttempt to get user info that doesnt exist
        it('responds with 404 status and no users found error', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/users/person@doesntexist.com")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('code').eql(4);
                    done();
                });
        });

        // Successfully view user info
        it('responds with 200 status and returns info about user, omitting password', function(done){
            // The sample user to view profile
            let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "ajmigofayhc9uhabwiugb12"});
            user.save();

            chai.request(app)
                .get(URI_PREFIX + "/users/" + emailToSearch)
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('email').eql(emailToSearch);
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
            password: "asdf12345"
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
                   res.should.have.status(201);
                   res.body.should.have.property('token');
                   done();
                });
        });
    });

    /**
     * Test PUT /users/:email route
     * TODO
     */
    describe('/PUT users/:email', function(){

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