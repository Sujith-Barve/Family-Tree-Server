const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('./User')

app.use(bodyParser.json())

const User = mongoose.model("user")

const mongoUri = process.env.Mongo_uri;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
    console.log("connected to mongo yeahhh")
})
mongoose.connection.on("error", (err) => {
    console.log("error", err)
})


app.post('/create-person', (req, res) => {
    // console.log(req);
    // userdat(req,res);
    // console.log("Siblings are added " + JSON.stringify(req))
    fatherdat(req, res);
    // motherdat(req,res)
})

// app.get('/getfatherdata',(req,res)=>{
//     User.find().then(fatherdata=>{
//         res.send(fatherdata)
//         console.log(fatherdata)    
//     }).catch(err=>{
//         console.log(err)
//     })   
// })
app.get('/getfatherdata', (req, res) => {
    Age = req.query.Age
    User.find({
        // $and: [
        Gender: "Male"
        // { Age: { $gte: (Age + 10) } }
        // ]
    })
        .then(data => {
            res.send(data)
            // res.send(data.id)
            console.log(data)

        }).catch(err => {
            console.log(err)
        })
})
app.get('/getMotherdata', (req, res) => {
    User.find({ Gender: "Female" }).then(data => {
        res.send(data)
        // res.send(data.id)
        console.log(data)
    }).catch(err => {
        console.log(err)
    })
})
app.get('/getname', async (req, res) => {
    User.find({ _id: req.query.Personid }).select('Name -_id')
        .then(data => {
            // res.send(data.id)
            console.log(data[0])
        }).catch(err => {
            console.log(err)
        })
})

async function IdToName(Id) {
    console.log("Entered to Id to Name");
    return User.find({ _id: Id }).select('Name').exec()
        .then(data => {
            console.log(data)
            return data[0]
        }).catch(err => {
            console.log(err);
        })


}

app.get('/familysuggestion', (req, res) => {
    console.log("Entered Family Suggestion and App_User_ID is " + req.query.App_userID)
    User.find({ App_userID: req.query.App_userID }).then(data => {
        res.send(data)
        console.log("Response data is ", data)
    }).catch(err => {
        console.log(err);
    })
})
var arr = [];
app.get('/familysuggestionfetching', (req, res) => {
    console.log("Entered Family Suggestion and Key is " + req.query.familysearchid)
    User.find({ _id: req.query.familysearchid })
        .then(async data => {
            console.log("Fetch data is", data)
            var _father = await IdToName(data[0].FatherName)
            var _mother = await IdToName(data[0].MotherName)
            var _user = { _id: req.query.familysearchid, Name: data[0].Name }

            var responsearray = {
                Name: _user,
                FatherData: _father,
                MotherData: _mother
            };
            // arr.push(
            //     {

            //     } 
            // )
            res.send(responsearray)
            console.log("data sent is  ", responsearray)
        })
        .catch(err => {
            console.log(err);
        })
})


// IdToName('5f5886df47f6a64c8a9e43e3')




const userdat = (req, res, fatherId, motherId) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.Name }, function (err, Name) {
        if (Name == null) {
            if (usr_dat.Gender == "Male") {
                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                        App_UserID: req.body.App_UserID,
                    })
                users.save(function (err) {
                    //For Siblings
                    console.log("Entered User Creation")
                    for (var i = 0; i < req.body.Siblings.length - 1; i++) {
                        console.log("SiblinG Length is " + req.body.Siblings.length)
                        const sibling = new User(
                            {
                                Name: req.body.Siblings[i],
                                FatherName: fatherId,
                                MotherName: motherId,


                            })
                        sibling.save(() => {
                            console.log("Entered Sibling Data" + req.body.Siblings[i])
                            User.findByIdAndUpdate(
                                { _id: fatherId },
                                { $push: { Son: users._id } },
                                function (err, result) {
                                    if (err) {
                                        console.log("cant update father", err)
                                    } else {
                                        console.log("updated father");
                                    }
                                }
                            );
                            User.findByIdAndUpdate(
                                { _id: motherId },
                                { $push: { Son: users._id } },
                                function (err, result) {
                                    if (err) {
                                        console.log("cant update mother", err)
                                    } else {
                                        console.log("updated mother");
                                    }
                                }
                            )



                        })

                    }

                    // For Users
                    // console.log("Appuser ID" + req.body.App_UserID)
                    console.log("New user created: " + JSON.stringify(users))
                    User.findByIdAndUpdate(
                        { _id: fatherId },
                        { $push: { Wife: motherId, Son: users._id } },
                        function (err, result) {
                            if (err) {
                                console.log("cant update father", err)
                            } else {
                                console.log("updated father");
                            }
                        }
                    );
                    User.findByIdAndUpdate(
                        { _id: motherId },
                        { $push: { Son: users._id } },
                        function (err, result) {
                            if (err) {
                                console.log("cant update mother", err)
                            } else {
                                console.log("updated mother");
                            }
                        }
                    )
                    User.findByIdAndUpdate(
                        {
                            _id: users._id
                        },
                        {
                            $push: {
                                Siblings: () => {
                                    User.find({ _id: fatherId }).select('Son')
                                        .then(data => {
                                            Siblings.$push(data)
                                        })
                                }
                            }
                        }
                    )
                    if (req.body.MarriageStatus == "Married") {
                        if (usr_dat.ManualEntrySpouse == true) {
                            User.findByIdAndUpdate(
                                {
                                    _id: users._id
                                },
                                {
                                    WifeName: req.body.WifeName,
                                })


                        }
                        else {
                            User.findByIdAndUpdate(
                                {
                                    _id: users._id
                                },
                                {
                                    WifeName: req.body.Spouse_ID,
                                })

                        }
                    }

                })
                res.send(JSON.stringify(users))
                console.log("Ok");
                console.error(err);
            }
            else if (usr_dat.Gender == "Female") {

                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                        App_UserID: req.body.App_UserID,
                    })
                users.save(function (err) {
                    //For Siblings
                    for (var i = 0; i < req.body.Siblings; i++) {
                        const sibling = new User(
                            {
                                Name: req.body.Siblings[i],
                                FatherName: fatherId,
                                MotherName: motherId,


                            })
                        sibling.save(() => {
                            User.findByIdAndUpdate(
                                { _id: fatherId },
                                { $push: { Son: users._id } },
                                function (err, result) {
                                    if (err) {
                                        console.log("cant update father", err)
                                    } else {
                                        console.log("updated father");
                                    }
                                }
                            );
                            User.findByIdAndUpdate(
                                { _id: motherId },
                                { $push: { Son: users._id } },
                                function (err, result) {
                                    if (err) {
                                        console.log("cant update mother", err)
                                    } else {
                                        console.log("updated mother");
                                    }
                                }
                            )



                        })
                        //For loop End
                    }


                    // For Users
                    // console.log("Appuser ID" + req.body.App_UserID)
                    console.log("New user created: " + JSON.stringify(users))
                    User.findByIdAndUpdate(
                        { _id: fatherId },
                        { $push: { Wife: motherId, Daughter: users._id } },
                        function (err, result) {
                            if (err) {
                                console.log("cant update father", err)
                            } else {
                                console.log("updated father");
                            }
                        }
                    );
                    User.findByIdAndUpdate(
                        { _id: motherId },
                        { $push: { Daughter: users._id } },
                        function (err, result) {
                            if (err) {
                                console.log("cant update mother", err)
                            } else {
                                console.log("updated mother");
                            }
                        }
                    )
                    User.findByIdAndUpdate(
                        {
                            _id: users._id
                        },
                        {
                            $push: {
                                Siblings: () => {
                                    //Here We are selecting SOn only Because Front End Sends the
                                    //Siblings as Male Only So...
                                    User.find({ _id: fatherId }).select('Son')
                                        .then(data => {
                                            Siblings.$push(data)
                                        })
                                }
                            }
                        }
                    )
                    if (req.body.MarriageStatus == "Married") {
                        if (usr_dat.ManualEntrySpouse == true) {
                            User.findByIdAndUpdate(
                                {
                                    _id: users._id
                                },
                                {
                                    Husband: req.body.WifeName,
                                })


                        }
                        else {
                            User.findByIdAndUpdate(
                                {
                                    _id: users._id
                                },
                                {
                                    Husband: req.body.Spouse_ID,
                                })

                        }
                    }

                })
                res.send(JSON.stringify(users))
                console.log("Ok");
                console.error(err);

            }
            else {
                console.log("user exists")
            }
        }

    })
}
const fatherdat = (req, res, err) => {
    var usr_dat = req.body;
    console.log("Manual Entry Of father is ", usr_dat.ManualEntryFather)
    if (usr_dat.ManualEntryFather == true && usr_dat.ManualEntryMother == true && usr_dat.Gender == "Male") {
        const users = new User(
            {
                Name: req.body.FatherName,
                Gender: "Male",
                // Son: req.body.Name,
                // Wife: req.body.MotherName,
            }
        )
        users.save(function (err) {
            console.log("FatherID: " + users._id)
            motherdat(req, res, users._id)
        })
    }
    else if (usr_dat.ManualEntryFather == true && usr_dat.ManualEntryMother == true && (usr_dat.Gender == "Female")) {
        const users = new User(
            {
                Name: req.body.FatherName,
                Gender: "Male",

            })
        users.save(function (err) {
            console.log("FatherID: " + users._id)
            motherdat(req, res, users._id)
        })
    }
    else if (usr_dat.ManualEntryFather == false && usr_dat.ManualEntryMother == true && (usr_dat.Gender == "Female")) {
        // User.findByIdAndUpdate(
        //     {_id:usr_dat.Father_ID},
        //     {},
        //     function(err, result) {
        //         if (err) {
        //          console.log("cant update mother",err)
        //         } else {
        //           console.log("updated mother");
        //         }
        //       } )
        motherdat(req, res, req.Father_ID);
    }
    else if (usr_dat.ManualEntryFather == false && usr_dat.ManualEntryMother == false) {
        console.log("req.body.Father_ID,req.body.Mother_ID" + req.body.Father_ID, req.body.Mother_ID)
        userdat(req, res, req.body.Father_ID, req.body.Mother_ID)

    }


    // else {
    //     motherdat(req, res)
    //     // userdat(req, res);
    // }

}

// User.findOne({ Name: usr_dat.FatherName }, function (err, Name) {
//     if (Name == null && (usr_dat.Gender == "Male")) {
//         const users = new User(
//             {
//                 Name: req.body.FatherName,
//                 Gender: "Male",
//                 Son: req.body.Name,
//                 Wife: req.body.MotherName,
//             })
//         users.save()
//         // res.send(JSON.stringify(users))
//         // res.sendStatus(200)
//         console.log("Ok");
//         console.error(err)
//         motherdat(req, res)
//     }

const motherdat = (req, res, husbandId) => {
    var usr_dat = req.body;

    if (usr_dat.ManualEntryMother == true && (usr_dat.Gender == "Male")) {
        const users = new User(
            {
                Name: req.body.MotherName,
                Gender: "Female",
                Husband: husbandId,
            }
        )
        users.save(function (err) {
            // console.log("Mother ID: " + users._id)
            userdat(req, res, husbandId, users._id);
        })
    }
    else if (usr_dat.ManualEntryMother == true && (usr_dat.Gender == "Female")) {
        const users = new User(
            {
                Name: req.body.MotherName,
                Gender: "Female",
                // Daughter: req.body.Name,
                Husband: husbandId,
            }
        )
        users.save(function (err) {
            // console.log("Mother ID: " + users._id)
            userdat(req, res, husbandId, users._id);
        })
    }
    else if (
        usr_dat.ManualEntryMother == false
        && usr_dat.ManualEntryFather == true
        && (usr_dat.Gender == "Female")) {
        User.findByIdAndUpdate(
            { _id: req.Mother_ID },
            { Husband: husbandId },
            function (err, result) {
                if (err) {
                    console.log("cant update mother", err)
                } else {
                    console.log("updated mother");
                }
            }

        )

    }

}


// const senddata = () => {
//     app.post('/send-data', (req, res) => {
//         console.log(req);
//         const users = new User({
//             Name: req.body.Name,
//             FatherName: req.body.FatherName,
//             MotherName: req.body.MotherName,
//         })
//         users.save()
//             .then(data => {
//                 console.log(data)
//                 res.send(data)
//             }).catch(err => {
//                 console.log(err)
//             })

//     })
// }
app.post('/delete', (req, res) => {
    User.findByIdAndRemove(req.body.id)
        .then(data => {
            console.log(data)
            res.send(data)
        })
        .catch(err => {
            console.log(err)
        })
})
// app.post('/update', (req, res) => {
//     User.findByIdAndUpdate(req.body.id, {
//         Name: req.body.Name,
//         FatherName: req.body.FatherName,
//         MotherName: req.body.MotherName,
//     }).then(data => {
//         console.log(data)
//         res.send(data)
//     })
//         .catch(err => {
//             console.log(err)
//         })
// })


app.listen(3000, () => {
    console.log("server running");
})