const mongoose = require('mongoose');


const readerSchema = new mongoose.Schema({

    firstName:{
        type: String,
        required : true
    },
    lastName:{
        type: String,
        required : true
    },
    email:{
        type: String,
        required : true
    },
    userID:{
        type: String,
        required : true
    },
    password:{
        type: String,
        required : true
    }

});


module.exports = mongoose.model('Reader', readerSchema);