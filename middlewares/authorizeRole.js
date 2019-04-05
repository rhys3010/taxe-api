/*
 * Copyright (c) Rhys Evans
 * All Rights Reserved
 */

/**
 * authorizeRole.js
 *
 * Middleware to implement role based access control to given routes
 *
 * @author Rhys Evans
 * @version 0.3
 **/

'use strict';

module.exports = authorizeRole;

/**
 * Grant access based on the user's role and the specified 'allowed roles'.
 * @param roles - Can be either an array of roles or just a single role
 */
function authorizeRole(roles = []){
    // Decide whether the parameter passed is an array or single value
    if(typeof roles == 'string'){
        roles = [roles];
    }

    // Return the midddleware function to authorize the user
    return function(req, res, next){

        // Verify that the user is authorized based on allowed roles
        if(roles.length && !roles.includes(res.locals.userRole)){
            // Throw Unauthorized error
            const error = new Error();
            error.name = "InvalidRoleError";
            throw error;
        }

        next();
    }
}