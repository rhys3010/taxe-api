# API Documentation #

## Routes ##

| URL            | HTTP Method  | Functionality                        |
|:--------------:|:------------:|:------------------------------------:|
| /users         | GET          | [Retrieve All Users](#getAllUsers)   |
| /users         | POST         | [Create User](#newUser)              |
| /users/:id     | GET          | [Retrieve User](#getUser)            |
| /users/:id     | PUT          | [Update User](#updateUser)           |
| /users/login   | POST         | [Retrieve Access Token](#login)      |


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
    "role": "Customer"
}
```

### <a name="updateUser"></a> Update User ###

Updates a user's name or password based on the user ID passed as a parameter.

#### Request Headers ####
| Attribute                 | Description                        |
|:-------------------------:|:----------------------------------:|
| ```Authorization```       | (required) the authorization token |

#### Request Body ####
| Attribute                 | Description                            |
|:-------------------------:|:--------------------------------------:|
| ```name```                | (optional) the new user's full name    |
| ```password```            | (optional) the new user's password     |


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
Thrown if an attempt to edit  a user record is made using a token that does not belong to the subject of the edit.

| Code       | HTTP Status        |
|:----------:|:------------------:|
| 9          | 403 (Forbidden)    |








