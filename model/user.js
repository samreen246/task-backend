const mongoose = require ('mongoose')
const {ObjectId} = mongoose.Schema.Types

const User = mongoose.Schema({
    image:{
        type:String,
        required:false
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    followers: [{ type:String, ref: 'User' }],
    following: [{ type:String, ref: 'User' }],
})

module.exports = mongoose.model('User',User)