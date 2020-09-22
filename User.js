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
        Husband: [String],
        Gender: String,
        Daughter: [String],
        ManualEntryFather: Boolean,
        ManualEntryMother: Boolean,
        ManualEntrySpouse: Boolean,
        MarriageStatus: String,
        // WifeName: [String],
        // ChildrenName: [String],
        ChildGender: String,
        Father_ID: String,
        Mother_ID: String,
        Spouse_ID: String,
        Siblings: [String],
        ChildGender: String,
        Havingchildren: String,
        Havingsibling: String



    });


mongoose.model("user", UserSchema)
