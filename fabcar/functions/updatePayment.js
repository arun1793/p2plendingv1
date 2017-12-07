'use strict';
var bcSdk = require('../invoke.js');

var affiliation = 'fundraiser';

exports.updatePayment = (campaignID, UserID, transactionID) =>
    new Promise((resolve, reject) => {


        const update = ({
            campaignID: campaignID,
            UserID: UserID,
            transactionID: transactionID
        });

        console.log("ENTERING THE Userregisteration from register.js to blockchainSdk");

        bcSdk.UpdatePayment({ bid_details: update })



        .then(() => resolve({ status: 201, message: 'payment state updated Sucessfully !' }))

        .catch(err => {

            if (err.code == 11000) {

                reject({ status: 409, message: 'User Already did bidding !' });

            } else {
                conslole.log("error occurred" + err);

                reject({ status: 500, message: 'Internal Server Error !' });
            }
        });
    });