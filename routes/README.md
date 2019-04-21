# API Documentation #

## Routes ##

| URL                         | HTTP Method  | Functionality                                                |
|:----------------------------|:-------------|:-------------------------------------------------------------|
| /users                      | GET          | [Retrieve All Users](#getAllUsers)                           |
| /users                      | POST         | [Create User](#newUser)                                      |
| /users/:id                  | GET          | [Retrieve User](#getUser)                                    |
| /users/:id                  | PATCH        | [Update User](#updateUser)                                   |
| /users/login                | POST         | [Retrieve Access Token](#login)                              |
| /users/:id/bookings         | GET          | [Retrieve User's Bookings](#getBookings)                     |
| /bookings                   | GET          | [Retrieve all Unallocated Bookings](#getUnallocatedBookings) |
| /bookings                   | POST         | [Create Booking](#newBooking)                                |
| /bookings/:id               | GET          | [Retrieve Booking](#getBooking)                              |
| /bookings/:id               | PATCH        | [Update Booking](#updateBooking)                             |
| /bookings/:id/claim         | PATCH        | [Claim an Unallocated Booking](#claimBooking)                |
| /bookings/:id/release       | PATCH        | [Release a Booking](#releaseBooking)                         |
| /companies/:id              | GET          | [Retrieve Company](#getCompany)                              |
| /companies/:id/bookings     | GET          | [Retrieve Company's Bookings](#getCompanyBookings)           |
| /companies/:id/admins       | GET          | [Retrieve Company's Admins](#getCompanyAdmins)               |
| /companies/:id/drivers      | GET          | [Retrieve Company's Drivers](#getDrivers)                    |
| /companies/:id/drivers      | PATCH        | [Add Driver to Company](#addDriver)                          |
| /companies/:id/drivers/:id  | PATCH        | [Remove Driver from Company](#removeDriver)                  |



### <a name="getAllUsers"></a> Retrieve All Users ###

Retrieves the names and IDs of all registered users.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
N/A

#### Example Response ####
```
[
    {
        "_id": "5c7c640796a5b10008e056ce",
        "name": "John Doe"
    },
    {
        "_id": "5c7c640796a5b10008e073ae",
        "name": "Jane Doe"
    }
]
```

### <a name="newUser"></a> Create User ###

Creates a new User record from information provided in request body.

#### Request Headers ####
N/A

#### Request Body ####
| Attribute                 | Description                            |
|:-------------------------:|:--------------------------------------:|
| ```email```               | (required) the new user's email        |
| ```name```                | (required) the new user's full name    |
| ```password```            | (required) the new user's password     |


### <a name="getUser"></a> Retrieve User ###

Retrieves information about a given user, based on the provided user ID.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
N/A

#### Example Response ####
```
{
    "_id": "5c7c640796a5b10008e056ce",
    "email": "johndoe@gmail.com",
    "name": "John Doe",
    "__v": 0,
    "created_at": "2019-03-03T23:32:23.298Z",
    "available": false,
    "bookings": [],
    "company": null,
    "role": "Customer"
}
```

### <a name="updateUser"></a> Update User ###

Updates a user's record based on the user ID passed as a parameter.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
| Attribute                 | Description                            |
|:-------------------------:|:--------------------------------------:|
| ```name```                | (optional) the user's new full name    |
| ```password```            | (optional) the user's new password     |
| ```old_password```        | (optional) the user's old password     |
| ```availability```        | (optional) the driver's availability   |


### <a name="login"></a> Retrieve Access Token ###

Sends Basic Auth credentials (email and password) and if valid grants a 24 hour access token.

#### Request Headers ####
| Attribute                 | Description                           |
|:-------------------------:|:-------------------------------------:|
| ```Authorization```       | (required) the basic auth credentails |

#### Request Body ####
| Attribute                 | Description                            |
|:-------------------------:|:--------------------------------------:|
| ```email```               | (required) the user's email            |
| ```password```            | (required) the user's password         |

#### Example Response ####
```
{
    "_id": "5c7c640796a5b10008e056ce",
    "email": "johndoe@gmail.com",
    "name": "John Doe",
    "__v": 0,
    "created_at": "2019-03-03T23:32:23.298Z",
    "role": "Customer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YzdjNjQwNzk2YTViMTAwMDhlMDU2Y2UiLCJyb2xlIjoiQ3VzdG9tZXIiLCJpYXQiOjE1NTE3MTY4MjMsImV4cCI6MTU1MTgwMzIyM30.WaMrF646juSZmKUnrjXZAnSrwsgcI_A5J627llI2CRc"
}
```

### <a name="getBookings"></a> Retrieve User's Bookings ###

Retrieves a list of the user's bookings, can pass a query parameter to limit results.

#### Request Headers ####
| Attribute                 | Description                           |
|:-------------------------:|:-------------------------------------:|
| ```Authorization```       | (required) the authorization token    |

#### Request Body ####
N/A

#### Example Response ####
```
[
    {
        "_id": "5c9abae34b5cee00080eeae7",
        "pickup_location": "Aberystwyth Pier",
        "destination": "Cwrt Mawr",
        "time": "2019-03-27T00:50:42.000Z",
        "no_passengers": 2,
        "customer": "5c8ee3eae99c4400079f87bb",
        "__v": 0,
        "created_at": "2019-03-26T23:50:59.567Z",
        "status": "Pending",
        "company": "5c9a41819e3ed800077f7c86",
        "driver": "5c9abae34b5cee00080eeae7",
        "id": "5c9abae34b5cee00080eeae7"
    },
    {
        "_id": "5caca7e6d13e6d0007f68658",
        "pickup_location": "Fferm Penglais Block 17",
        "destination": "Aberystwyth Golf Club",
        "time": "2019-04-09T16:37:49.926Z",
        "no_passengers": 1,
        "customer": "5caa0ec58a006e0007573de6",
        "__v": 0,
        "company": null,
        "driver": null,
        "created_at": "2019-04-09T14:10:46.442Z",
        "status": "Pending",
        "notes": [
            "Booking Claimed by: Taxi Co",
            "Booking Released"
        ],
        "id": "5caca7e6d13e6d0007f68658"
    }
]
```

### <a name="getUnallocatedBookings"></a> Retrieve all Unallocated Bookings ###

Retrieves a list of the all unallocated bookings, viewable by Company Admins

#### Request Headers ####
| Attribute                 | Description                           |
|:-------------------------:|:-------------------------------------:|
| ```Authorization```       | (required) the authorization token    |

#### Request Body ####
N/A

#### Example Response ####
```
[
    {
        "_id": "5c9abae34b5cee00080eeae7",
        "pickup_location": "Aberystwyth Pier",
        "destination": "Cwrt Mawr",
        "time": "2019-03-27T00:50:42.000Z",
        "no_passengers": 2,
        "customer": "5c8ee3eae99c4400079f87bb",
        "__v": 0,
        "created_at": "2019-03-26T23:50:59.567Z",
        "status": "Pending",
        "company": "",
        "driver": "5c9abae34b5cee00080eeae7",
        "id": "5c9abae34b5cee00080eeae7"
    },
    {
        "_id": "5caca7e6d13e6d0007f68658",
        "pickup_location": "Fferm Penglais Block 17",
        "destination": "Aberystwyth Golf Club",
        "time": "2019-04-09T16:37:49.926Z",
        "no_passengers": 1,
        "customer": "5caa0ec58a006e0007573de6",
        "__v": 0,
        "company": null,
        "driver": null,
        "created_at": "2019-04-09T14:10:46.442Z",
        "status": "Pending",
        "notes": [
            "Booking Claimed by: Taxi Co",
            "Booking Released"
        ],
        "id": "5caca7e6d13e6d0007f68658"
    }
]
```

### <a name="newBooking"></a> Create Booking ###
Creates a new Booking record from information provided in request body.

#### Request Headers ####
N/A

#### Request Body ####
| Attribute                 | Description                                                   |
|:-------------------------:|:-------------------------------------------------------------:|
| ```pickup_location```     | (required) the pickup location of the new booking             |
| ```destination```         | (required) the destination of the new booking                 |
| ```time```                | (required) the desired time of the new booking (ISO Format)   |
| ```no_passengers```       | (required) the number of passengers for the new booking       |

### <a name="getBooking"></a> Retrieve Booking ###

Retrieves information about a given booking, based on the provided ID.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
N/A

#### Example Response ####
```
{
    "_id": "5c8e424c29b15f000813aa00",
    "pickup_location": "Fferm Penglais",
    "destination": "Ynyslas Beach",
    "time": "2019-03-17T13:53:00.000Z",
    "no_passengers": 1,
    "customer": {
        "_id": "5c8e418129b15f000813a9fe",
        "name": "Rhys Evans"
    },
    "__v": 0,
    "created_at": "2019-03-17T12:49:16.078Z",
    "status": "Pending"
}
```

### <a name="updateBooking"></a> Update Booking ###

Updates a booking's record based on the booking ID as a parameter

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
| Attribute                 | Description                                 |
|:-------------------------:|:-------------------------------------------:|
| ```status```              | (optional) the new status of the booking    |
| ```time```                | (optional) the new time of the booking      |
| ```driver```              | (optional) the new driver of the booking    |
| ```note```                | (optional) a new note for the booking       |

### <a name="claimBooking"></a> Claim an Unallocated Booking ###

As a Company Admin, claim an unallocated booking for your company

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
| Attribute                 | Description                                 |
|:-------------------------:|:-------------------------------------------:|
| ```company```              | (required) the ID of the company           |

### <a name="claimBooking"></a> Release a Booking ###

As a Company Admin or Booking Driver, release a booking back to the unallocated pool.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
N/A

### <a name="getCompany"></a> Retrieve a Company ###

Retrieves a Company's record.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

### Request Body ###
N/A

#### Example Response ####
```
{
    "_id": "5caa3e8ca6c086b4686bcc37",
    "name": "Taxi Co",
    "__v": 5,
    "created_at": "2019-04-07T18:16:44.359Z",
    "admins": [
        "5caa3e5dde3576000871cf3a"
    ],
    "drivers": [
        "5caa0b3d2ff74f00072e67ea"
    ],
    "bookings": []
}
```

### <a name="getCompanyBookings"></a> Retrieve a Company's Bookings ###

Retrieves a list of a Company's Bookings

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

### Request Body ###
N/A

### Example Response ###
```
[
    {
        "_id": "5caca7e6d13e6d0007f68658",
        "pickup_location": "Fferm Penglais Block 17",
        "destination": "Aberystwyth Golf Club",
        "time": "2019-04-09T16:37:49.926Z",
        "no_passengers": 1,
        "customer": "5caa0ec58a006e0007573de6",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "driver": null,
        "created_at": "2019-04-09T14:10:46.442Z",
        "status": "In_Progress",
        "notes": [
            "Booking Claimed by: Taxi Co",
            "Booking Released",
            "Booking Claimed by: Taxi Co"
        ],
        "id": "5caca7e6d13e6d0007f68658"
    },
    {
        "_id": "5caca7e6d13e6d0007f68658",
        "pickup_location": "Cwrt Mawr",
        "destination": "Aberystwyth University",
        "time": "2019-04-09T16:37:49.926Z",
        "no_passengers": 1,
        "customer": "5caa0ec58a006e0007573de6",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "driver": null,
        "created_at": "2019-04-09T14:10:46.442Z",
        "status": "Cancelled",
        "notes": [
            "Booking Claimed by: Taxi Co",
            "Booking Released",
            "Booking Claimed by: Taxi Co"
        ],
        "id": "5caca7e6d13e6d0007f68658"
        }
]
```

### <a name="getCompanyAdmins"></a> Retrieve a Company's Admins ###

Retrieves a list of a Company's Admins

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

### Request Body ###
N/A

### Example Response ###
```
[
    {
        "_id": "5caa3e5dde3576000871cf3a",
        "email": "janedoe@gmail.com",
        "name": "Jane Doe",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "created_at": "2019-04-07T18:15:57.045Z",
        "available": false,
        "bookings": [],
        "role": "Company_Admin",
        "id": "5caa3e5dde3576000871cf3a"
    },
    {
        "_id": "5caa0b3d2ff74f00072e67ea",
        "email": "rhys301097@gmail.com",
        "name": "Rhys Evans",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "created_at": "2019-04-07T18:15:57.045Z",
        "available": false,
        "bookings": [],
        "role": "Company_Admin",
        "id": "5caa0b3d2ff74f00072e67ea"
    },
]
```

### <a name="getDrivers"></a> Retrieve a Company's Drivers ###

Retrieves a list of a Company's employed Drivers

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

### Request Body ###
N/A

### Example Response ###
```
[
    {
        "_id": "5caa3e5dde3576000871cf3a",
        "email": "janedoe@gmail.com",
        "name": "Jane Doe",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "created_at": "2019-04-07T18:15:57.045Z",
        "available": true,
        "bookings": [],
        "role": "Driver",
        "id": "5caa3e5dde3576000871cf3a"
    },
    {
        "_id": "5caa0b3d2ff74f00072e67ea",
        "email": "rhys301097@gmail.com",
        "name": "Rhys Evans",
        "__v": 0,
        "company": "5caa3e8ca6c086b4686bcc37",
        "created_at": "2019-04-07T18:15:57.045Z",
        "available": true,
        "bookings": [],
        "role": "Driver",
        "id": "5caa0b3d2ff74f00072e67ea"
    },
]
```

### <a name="addDriver"></a> Add a Driver to a Company ###

Add a driver to a company's record.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

### Request Body ###
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```driver```              | (required) the driver to add       |

### <a name="removeDriver"></a> Remove a Driver from a Company ###

Remove a driver to a company's record.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |


## Errors ##

### InvalidTokenError ###
This error is thrown if there is a token present in the request header, but it could not be validated.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 1          | 403 (Forbidden)    |

### TokenExpiredError ###
Thrown if the token provided in the request header has expired.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 2          | 403 (Forbidden)    |

### MissingTokenError ###
Thrown if no token was found in the request header. This could be because the token was provided under the wrong key.

| Code       | HTTP Status         |
|:----------:|:-------------------:|
| 3          | 401 (Unauthorized)  |

### NoUsersFoundError ###
Thrown if a GET request for user(s) returns a 404. Pretty self explanatory.

| Code       | HTTP Status         |
|:----------:|:-------------------:|
| 4          | 404 (Not Found)     |

### UserAlreadyExistsError ###
Thrown if new user could not be created due to a user record already existing with the provided email.

| Code       | HTTP Status          |
|:----------:|:--------------------:|
| 5          | 400 (Bad Request)    |

### AuthenticationFailedError ###
Thrown if invalid credentials are POSTed to /users/login.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 6          | 403 (Forbidden)    |

### ValidationError ###
Thrown if there was an error validating contents request body. Specific validation error(s) are returned as a list within the response. 

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 7          | 400 (Bad Request)  |

### InvalidObjectIdError ###
Thrown if the ID passed in a /users/:id request is not a valid MongoDB Object ID.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 8          | 400 (Bad Request)  |

### UnauthorizedEditError ###
Thrown if an attempt to edit  a record is made using a token that does not have the required permissions.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 9          | 403 (Forbidden)    |

### BookingNotFoundError ###
Thrown if a booking could not be found within the database

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 10         | 404 (Not Found)    |

### CustomerAlreadyHasActiveBookingError ###
Thrown if a customer attempts to create a booking when they already have an active booking on their account.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 11         | 403 (Forbidden)    |

### UnauthorizedViewError ###
Thrown if an attempt to view a record is made using a token that does not have the required permissions.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 12         | 403 (Forbidden)    |

### InvalidRoleError ###
Thrown if a user attempts to perform a task that is not allowed within their current role, i.e. setting a customer as the driver of a booking.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 13         | 403 (Forbidden)    |

### MissingAuthenticationError ###
Thrown if a user attempts to log in with an invalid or missing Basic Auth string in the request header.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 14         | 401 (Unauthorized) |

### CompanyNotFoundError ###
Thrown if a company could not be found within the database

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 15         | 404 (Not Found)    |

### DriverAlreadyAddedError ###
Thrown if a Company Admin attempts to add a driver to a company, when the driver is already employed.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 16         | 404 (Forbidden)    |



