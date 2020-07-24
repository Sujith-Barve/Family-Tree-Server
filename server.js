const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('./User')

app.use(bodyParser.json())

const User = mongoose.model("user")

const mongoUri = "mongodb+srv://mine:JEv0wujKC7DOzuss@cluster0.byzsb.mongodb.net/<dbname>?retryWrites=true&w=majority"

mongoose.connect(mongoUri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.on("connected",()=>{
    console.log("connected to mongo yeahhh")
})
mongoose.connection.on("error",(err)=>{
    console.log("error",err)
})

// app.get('/',(req,res)=>{
//     User.find({}).then(data=>{
//         res.send(data)
//     }).catch(err=>{
//         console.log(err)
//     })
// })


app.post('/send-data',(req,res)=>{
    console.log(req);
    const users = new User({
        Name:req.body.Name,
    FatherName : req.body.FatherName,
    MotherName : req.body.MotherName,
    })
    users.save()
    .then(data=>{
        console.log(data)
        res.send(data)
    }).catch(err=>{
        console.log(err)
    })
    
})
app.post('/delete',(req,res)=>{
    User.findByIdAndRemove(req.body.id)
    .then(data=>{
        console.log(data)
        res.send(data)
    })
    .catch(err=>{
        console.log(err)
    })
})
app.post('/update',(req,res)=>{
    User.findByIdAndUpdate(req.body.id,{
        Name:req.body.Name,
        FatherName : req.body.FatherName,
        MotherName : req.body.MotherName,
    }).then(data=>{
        console.log(data)
        res.send(data)
    })
    .catch(err=>{
        console.log(err)
    })
})


    app.listen(3000,()=>{
    console.log("server running")
})