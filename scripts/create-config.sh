#!/bin/bash

# Create default config file for travis and tests

echo '{"httpPort": "3000", "httpsPort": "3443", "jwtSecret": "defaultsecret", "jwtExpiry": 300, "mongoURI": "mongodb://mongo:27017/taxe-api", "mongoUser": "", "mongoPassword": ""}' >> config.json
