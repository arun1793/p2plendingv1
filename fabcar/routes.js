//here only routing is done and if the ro

'use strict';

var crypto = require('crypto');
const jwt = require('jsonwebtoken');
var cors = require('cors');
var mongoose = require('mongoose');
const config = require('./config/config.json');

const register = require('./functions/register');
const createCampaign = require('./functions/createCampaign');
const login = require('./functions/login');
const postbid = require('./functions/postbid');
const updatePayment = require('./functions/updatePayment')
const fetchCampaignlist = require('./functions/fetchCampaignlist');
const fetchActiveCampaignlist = require('./functions/fetchActiveCampaignlist');
var request = require('request');

module.exports = router => {

    router.get('/', (req, res) => res.end('Welcome to p2plending,please hit a service !'));

    // router.post('/login', (req, res) => {

    //     const email = req.body.email;
    //     console.log(`email from ui side`, email);
    //     const passpin = req.body.passpin;
    //     console.log(passpin, 'passpin from ui');



    //     if (!email || !passpin || !email.trim() || !passpin.trim()) {

    //         res.status(400).json({ message: 'Invalid Request !' });

    //     } else {

    //         login.loginUser(email, passpin)

    //         .then(result => {

    //             const token = jwt.sign(result, config.secret, {
    //                 expiresIn: 60000
    //             })


    //             res.status(result.status).json({
    //                 message: result.message,
    //                 token: token,
    //                 userObject: result.users[0]
    //             });


    //         })

    //         .catch(err => res.status(err.status).json({ message: err.message }));
    //     }
    // });

    router.post('/login', cors(), (req, res1) => {
        console.log("entering login function in functions");

        const emailid = req.body.email;
        console.log(emailid);
        const passwordid = req.body.password;
        console.log(passwordid);

        var json = {
            "email": emailid,
            "password": passwordid,

        };

        var options = {
            url: 'https://apidigi.herokuapp.com/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: json
        };


        if (!emailid || !passwordid) {

            res1.status(400).json({
                message: 'Invalid Request !'
            });

        } else {


            request(options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 401 || res.statusCode === 402 || res.statusCode === 404)) {

                    res1.status(res.statusCode).json({
                        status: res.statusCode,
                        message: body.message,
                        token: body.token,
                        usertype: body.usertype,
                        userdetails: body.userDetails


                    })
                }

            });




        }
    });

    router.post('/testmethod', function(req, res) {
        console.log(req.body)
        res.send({ "name": "risabh", "email": "rls@gmail.com" });
    });



    router.post('/updatePayment', (req, res) => {

        const campaignID = req.body.campaignID;
        console.log(campaignID)
        const UserID = getUserId(req);
        console.log(UserID)
        const transactionID = req.body.transactionID;
        console.log(transactionID)



        if (!campaignID || !UserID || !transactionID) {
            //the if statement checks if any of the above paramenters are null or not..if is the it sends an error report.
            res.status(400).json({ message: 'Invalid Request !' });

        } else {


            updatePayment.updatePayment(campaignID, UserID, transactionID)
                .then(result => {

                    //	res.setHeader('Location', '/registerUser/'+email);
                    res.status(result.status).json({
                        status: res.statusCode,
                        message: result.message
                    })
                })

            .catch(err => res.status(err.status).json({ message: err.message }));
        }
    });
    router.post('/registerUser', cors(), (req, res1) => {
        console.log("entering register function in functions");

        const emailid = req.body.email;

        console.log(emailid);
        const passwordid = req.body.password;
        console.log(passwordid);
        const userObjects = req.body.userObject;
        console.log(userObjects);
        const usertypeid = req.body.usertype;
        console.log(usertypeid);
        var json = {
            "email": emailid,
            "password": passwordid,
            "userObject": userObjects,
            "usertype": usertypeid
        };

        var options = {
            url: 'https://apidigi.herokuapp.com/registerUser',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: json
        };


        if (!emailid || !passwordid || !usertypeid) {

            res1.status(400).json({
                message: 'Invalid Request !'
            });

        } else {


            request(options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 409)) {

                    res1.status(res.statusCode).json({
                        status: res.statusCode,
                        message: body.message

                    })
                }

            });




        }
    });

    router.post("/user/phoneverification", cors(), (req, res1) => {
        // const phone = parseInt(req.body.phone, 10);
        const phone = req.body.phone;
        var otp = req.body.otp;
        console.log(otp);
        console.log(phone);

        var json = {
            "phone": phone,
            "otp": otp
        };

        var options = {
            url: 'https://apidigi.herokuapp.com/user/phoneverification',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: json
        };

        if (!otp || !phone) {

            res1
                .status(400)
                .json({ message: 'Invalid Request !' });

        } else {

            request(options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 404 || res.statusCode === 409 || res.statusCode === 500)) {
                    console.log("message" + body.message);
                    res1
                        .status(res.statusCode)
                        .json({ message: body.message, status: body.status })
                }

            });

        }
    });

    router.post('/createCampaign', (req, res) => {
        const status = req.body.status;
        const campaign_id123 = Math.floor(Math.random() * (100000 - 1)) + 1;
        const campaign_id = campaign_id123.toString();
        console.log("data in id:" + campaign_id);
        const user_id = getUserId(req);
        const campaign_title = req.body.campaign_title;
        const campaign_discription = req.body.campaign_discription;
        const loan_amt = req.body.loan_amt;
        const interest_rate = req.body.interest_rate;
        const term = req.body.term;




        if (!status || !campaign_id || !user_id || !campaign_title || !campaign_discription || !loan_amt || !interest_rate || !term || !status.trim() || !campaign_id.trim() || !user_id.trim() ||
            !campaign_title.trim() || !campaign_discription.trim() || !loan_amt.trim() || !interest_rate.trim() || !term.trim()) {
            //the if statement checks if any of the above paramenters are null or not..if is the it sends an error report.
            res.status(400).json({ message: 'Invalid Request !' });

        } else {

            createCampaign.Create_Campaign(status, campaign_id, user_id, campaign_title, campaign_discription, loan_amt, interest_rate, term)
                .then(result => {

                    //	res.setHeader('Location', '/registerUser/'+email);
                    res.status(result.status).json({
                        status: res.statusCode,

                        message: result.message
                    })
                })

            .catch(err => res.status(err.status).json({ message: err.message }));
        }
    });
    router.post('/postbid', (req, res) => {
        const bid = Math.floor(Math.random() * (100000 - 1)) + 1;
        const bid_id = bid.toString();
        console.log("data in id:" + bid_id);
        const bid_campaign_id = req.body.bid_campaign_id;
        console.log("bid_campaign_details  " + bid_campaign_id);
        const bid_user_id = getUserId(req);
        console.log("bid_user_id " + bid_user_id);
        const bid_quote = req.body.bid_quote;



        if (!bid_id || !bid_campaign_id || !bid_user_id || !bid_quote) {
            //the if statement checks if any of the above paramenters are null or not..if is the it sends an error report.
            res.status(400).json({ message: 'Invalid Request !' });

        } else {


            postbid.postbid(bid_id, bid_campaign_id, bid_user_id, bid_quote)
                .then(result => {

                    //	res.setHeader('Location', '/registerUser/'+email);
                    res.status(result.status).json({
                        status: res.statusCode,
                        message: result.message
                    })
                })

            .catch(err => res.status(err.status).json({ message: err.message }));
        }
    });
    router.get('/campaign/Campaignlist', (req, res) => {
        if (checkToken(req)) {

            fetchCampaignlist.fetch_Campaign_list({ "user": "risabh", "getcusers": "getcusers" })

            .then(function(result) {
                return res.json({
                    message: result
                });
            })

            .catch(err => res.status(err.status).json({ message: err.message }));

        } else {

            res.status(401).json({ message: 'cant fetch data !' });
        }
    });
    router.get('/campaign/openCampaigns', (req, res) => {
        if (checkToken(req)) {

            fetchActiveCampaignlist.fetch_Active_Campaign_list({ "user": "risabh", "getcusers": "getcusers" })

            .then(function(result) {
                console.log("result array data" + result.campaignlist.campaignlist);

                var filteredcampaign = [];
                console.log("length of result array" + result.campaignlist.campaignlist.length);

                for (let i = 0; i < result.campaignlist.campaignlist.length; i++) {

                    if (result.campaignlist.campaignlist[i].status === "active") {

                        filteredcampaign.push(result.campaignlist.campaignlist[i]);

                        console.log("filteredampaign array " + filteredcampaign);



                    }
                }

                return res.json({
                    status: res.statusCode,
                    message: "active campaigns found",
                    activeCampaigns: filteredcampaign
                });
            })

            .catch(err => res.status(err.status).json({ message: err.message }));

        } else {

            return res.status(401).json({ message: 'cant fetch data !' });
        }
    });
}

function getUserId(req) {

    const token = req.headers['x-access-token'];

    if (token) {

        try {

            var decoded = jwt.verify(token, config.secret);
            return decoded.users[0]._id

        } catch (err) {

            return false;
        }

    } else {

        return failed;
    }
}

function checkToken(req) {

    const token = req.headers['x-access-token'];

    if (token) {

        try {

            var decoded = jwt.verify(token, config.secret);
            return true

        } catch (err) {

            return false;
        }

    } else {

        return false;
    }
}