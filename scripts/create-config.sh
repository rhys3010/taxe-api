#!/bin/bash

# Create default config file for travis and tests

echo '{"jwtSecret": "defaultsecret", "jwtExpiry": 300, "mongoURI": "mongodb://mongo:27017/taxe-api"}' >> config.json
