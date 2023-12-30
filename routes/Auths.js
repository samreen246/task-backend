const router = require ('express').Router()
const User = require ('../model/user')
const jwt =require ('jsonwebtoken')
const verify = require ('../middleware/verifyuser')

//SIGNUP ROUTE
router.post('/signup', (req, res) => {
    const { base64, username, email, password } = req.body;
  
    // Email validation regex
    const emailRegex = /^[^\s@]+@gmail\.com$/;
  
    if (!username || !email || !password) {
      res.json({ error: 'All fields are required' });
    } 
    else if (!emailRegex.test(email)) {
      res.json({ error: 'Invalid email address' });
    } 
    else {
      User.findOne({ username: username })
        .then((found) => {
          if (found) {
            res.json({ error: 'Username is already in use' });
          } else {
            const user = new User({
              image: base64,
              username: username,
              email: email,
              password: password,
            });
  
            user.save()
              .then((saved) => res.json({ success: 'User added' }))
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    }
});

//LOGIN ROUTE
router.post("/login",(req,res)=>{
    const{username,password}=req.body
    if(!username || !password){
        res.json({error:"All fields are required"})
    }
    else{
        User.findOne({username:username})
        .then(found=>{
            if(found){ 
                if(found.password==password){ 
                    const token = jwt.sign({username:found.username},process.env.JWT_SECRET) 
                    res.json({token:token})
                }
                else{
                    res.json({error:"invalid password"})
                }
            }
            else{
                res.json({error:"user not found"})
            }
        })
    }
})

//FETCHING LOGGED USER DATA
router.post("/details",verify,(req,res)=>{
    User.findOne({username:req.user.username})
    .then(found=>{
        if(found){
            res.json({user:found})
        }
        else{
            res.json({error:"not found"})
        }
    })
})

///SHOW ALL USER PROFILE
router.post('/getusers',verify,async(req,res)=>{
    try {
        // Assuming you have a middleware that sets the logged-in user in the request object (e.g., req.user)
        const loggedInUserId = req.user.username; 
        // Fetch all users except the logged-in user
        const users = await User.find({ username: { $ne: loggedInUserId } });
    
        res.json(users);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// //FOLLOW
router.post("/follow/:Username", verify, (req, res) => {
    const current = req.user.username;
    const { Username } = req.params;

    // Check if the user is already following or being followed
    User.findOne({
        $or: [
            { username: Username, followers: current },
            { username: current, following: Username }
        ]
    })
        .then(existingRelation => {
            if (existingRelation) {
                // User is already following or being followed, send a response accordingly
                return res.json({ error: "you already follow" });
            }

            // User is not already following, proceed with the update
            return Promise.all([
                User.updateOne({ username: Username }, { $push: { followers: current } }),
                User.updateOne({ username: current }, { $push: { following: Username } })
            ]);
        })
        .then(() => res.json({ success: "added to your following" }))
        .catch(err => console.log(err));
});

// Unfollow
router.post("/unfollow/:Username", verify, (req, res) => {
    const current = req.user.username;
    const { Username } = req.params;

    // Check if the user is already following or being followed
    User.findOne({
        $or: [
            { username: Username, followers: current },
            { username: current, following: Username }
        ]
    })
    .then(existingRelation => {
        if (existingRelation) {
            // Use updateMany to update both users in a single query
            return User.updateMany(
                { username: { $in: [Username, current] } },
                { $pull: { followers: current, following: Username } }
            );
        } else {
            // If there is no relationship, return an error response
            return res.json({ error: "you already don't follow" });
        }
    })
    .then(() => res.json({ success: "removed from your following" }))
    .catch(err => console.log(err));
});


module.exports = router