const express = require('express'); //importing module from dependencies using require
const app = express();//used to configure server
const path = require('path'); //path module to manipulate file paths
const fs = require('fs'); //module for files
const mongoose = require('mongoose');

//url for db
const dbURL = 'mongodb+srv://mijz:3e74i5ZMp5PzNrWk@cluster1.1szi2ht.mongodb.net/?retryWrites=true&w=majority';
//connecting to db
mongoose.connect(dbURL, {
    useNewUrlParser: true,
})
const db = mongoose.connection;
    db.on('error',(error)=> {console.error(error)})
    db.once('open', ()=> console.log("Connected"))


//importing HeroList schema
const {HeroList} = require("../models/model");
const {User} =  require("../models/model");

const port = process.env.PORT || 5000;
const router = express.Router(); //route object
const routerUser = express.Router(); //route object



//defining path
const joinedPath = path.join(__dirname, '../superhero-search/src');

//setup serving front-end code (middleware using use - middleware is when the server gets a request but before passed to route  )
app.use('/',express.static(joinedPath)); 

//parse data in body as json onto router object using middleware
app.use(express.json()); //no longer need json.parse in each req


//for html
// app.get('/',(req,res)=>{
//     res.sendFile('index.html', { root: joinedPath });
// });

//reading from json 
const filePathToInfo = "server/superheroes/superhero_info.json";
const filePathPowers = "server/superheroes/superhero_powers.json";

function isAlphabetical(input) {
    const regex = /^[\p{L} ]+$/u;
    return regex.test(input);
  }

  function isInteger(input) {
    const regex = /^\p{Nd}+$/u;
    return regex.test(input);
  }


routerUser.route('/user/find/:enteredEmail/:enteredPass')   //displays all lists
    .get(async (req, res) => {
        try {
            const eE = req.params.enteredEmail;
            const eP = req.params.enteredPass;
            console.log("hh")
            let emailCheck = await User.findOne({email: eE}); //finding user
            if(emailCheck){
               let passCheck = await User.findOne({password: eP});
               if(passCheck){
                    res.send(passCheck)
               }
               else {
                res.status(404).send("pass not found!")
               }
            }
            else{
                res.status(404).send("email not found!")
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    })


    routerUser.route('/user/create')//router to add a user
    .post(async (req, res) => {//creating an empty list
        if(isAlphabetical(req.body.username)){
            try {
                console.log("hi")
                let user = await User.findOne({username: req.body.username}); //finding user
                console.log(user);
                if (user) {
                    return res.status(400).send("This username exists, choose a new name!");
                }
                else if(req.body.username) {
                    console.log("in")
                    //If the user doesn't exist, create it and add 
                    user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                    });
                }
                const savedUser = await user.save();
                res.status(201).json(savedUser);    
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
            }
        }
        else{
           res.status(400).send("Invalid username. It must contain alphabetical characters only.");
        }
    })
    .get(async (req, res) => {//getting all the users created
        try {
            let user = await User.find({}, 'username email password isAdmin');
            if(user.length > 0){
                res.json(user)
            }
            else{
                res.status(404).send('No user found');
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    });


routerUser.route('/user/delete')//router to add a user
    .delete(async (req, res) => {
        if(isAlphabetical(req.body.username)){
            try {
                let user = await User.deleteOne({ username: req.body.username });
                if(user.deletedCount === 1){
                    // List deleted successfully
                    res.send(user)
                }
                else {
                    res.status(404).send("user not found!");
                }
            } catch (err) {
                res.status(400).send(`Bad request please check the format of the user  ${err}`)
            }
        }    
    });
routerUser.route('/user/changePass')//router to change a user's password
    .post(async (req, res) => {
        if(isAlphabetical(req.body.username)){
            try {
                let user = await User.findOne({username: req.body.username}); //finding list
                if (user) {
                    //If the user exist, change pass
                    user.password = req.body.password //changing old password to new password
                }
                else{//return error if the user doesnt exist
                    return res.status(400).send("This username doesn't exist, choose a new name!");
                }
                const savedUser = await user.save();
                res.status(201).json(savedUser);    
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
            }
        }
        else{
           res.status(400).send("Invalid username. It must contain alphabetical characters only.");
        }
    })




//installing the router
app.use('/api/superheroes',router);
//installing router for users
app.use('/api/users',routerUser);


//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
