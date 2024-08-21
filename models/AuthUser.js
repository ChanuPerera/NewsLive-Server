const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({

  userID:{
    type: String,
    required : true,
    unique: true,
  },
  roleType: {
    type: String,
    enum: ['reporter', 'reader'],
    required : true,
  },
  reporter:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reporter'
  },
  reader:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reader'
  }

    
});


module.exports = mongoose.model('AuthUser', authUserSchema);