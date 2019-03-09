
<img src="https://i.imgur.com/ZpCtOo4.png" width="120" height="120">

# Tax-E REST API &middot; ![Build Status](https://api.travis-ci.com/rhys3010/taxe-api.svg?token=jQp14CGybcZTPyDpbd5T&branch=master)

An express.js REST API that is used to serve the [Tax-E Android App](https://github.com/rhys3010/taxe). Handles User Authentication, Bookings and Company Management.

## Installing / Getting Started

Firstly, rename 'config.sample.json' to 'config.json', and input necessary values (see configuration). Then, in order to generate SSL certificates, navigate to ./scripts and execute the following:

```shell
sh generate-cert.sh
```

Once all configuration is handled, simply run the following npm script. It will build, and spin up a docker container for both the database and the API.

```shell
npm run-script debug
```

## Developing

### Built with
[Node.js](https://nodejs.org/en/), [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/)

### Prerequisites
[Docker](https://www.docker.com/), Docker-Compose

## Versioning
Project uses [Semantic Versioning 2.0.0](https://semver.org/)

## Configuration ##

### Environment Variables ###
If using environment variables, set MONGO_URI to the connection URI of your mongodb database. Set JWT_EXPIRY to the amount of time (in seconds) before the jwt token expires. Set JWT_SECRET to your jwt secret key.

### Configuration File ###
If using a config file, rename 'config.sample.json' to 'config.json', then input necessary values.

## Tests
Run all chai tests in mocha environment using the following command
```shell
npm run-script test
```

## Api Reference ##
https://github.com/rhys3010/taxe-api/blob/master/routes/README.md


## Database ##
Coming Soon