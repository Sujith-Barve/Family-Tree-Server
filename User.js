const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema
({
    Name:String,
    FatherName : String,
    MotherName : String,
    Son :[String],
    Wife : [String],
    Husband : String,
    Gender : String,
    Daughter : [String],
    ManualEntryFather : Boolean,
    ManualEntryMother :Boolean,
    MarriageStatus : String,
    WifeName : [{ type: String, unique: true }],
    ChildName : String,
    ChildGender :String,
    Father_ID: String,
    Mother_ID : String,
    Siblings :[String]

});


mongoose.model("user",UserSchema)
