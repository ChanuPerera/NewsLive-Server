const mongoose = require('mongoose');


const reporterSchema = new mongoose.Schema({

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
    },
    city:{
        type: String,
        required : true
    },
    country:{
        type: String,
        required : true
    },
    contactNumber:{
        type: String,
        required : true
    },
    articles : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    drafts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Draft'
    }]
    

});


module.exports = mongoose.model('Reporter', reporterSchema);