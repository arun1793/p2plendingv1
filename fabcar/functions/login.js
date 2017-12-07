'use strict';

const user = require('../models/user');

exports.loginUser = (email, passpin) =>

    new Promise((resolve, reject) => {



        user.find({
                "email": email
            })
            .then(users => {

                const dbpin = users[0].passpin;
                console.log(users[0].passpin)
                console.log(users[0]._id)
                console.log(dbpin + "   " + users[0].passpin)

                if (String(passpin) === String(dbpin)) {

                    resolve({
                        status: 200,
                        message: email,
                        users: users[0]
                    });

                } else {

                    reject({
                        status: 401,
                        message: 'Invalid Credentials !'
                    });
                }
            })




        .then(users => {
            console.log(users)
            if (users.length == 0) {

                reject({
                    status: 404,
                    message: 'User Not Found !'
                });

            } else {

                return users[0];

            }
        })


        .catch(err => reject({
            status: 403,
            message: 'email id not registered'
        }));


    });