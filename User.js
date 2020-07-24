const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema
({
    Name:String,
    FatherName : String,
    MotherName : String
});


mongoose.model("user",UserSchema)
