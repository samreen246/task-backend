require('dotenv').config()
const jwt = require ('jsonwebtoken') 

function verifyuser(req,res,next){
    const BearerToken = req.headers['authorization'] 
   
    if(BearerToken){
        const allData = BearerToken.split(" ")
        const FinalToken = allData[1] 
        jwt.verify(FinalToken,process.env.JWT_SECRET,(err,data)=>{
            if(err){
                res.json({error:"invalid token"})
            }
            else{
                req.user = data
                next()
            }
        })
    }
    else{
        res.json({error:"no token found"})
    }
    
}

module.exports = verifyuser