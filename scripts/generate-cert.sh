#!/bin/bash

# Generate SSL cert for HTTPS

openssl req -nodes -new -x509 -keyout ../bin/ssl/server.key -out ../bin/ssl/server.cert