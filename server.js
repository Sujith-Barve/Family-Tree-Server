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
    console.log(req);
    fatherdat(req,res);
    motherdat(req,res)

})
const userdat = (req, res,err,callback) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.Name }, function (err, existinguser) {
        if (existinguser == null) {
            const users = new User(
                {
                    Name: req.body.Name,
                    FatherName: req.body.FatherName,
                    MotherName: req.body.MotherName,
                    Gender : req.body.Gender,
                })
            users.save()
            // res.sendStatus(200)
            res.send(JSON.stringify(users))
            console.log("Ok");
            console.error(err);
        }
        else {
            res.sendStatus(403)
            console.log("user exists")
        }
    }

    )
}
const fatherdat = (req, res,err) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.FatherName }, function (err, existinguser) {
        if(existinguser == null && (usr_dat.Gender=="Male")) {
            const users = new User(
                {
                    Name: req.body.FatherName, 
                    Son: req.body.Name,
                    Wife: req.body.MotherName,
                })
            users.save()
            res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
            motherdat(req,res)
        }
        else if(existinguser == null && (usr_dat.Gender=="Female"))
       {
        const users = new User(
            {
                Name: req.body.FatherName, 
                Daughter: req.body.Name,
                Wife: req.body.MotherName,
            })
        users.save()
        res.send(JSON.stringify(users))
        // res.sendStatus(200)
        console.log("Ok");
        console.error(err)
        motherdat(req,res)
    }

        else {
            motherdat(req,res)
            // userdat(req, res);
        }
    })
}
const motherdat = (req, res,err) => {
    var usr_dat = req.body;
    User.findOne({ Name: usr_dat.MotherName }, function (err, existinguser) {
        if(existinguser == null && (usr_dat.Gender=="Male")) {
            const users = new User(
                {
                    Name: req.body.FatherName, 
                    Son: req.body.Name,
                    Wife: req.body.MotherName,
                })
            users.save()
            res.send(JSON.stringify(users))
            // res.sendStatus(200)
            console.log("Ok");
            console.error(err)
        }
        else if(existinguser == null && (usr_dat.Gender=="Female"))
       {
        const users = new User(
            {
                Name: req.body.FatherName, 
                Daughter: req.body.Name,
                Wife: req.body.MotherName,
            })
        users.save()
        res.send(JSON.stringify(users))
        // res.sendStatus(200)
        console.log("Ok");
        console.error(err)
    }

        // else {
        //     userdat(req, res);
        // }
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
app.post('/update', (req, res) => {
    User.findByIdAndUpdate(req.body.id, {
        Name: req.body.Name,
        FatherName: req.body.FatherName,
        MotherName: req.body.MotherName,
    }).then(data => {
        console.log(data)
        res.send(data)
    })
        .catch(err => {
            console.log(err)
        })
})


app.listen(3000, () => {
    console.log("server running")
})