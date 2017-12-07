'use strict';

//const bc_client = require('../blockchain_sample_client');
//const bcrypt = require('bcryptjs');
var bcSdk = require('../invoke.js');
var user = 'risabh.s';
var affiliation = 'fundraiser';
//exports is used here so that registerUser can be exposed for router and blockchainSdk file
exports.postbid = (bid_id, bid_campaign_id, bid_user_id, bid_quote) =>
    new Promise((resolve, reject) => {


        const bid_details = ({
            bid_id: bid_id,
            bid_campaign_id: bid_campaign_id,
            bid_user_id: bid_user_id,
            bid_quote: bid_quote
        });

        console.log("ENTERING THE Userregisteration from register.js to blockchainSdk");

        bcSdk.postbid({ user: user, bid_details: bid_details })



        .then(() => resolve({ status: 201, message: 'bid uploaded Sucessfully !' }))

        .catch(err => {

            if (err.code == 11000) {

                reject({ status: 409, message: 'User Already did bidding !' });

            } else {
                conslole.log("error occurred" + err);

                reject({ status: 500, message: 'Internal Server Error !' });
            }
        });
    });