const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema
    ({
        App_userID: String,
        Name: String,
        Age: Number,
        FatherName: String,
        MotherName: String,
        Son: [String],
        Wife: [String],
        Husband: String,
        Gender: String,
        Daughter: [String],
        ManualEntryFather: Boolean,
        ManualEntryMother: Boolean,
        ManualEntrySpouse: Boolean,
        MarriageStatus: String,
        WifeName: [{ type: String, unique: true }],
        ChildName: String,
        ChildGender: String,
        Father_ID: String,
        Mother_ID: String,
        Spouse_ID: String,
        Siblings: [String],
        ChildGender: String,
        Havingchildren: String


    });


mongoose.model("user", UserSchema)
