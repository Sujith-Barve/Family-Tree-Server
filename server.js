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
    User.find({ Gender: "Male" }).then(data => {
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

const userdat = (req, res, fatherId, motherId) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.Name }, function (err, Name) {
        if (Name == null)
        {
            if(usr_dat.Gender=="Male") {
                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                    })
                users.save(function (err) {
                    console.log("New user created: " + JSON.stringify(users))
                    User.findByIdAndUpdate(
                        { _id: fatherId },
                        { Wife: motherId, Son: users._id },
                        function(err, result) {
                          if (err) {
                           console.log("cant update father",err)
                          } else {
                            console.log("updated father");
                          }
                        }
                      );
                    User.findByIdAndUpdate(
                        {_id:motherId},
                        {Son:users._id},
                        function(err, result) {
                            if (err) {
                             console.log("cant update mother",err)
                            } else {
                              console.log("updated mother");
                            }
                          }
    
                    )
                })
                res.send(JSON.stringify(users))
                console.log("Ok");
                console.error(err);
            }
            else if(usr_dat.Gender=="Female")
            {
                const users = new User(
                    {
                        Name: req.body.Name,
                        FatherName: fatherId,
                        MotherName: motherId,
                        Gender: req.body.Gender,
                    })
                users.save(function (err) {
                    console.log("New user created: " + JSON.stringify(users))
                    User.findByIdAndUpdate(
                        { _id: fatherId },
                        { Wife: motherId, Daughter: users._id },
                        function(err, result) {
                          if (err) {
                           console.log("cant update father",err)
                          } else {
                            console.log("updated father");
                          }
                        }
                      );
                    User.findByIdAndUpdate(
                        {_id:motherId},
                        {Daughter:users._id},
                        function(err, result) {
                            if (err) {
                             console.log("cant update mother",err)
                            } else {
                              console.log("updated mother");
                            }
                          }
    
                    )
                })
                res.send(JSON.stringify(users))
                console.log("Ok");
                console.error(err);
            }
        } 
        else {
            console.log("user exists")
        }
    }

    )
}
const fatherdat = (req, res, err) => {
    var usr_dat = req.body;
    console.log("Manual Entry Of father is ",usr_dat.ManualEntryFather)
    if (usr_dat.ManualEntryFather == true && usr_dat.ManualEntryMother==true && usr_dat.Gender == "Male") {
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
    else if (usr_dat.ManualEntryFather == true && usr_dat.ManualEntryMother==true && (usr_dat.Gender == "Female")) {
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
    else if (usr_dat.ManualEntryFather == false && usr_dat.ManualEntryMother==true && (usr_dat.Gender == "Female")) {
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
        motherdat(req,res,req.Father_ID);
    }
    else if (usr_dat.ManualEntryFather== false && usr_dat.ManualEntryMother==false)
    {
        userdat(req, res)
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
    
        if (usr_dat.ManualEntryMother == true  && (usr_dat.Gender == "Male")) {
            const users = new User(
                {
                    Name: req.body.MotherName,
                    Gender: "Female",
                    Son: req.body.Name,
                    Husband: husbandId,
                }
            )
            users.save(function (err) {
                console.log("Mother ID: " + users._id)
                userdat(req, res,husbandId,users._id);
            })
        }
        else if (usr_dat.ManualEntryMother == true  && (usr_dat.Gender == "Female")) {
            const users = new User(
                {
                    Name: req.body.MotherName,
                    Gender: "Female",
                    Daughter: req.body.Name,
                    Husband: husbandId,
                }
            )
            users.save(function (err) {
                console.log("Mother ID: " + users._id)
                userdat(req, res,husbandId,users._id);
            })
        } 
        else if (
            usr_dat.ManualEntryMother == false 
            && usr_dat.ManualEntryFather==true  
            && (usr_dat.Gender == "Female")) {
                User.findByIdAndUpdate(
                    {_id:req.Mother_ID},
                    {Husband:husbandId},
                    function(err, result) {
                        if (err) {
                         console.log("cant update mother",err)
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