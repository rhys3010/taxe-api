# Changelog
All notable changes to the API will be documented in this file .

## [0.3.1] - 2019-04-21
### Added
- GET /companies/:id/admins route to view all of a company's admins

### Updated
- GET /companies/:id/drivers route now returns a fully populated list of drivers
- PATCH /companies/:id/drivers now takes a user's email as a parameter as opposed to ID, to support
adding drivers by their email (for web client).

## [0.3.0] - 2019-04-09
### Added
- Role based access control
- Support for companies: model, controller, service, routes, and tests
- Company admins can view and claim unallocated bookings, release bookings, add and remove drivers and allocate drivers to bookings
- GET /bookings/ route to view all unallocated bookings
- New Errors to support all company related routes

### Updated
- User model to support drivers (availability and company fields)
- Booking model to keep track of the booking's company
- Booking model to make notes an array
- All PUT routes are now PATCH routes
- Drivers can no longer create bookings
- root README.md file for updated Tax-E icon
- /routes/README.md file to reflect changes to the API
- This file

## [0.2.1] - 2019-03-26
### Updated
- User's Bookings route to view a list of all the user's bookings.
- User controller to support new /bookings sub-route
- User service to support the new route
- User unit tests to test the new route and password changing
- Error Handling file to handle missing basic-auth credentials
- Edit User service to enforce the provision of previous password

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
