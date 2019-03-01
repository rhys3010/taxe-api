/**
 * user.js
 * All user related tests (specifically the /users/) route
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
        let user = new User({email: "johndoe@gmail.com", name: "John Doe", password: "qwerty123456"});
        user.save();

        // Get the newly created user in order to generate a token
        let newUser = User.find({email: "johndoe@gmail.com"});
        let token = jwt.sign({sub: newUser.id, role: newUser.role}, config.jwtSecret, {expiresIn: 60});
        token = "Bearer " + token;

        // Get Users using a missing token
        it('responds with status 401', function(done){
            chai.request(app)
                .get(URI_PREFIX + "/users")
                .end((err, res) => {
                    res.should.have.status(401);
                    done()
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
                    done()
                });
        });


        // Get users where there are some
        it('responds with status 200 and is of length 1 (1 user)', function(done){
            // Create a user and add to DB
            let user = new User({email: "janedoe@gmail.com", name: "Jane Doe", password: "qwerty123456"});
            user.save();
            chai.request(app)
                .get(URI_PREFIX + "/users")
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);
                    console.log(res.body);
                    done()
                });
        });

    });
});