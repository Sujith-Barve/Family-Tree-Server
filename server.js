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

const userdat = (req, res, err, callback) => {
    var usr_dat = req.body;
    User.findOne({Name:usr_dat.MotherName},function(err,result)
    {
        fatherval_id=result.Husband
        Motherval_id=result._id
    })

    User.findOne({ Name: usr_dat.Name }, function (err, Name) {
        if (Name == null) {
            const users = new User(
                {
                    Name: req.body.Name,
                    FatherName: fatherval_id,
                    MotherName:  Motherval_id,
                    Gender: req.body.Gender,
                })
            users.save()
            // res.sendStatus(200)
            res.send(JSON.stringify(users))
            console.log("Ok");
            console.error(err);
        }
        else {
            // res.sendStatus(403)
            console.log("user exists")
        }
    }

    )
}
const fatherdat = (req, res, err) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.FatherName }, function (err, Name) {
        if (Name == null && (usr_dat.Gender == "Male")) {
            const users = new User(
                {
                    Name: req.body.FatherName,
                    Gender: "Male",
                    // Son: req.body.Name,
                    // Wife: req.body.MotherName,
                })
            users.save()
            // res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
            motherdat(req, res)
        }
        else if (Name == null && (usr_dat.Gender == "Female")) {
            const users = new User(
                {
                    Name: req.body.FatherName,
                    Gender: "Male",
                    // Daughter: req.body.Name,
                    // Wife: req.body.MotherName,
                })
            users.save()
            // res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
            motherdat(req, res)
        }

        else {
            motherdat(req, res)
            // userdat(req, res);
        }
    })
}
const motherdat = (req, res, err) => {
    var usr_dat = req.body;
    var father_id;
    User.findOne({Name:usr_dat.FatherName},function (err, result)
        {
            father_id = result._id
        }   
    )
    User.findOne({ Name: usr_dat.MotherName }, function (err, Name) {
        if (Name == null && (usr_dat.Gender == "Male")) {
            const users = new User(
                {
                    Name: req.body.MotherName,
                    Gender: "Female",
                    Husband :father_id
                    // Son: req.body.Name,

                })
            users.save()
            userdat(req, res);
            // res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
        }
        else if (Name == null && (usr_dat.Gender == "Female")) {
            const users = new User(
                {
                    Name: req.body.MotherName,
                    Gender: "Female",
                    // Daughter: req.body.Name,
                    Husband: father_id,
                })
            users.save()    
            userdat(req, res);
            // res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
        }

        else {
            userdat(req, res);
        }
    })
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