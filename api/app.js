const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in the mongoose models
const { List, Song, User } = require('./db/models');

const jwt = require('jsonwebtoken');


/* MIDDLEWARE  */

// Load middleware
app.use(bodyParser.json());


// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* END MIDDLEWARE  */




/* ROUTE HANDLERS */

/* LIST ROUTES */

/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', authenticate, (req, res) => {
    // We want to return an array of all the lists that belong to the authenticated user 
    List.find({
        _userId: req.user_id
    }).populate('songs').then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
})

/**
 * POST /lists
 * Purpose: Create a list
 */
app.post('/lists', authenticate, (req, res) => {
    // We want to create a new list and return the new list document back to the user (which includes the id)
    // The list information (fields) will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
});

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});
app.put('/lists', authenticate, (req, res) => {
    // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all the songs that are in the deleted list
        deleteSongsFromList(removedListDoc._id);
    })
});


/**
 * GET /lists/:listId/songs
 * Purpose: Get all songs in a specific list
 */
app.get('/songs', authenticate, (req, res) => {
    // We want to return all songs that belong to a specific list (specified by listId)
    Song.find({
        
    }).then((songs) => {
        res.send(songs);
    })
});


/**
 * POST /lists/:listId/songs
 * Purpose: Create a new song in a specific list
 */
app.post('/lists/:listId/songs', authenticate, (req, res) => {
    // We want to create a new song in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can create new songs
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canCreateSong) => {
        if (canCreateSong) {
            let newSong = new Song({
                title: req.body.title,
                _listId: req.params.listId
            });
            newSong.save().then((newSongDoc) => {
                res.send(newSongDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
})

/**
 * PATCH /lists/:listId/songs/:songId
 * Purpose: Update an existing song
 */
app.patch('/lists/:listId/songs/:songId', authenticate, (req, res) => {
    // We want to update an existing song (specified by songId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to songs within this list
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canUpdateSongs) => {
        if (canUpdateSongs) {
            // the currently authenticated user can update songs
            Song.findOneAndUpdate({
                _id: req.params.songId,
                _listId: req.params.listId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});

/**
 * DELETE /lists/:listId/songs/:songId
 * Purpose: Delete a song
 */
app.delete('/lists/:listId/songs/:songId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can make updates to songs within this list
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canDeleteSongs) => {
        
        if (canDeleteSongs) {
            Song.findOneAndRemove({
                _id: req.params.songId,
                _listId: req.params.listId
            }).then((removedSongDoc) => {
                res.send(removedSongDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
});



/* USER ROUTES */

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})



/* HELPER METHODS */
let deleteSongsFromList = (_listId) => {
    Song.deleteMany({
        _listId
    }).then(() => {
        console.log("Songs from " + _listId + " were deleted!");
    })
}




app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})