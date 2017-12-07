'use strict';

//const bc_client = require('../blockchain_sample_client');
//const bcrypt = require('bcryptjs');
var bcSdk = require('../invoke.js');
var user = 'risabh.s';
var affiliation = 'fundraiser';
//exports is used here so that registerUser can be exposed for router and blockchainSdk file
exports.Create_Campaign = (status, campaign_id, user_id, campaign_title, campaign_discription, loan_amt, interest_rate, term) =>
    new Promise((resolve, reject) => {


        const campaign_details = ({

            status: status,
            campaign_id: campaign_id,
            user_id: user_id,
            campaign_title: campaign_title,
            campaign_discription: campaign_discription,
            loan_amt: loan_amt,
            interest_rate: interest_rate,
            term: term

        });

        console.log("ENTERING THE CORE MODULE");

        bcSdk.Create_Campaign({ user: user, CampaignDetails: campaign_details })



        .then(() => resolve({ status: 201, message: 'campaign created  Sucessfully !' }))

        .catch(err => {

            if (err.code == 11000) {

                reject({ status: 409, message: 'some error !' });

            } else {
                conslole.log("error occurred" + err);

                reject({ status: 500, message: 'Internal Server Error !' });
            }
        });
    });