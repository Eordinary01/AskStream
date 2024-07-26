const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    isCreator:{
        type:Boolean,
        default:false
    },
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }]

});

module.exports = mongoose.model('User',userSchema);