(logo here)

# Tax-E REST API &middot; ![Build Status](https://api.travis-ci.com/rhys3010/taxe-api.svg?token=jQp14CGybcZTPyDpbd5T&branch=master)

An express.js REST API that is used to serve the [Tax-E Android App](https://github.com/rhys3010/taxe).

## Installing / Getting Started

Simply build and run the docker image.

```shell
npm run-script build
npm run-script start
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
Coming Soon


## Database ##
Coming Soon
