const express = require ('express')
const mongoose = require ('mongoose')
require ('dotenv').config()
const app = express()
const verifyuser = require ('./middleware/verifyuser')
const cors = require('cors')
const port = process.env.PORT

mongoose.connect(process.env.MONGo_URI)
.then(connected=>console.log("connected to mongoDB"))
.catch(err=>console.log("cannot connect to mongoDB"))

app.use(cors())
app.use(express.json())
app.use(require('./routes/Auths'))

//TESTING MIDDLEWARE
app.post("/verify",verifyuser,(req,res)=>{
    res.json({user:req.user.email})
})

app.listen(port,()=>console.log("App is running on port",port))