const user = require('../models/user');

exports.registerUser = (fullname, email, phone, pan, aadhar, usertype, upi, passpin) =>

    new Promise((resolve, reject) => {

        const newUser = new user({
            fullname: fullname,
            email: email,
            phone: phone,
            pan: pan,
            aadhar: aadhar,
            usertype: usertype,
            upi: upi,
            passpin: passpin

        });

        newUser.save()

        .then(() => resolve({
            status: 201,
            message: 'User Registered Sucessfully !'
        }))

        .catch(err => {

            if (err.code == 11000) {

                reject({
                    status: 409,
                    message: 'User Already Registered !'
                });

            } else {

                reject({
                    status: 500,
                    message: 'Internal Server Error !'
                });
            }
        });
    });