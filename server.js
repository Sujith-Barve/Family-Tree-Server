const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const CircularJSON = require('circular-json');
require('./User')
mongoose.set('useFindAndModify', false);
// mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

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
    var serialized = CircularJSON.stringify(req.body);
    console.log("Siblings are added " + serialized)
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
            // console.log(data)

        }).catch(err => {
            console.log(err)
        })
})
app.get('/getMotherdata', (req, res) => {
    User.find({ Gender: "Female" }).then(data => {
        res.send(data)
        // res.send(data.id)
        // console.log(data)
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
var sibling_array = [];
app.get('/familysuggestion', (req, res) => {
    console.log("Entered Family Suggestion and App_User_ID is " + req.query.App_userID)
    User.find({ App_userID: req.query.App_userID }).then(data => {
        res.send(data)
        // console.log("Response data is ", data)
    }).catch(err => {
        console.log(err);
    })
})
var arr = [];
var siblingdata = [];
var count = 0;
app.get('/familysuggestionfetching', (req, res) => {
    console.log("Entered Family Suggestion and Key is " + req.query.familysearchid)
    User.find({ _id: req.query.familysearchid })
        .then(async data => {
            console.log("Fetch data is", data)
            var _father = await IdToName(data[0].FatherName)
            var _mother = await IdToName(data[0].MotherName)
            var _user = { _id: req.query.familysearchid, Name: data[0].Name }
            var _Wife = await IdToName(data[0].Wife)

            // async function func() {
            //     for (var i = 0; i < Object.keys(data[0].Siblings).length; i++) {
            //         siblingdata = siblingdata.concat(IdToName(data.Siblings[i]))
            //     }

            // }
            await func();
            console.log("siblingdata is " + siblingdata)
            var responsearray = {
                Name: _user,
                FatherData: _father,
                MotherData: _mother,
                Wife: _Wife

            };
            // arr.push(
            //     {

            //     } 
            // )
            res.send(responsearray)
            // console.log("data sent is  ", responsearray)
        })
        .catch(err => {
            console.log(err);
        })
})

// IdToName('5f5886df47f6a64c8a9e43e3')
const userdat = (req, res, fatherId, motherId) => {
    var usr_dat = req.body;
    console.log("usr_dat.App_userID" + req.body.App_userID)
    User.findOne({ Name: usr_dat.Name }, function (err, Name) {
        if (Name == null) {
            if (usr_dat.Gender == "Male") {
                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                        App_userID: usr_dat.App_userID,
                    })
                users.save(function (err) {
                    //For Siblings
                    console.log("User ID : " + users + err)
                    console.log("Entered User Creation")
                    if (req.body.Havingsibling == "Yes") {
                        for (var i = 0; i < req.body.Siblings.length; i++) {
                            console.log("SiblinG Length is " + req.body.Siblings.length)
                            const sibling = new User(
                                {
                                    Name: req.body.Siblings[i],
                                    FatherName: fatherId,
                                    MotherName: motherId,


                                })

                            sibling.save(() => {
                                console.log("Entered Sibling" + "Users id is ", users._id)
                                User.findByIdAndUpdate(
                                    { _id: fatherId },
                                    { $push: { Son: sibling._id } },
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
                                    { $push: { Son: sibling._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update mother", err)
                                        } else {
                                            console.log("updated mother");
                                        }
                                    }
                                )
                                User.findByIdAndUpdate(
                                    { _id: users._id },
                                    { $push: { Siblings: sibling._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update User", err)
                                        } else {
                                            console.log("updated User");
                                        }
                                    }
                                )

                                User.findByIdAndUpdate(
                                    { _id: sibling._id },
                                    { $push: { Siblings: users._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update Sibling User", err)
                                        } else {
                                            console.log(" Sibling User Updated");
                                        }
                                    }
                                )
                                //  union = () =>                                                       //function of union
                                //     {
                                //         var array1 = [];                                           //array 1
                                //         var array2 =  [];                                 ///array 2
                                //         var result = [];                                             ///variable result
                                //         var obj = {};                                                /// variable obj
                                //         for (var i = 0; i < array1.length; i++)        //foor loop
                                //         {
                                //             obj[array1[i]] = true;
                                //         }
                                //         for (var j = 0; j < array2.length; j++)                  //foor loop            
                                //         {

                                //             obj[array2[j]] = true;
                                //         }

                                //         for (const x in obj) {

                                //             result.push(x);
                                //         }

                                //         return result;                                    //return result
                                //     }


                            })
                        }
                    }

                    // For Users
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
                    )
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
                    // User.findByIdAndUpdate(
                    //     {
                    //         _id: users._id
                    //     },
                    //     {
                    //         $push: {
                    //             Siblings: () => {
                    //                 User.find({ _id: fatherId }).select('Son')
                    //                     .then(data => {
                    //                         Siblings.$push(data)
                    //                     })
                    //             }
                    //         }
                    //     }
                    // )

                    if (req.body.MarriageStatus == "Married") {
                        if (usr_dat.ManualEntrySpouse == true) {
                            if (req.body.Wife != null) {
                                const creationspouse = new User(
                                    {
                                        Name: req.body.Wife,
                                        Husband: users._id

                                    })
                                creationspouse.save(() => {
                                    // console.log("Entered Sibling Data" + req.body.Siblings[i] + "Users id is ", users._id)
                                    User.findByIdAndUpdate(
                                        { _id: users._id },
                                        { $push: { Wife: creationspouse._id } },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update wife of user", err)
                                            } else {
                                                console.log("updated wife of user");
                                            }
                                        }
                                    );
                                    //Temporary Brackets
                                    //             })
                                    //         }
                                    //     }
                                    // }
                                    // Until Thisone

                                    if (req.body.Havingchildren == "Yes") {
                                        for (var i = 0; i < req.body.Son.length; i++) {

                                            const bodychildren = new User(
                                                {
                                                    Name: req.body.Son[i],


                                                })

                                            bodychildren.save(() => {
                                                console.log("Entered Sibling Data" + req.body.Son[i] + "Users id is ", users._id)
                                                User.findByIdAndUpdate(
                                                    { _id: users._id },
                                                    { $push: { Son: bodychildren._id } },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update father", err)
                                                        } else {
                                                            console.log("updated father");
                                                        }
                                                    }
                                                );
                                                User.findByIdAndUpdate(
                                                    { _id: bodychildren._id },
                                                    { $push: { FatherName: users._id }, MotherName: creationspouse._id },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update SOn data", err)
                                                        } else {
                                                            console.log("updated Son data");
                                                        }
                                                    }
                                                )
                                                User.findByIdAndUpdate(
                                                    { _id: creationspouse._id },
                                                    { $push: { Son: bodychildren.id }, },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update SOn data", err)
                                                        } else {
                                                            console.log("updated Son data");
                                                        }
                                                    }
                                                )



                                            })
                                        }
                                    }

                                })
                            }
                        }
                        else {

                            if (req.body.Havingchildren == "Yes") {
                                for (var i = 0; i < req.body.Son.length; i++) {

                                    const bodychildren = new User(
                                        {
                                            Name: req.body.Son[i],



                                        })
                                }
                                bodychildren.save(() => {
                                    console.log("Entered Sibling Data" + req.body.Son[i] + "Users id is ", users._id)
                                    User.findByIdAndUpdate(
                                        { _id: users._id },
                                        { $push: { Son: bodychildren._id }, Wife: req.body.Spouse_ID },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update father", err)
                                            } else {
                                                console.log("updated father");
                                            }
                                        }
                                    );
                                    User.findByIdAndUpdate(
                                        { _id: req.body.Son[i] },
                                        { $push: { FatherName: users._id }, MotherName: req.body.Spouse_ID },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update SOn data", err)
                                            } else {
                                                console.log("updated Son data");
                                            }
                                        }
                                    )
                                    User.findByIdAndUpdate(
                                        { _id: creationspouse._id },
                                        { $push: { Son: bodychildren.id }, },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update Son data", err)
                                            } else {
                                                console.log("updated Son data");
                                            }
                                        }
                                    )



                                })
                            }




                            // User.findByIdAndUpdate(
                            //     {
                            //         _id: users._id
                            //     },
                            //     {
                            //         Wife: req.body.Spouse_ID,
                            //     })

                        }

                    }
                    res.send(JSON.stringify(users))
                    console.log("Ok");
                    console.error("Error is ", err);

                })
            }
            /////// Female Start
            else if (usr_dat.Gender == "Female") {
                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                        App_userID: req.body.App_userID,
                    })
                users.save(function (err) {
                    //For Siblings
                    console.log("User ID : " + users + err)
                    console.log("Entered User Creation")
                    if (req.body.Havingsibling == "Yes") {
                        for (var i = 0; i < req.body.Siblings.length; i++) {
                            console.log("SiblinG Length is " + req.body.Siblings.length)
                            const sibling = new User(
                                {
                                    Name: req.body.Siblings[i],
                                    FatherName: fatherId,
                                    MotherName: motherId,


                                })

                            sibling.save(() => {
                                console.log("Entered Sibling" + "Users id is ", users._id)
                                User.findByIdAndUpdate(
                                    { _id: fatherId },
                                    { $push: { Son: sibling._id } },
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
                                    { $push: { Son: sibling._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update mother", err)
                                        } else {
                                            console.log("updated mother");
                                        }
                                    }
                                )
                                User.findByIdAndUpdate(
                                    { _id: users._id },
                                    { $push: { Siblings: sibling._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update User", err)
                                        } else {
                                            console.log("updated User");
                                        }
                                    }
                                )

                                User.findByIdAndUpdate(
                                    { _id: sibling._id },
                                    { $push: { Siblings: users._id } },
                                    function (err, result) {
                                        if (err) {
                                            console.log("cant update Sibling User", err)
                                        } else {
                                            console.log(" Sibling User Updated");
                                        }
                                    }
                                )




                            })

                        }
                    }

                    // For Users
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
                    )
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
                    // User.findByIdAndUpdate(
                    //     {
                    //         _id: users._id
                    //     },
                    //     {
                    //         $push: {
                    //             Siblings: () => {
                    //                 User.find({ _id: fatherId }).select('Son')
                    //                     .then(data => {
                    //                         Siblings.$push(data)
                    //                     })
                    //             }
                    //         }
                    //     }
                    // )

                    if (req.body.MarriageStatus == "Married") {
                        if (usr_dat.ManualEntrySpouse == true) {
                            if (req.body.Wife != null) {
                                const creationspouse = new User(
                                    {
                                        Name: req.body.Wife,
                                        Wife: users._id

                                    })
                                creationspouse.save(() => {
                                    // console.log("Entered Sibling Data" + req.body.Siblings[i] + "Users id is ", users._id)
                                    User.findByIdAndUpdate(
                                        { _id: users._id },
                                        { $push: { Husband: creationspouse._id } },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update wife of user", err)
                                            } else {
                                                console.log("updated wife of user");
                                            }
                                        }
                                    );
                                    //Temporary Brackets
                                    //             })
                                    //         }
                                    //     }
                                    // }
                                    // Until Thisone

                                    if (req.body.Havingchildren == "Yes") {
                                        for (var i = 0; i < req.body.Son.length; i++) {

                                            const bodychildren = new User(
                                                {
                                                    Name: req.body.Son[i],


                                                })

                                            bodychildren.save(() => {
                                                console.log("Entered Sibling Data" + req.body.Son[i] + "Users id is ", users._id)
                                                User.findByIdAndUpdate(
                                                    { _id: users._id },
                                                    { $push: { Son: bodychildren._id } },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update father", err)
                                                        } else {
                                                            console.log("updated father");
                                                        }
                                                    }
                                                );
                                                User.findByIdAndUpdate(
                                                    { _id: bodychildren._id },
                                                    { $push: { FatherName: creationspouse._id }, MotherName: users._id },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update SOn data", err)
                                                        } else {
                                                            console.log("updated Son data");
                                                        }
                                                    }
                                                )
                                                User.findByIdAndUpdate(
                                                    { _id: creationspouse._id },
                                                    { $push: { Son: bodychildren.id }, },
                                                    function (err, result) {
                                                        if (err) {
                                                            console.log("cant update SOn data", err)
                                                        } else {
                                                            console.log("updated Son data");
                                                        }
                                                    }
                                                )



                                            })
                                        }
                                    }

                                })
                            }
                        }
                        else {

                            if (req.body.Havingchildren == "Yes") {
                                for (var i = 0; i < req.body.Son.length; i++) {

                                    const bodychildren = new User(
                                        {
                                            Name: req.body.Son[i],



                                        })
                                }
                                bodychildren.save(() => {
                                    console.log("Entered Sibling Data" + req.body.Son[i] + "Users id is ", users._id)
                                    User.findByIdAndUpdate(
                                        { _id: users._id },
                                        { $push: { Son: bodychildren._id }, Husband: req.body.Spouse_ID },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update father", err)
                                            } else {
                                                console.log("updated father");
                                            }
                                        }
                                    );
                                    User.findByIdAndUpdate(
                                        { _id: req.body.Son[i] },
                                        { $push: { MotherName: users._id }, FatherName: req.body.Spouse_ID },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update SOn data", err)
                                            } else {
                                                console.log("updated Son data");
                                            }
                                        }
                                    )
                                    User.findByIdAndUpdate(
                                        { _id: creationspouse._id },
                                        { $push: { Son: bodychildren.id }, },
                                        function (err, result) {
                                            if (err) {
                                                console.log("cant update Son data", err)
                                            } else {
                                                console.log("updated Son data");
                                            }
                                        }
                                    )



                                })
                            }




                            // User.findByIdAndUpdate(
                            //     {
                            //         _id: users._id
                            //     },
                            //     {
                            //         Wife: req.body.Spouse_ID,
                            //     })

                        }

                    }
                    res.send(JSON.stringify(users))
                    console.log("Ok");
                    console.error("Error is ", err);

                })
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
            console.log("FatherID: " + users + err)
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

    console.log("MotherData entered" + husbandId)
    if (usr_dat.ManualEntryMother == true && (usr_dat.Gender == "Male")) {
        console.log("Entered Mother creation")
        const users = new User(
            {
                Name: req.body.MotherName,
                Gender: "Female",
                Husband: husbandId,
            }
        )
        users.save(function (err) {
            console.log("MotherID: " + users + err)

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