# API Documentation #

## Routes ##

| URL            | HTTP Method  | Functionality                        |
|:--------------:|:------------:|:------------------------------------:|
| /users         | GET          | [Retrieve All Users](#getAllUsers)   |
| /users         | POST         | [Create User](#newUser)              |
| /users/:id     | GET          | [Retrieve User](#getUser)            |
| /users/:id     | PUT          | [Update User](#updateUser)           |
| /users/login   | POST         | [Retrieve Access Token](#login)      |


###<a name="getAllUsers"></a> Retrieve All Users ###

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

###<a name="newUser"></a> Create User ###

Creates a new User record from information provided in request body.

#### Request Headers ####
N/A

#### Request Body ####
| Attribute                 | Description                            |
|:-------------------------:|:--------------------------------------:|
| ```email```               | (required) the new user's email        |
| ```name```                | (required) the new user's full name    |
| ```password```            | (required) the new user's password     |


###<a name="getUser"></a> Retrieve User ###

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

###<a name="updateUser"></a> Update User ###

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


###<a name="login"></a> Retrieve Access Token ###

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



