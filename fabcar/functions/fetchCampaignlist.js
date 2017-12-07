'use strict';

//const user = require('../models/user');
var user = "risabh.s";
var getcusers = "getcusers";
const bcSdk = require('../query.js');

exports.fetch_Campaign_list = (params) => {
    return new Promise((resolve, reject) => {
        bcSdk.fetchCampaignlist({ user: user, getcusers: getcusers })

        .then((campaignArray) => {
            console.log("data in campaignArray " + campaignArray)
            return resolve({ status: 201, "campaignlist": campaignArray })
        })



        .catch(err => {

            if (err.code == 11000) {

                return reject({ status: 409, message: 'cant fetch !' });

            } else {
                conslole.log("error occurred" + err);

                return reject({ status: 500, message: 'please create a campaign !' });
            }
        })
    })
};