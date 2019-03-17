# Changelog
All notable changes to the API will ibe documented in this file .

## [0.2.0] - 2019-03-17
### Added
- Bookings Route to support POST, GET and PUT HTTP methods
- Booking Model
- Booking Controller to implement the booking routes
- Booking Service to interface with the database
- Booking Unit Tests
- Status helper file to enumerate booking statuses

### Updated
- User model to store user's bookings (as array)
- Error-Handler middleware to support new errors needed for booking routes
- Validate middleware to support necessary input validations for bookings
- API Documentation
- This file

## [0.1.0] - 2019-03-04
### Added
- CHANGELOG file to keep track of future changes
- API Documentation in the /routes directory
- Support for user authentication
- Support for user management
- Automated tests for all /user routes
- Formal error handling 