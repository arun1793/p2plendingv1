'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({

    fullname: String,
    email: { type: String, unique: true },
    phone: Number,
    pin: String,
    pan: Number,
    aadhar: Number,
    usertype: String,
    upi: String,
    passpin: Number,


});


mongoose.Promise = global.Promise;
//mongoose.connect('mongodb://localhost:27017/digitalId', { useMongoClient: true });

mongoose.connect('mongodb://rpqbci:rpqb123@ds163721.mlab.com:63721/commercialinsurance', { useMongoClient: true });



module.exports = mongoose.model('user', userSchema);