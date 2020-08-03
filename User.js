const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema
({
    Name:String,
    FatherName : String,
    MotherName : String,
    Son :String,
    Wife : String,
    Husband : String,
    Gender : String,
    Daughter : String,
});


mongoose.model("user",UserSchema)
