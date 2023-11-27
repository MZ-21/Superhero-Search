require('dotenv').config()

const express = require('express'); //importing module from dependencies using require
const app = express();//used to configure server
const path = require('path'); //path module to manipulate file paths
const fs = require('fs'); //module for files
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");


//url for db
const dbURL = 'mongodb+srv://mijz:3e74i5ZMp5PzNrWk@cluster1.1szi2ht.mongodb.net/?retryWrites=true&w=majority';
//const nev = require('email-verification')(mongoose);//email verification
//importing HeroList schema
const {HeroList} = require("../models/model");
const {User} =  require("../models/model");
const {tempUser} = require("../models/tempModel")//verification

//connecting to db
mongoose.connect(dbURL, {
    useNewUrlParser: true,
})
const db = mongoose.connection;
    db.on('error',(error)=> {console.error(error)})
    db.once('open', ()=> console.log("Connected"))
//     const collection = db.collection(User.collection.name)

//     collection.indexes(function (err,indexes){
//         if(err){
//             console.error(err);
//         }
//         else {
//             console.log(indexes)
//         }
//     })
//     collection.dropIndex('username_1', function (err, result) {
//         if (err) {
//           console.error(err);
//         } else {
//           console.log(result);
//         }
//         // Close the Mongoose connection
//   mongoose.connection.close();
// });

//configuring options 
// nev.configure({
//     verificationURL: `http://localhost:3000/api/users/email-verification/${URL}`,
//     URLLength: 48,
//     persistentUserModel: User,
//     tempUserModel: nev.generateTempUserModel(User),
//     tempUserCollection: 'temporary_users',
//     emailFieldName: 'email',
//     passwordFieldName: 'password',
//     URLFieldName: 'GENERATED_VERIFYING_URL',
//     expirationTime: 86400,
//     transportOptions: {
//         service: 'Gmail',
//         auth: {
//             user: process.env.VERIFICATION_EMAIL,
//             pass: process.env.VERIFICATION_EMAIL_PASSWORD,
//         }
//     },
//     verifyMailOptions: {
//         from: `Do Not Reply <do_not_reply@gmail.com>`,
//         subject: 'Please confirm account',
//         html: `Click the following link to confirm your account:</p><p>${URL}</p>`,
//         text: `Please confirm your account by clicking the following link: ${URL}`
//     }
// }, function(error, options){
//     if(error){
//         console.log('tempUserCollection:', options.tempUserCollection);

//         console.log(error +" errrr")
//         return callback(null,null);
//     }
//     console.log('configured' + (typeof options === 'object'))
// });

const port = process.env.PORT || 5000;
const router = express.Router(); //route object
const routerUser = express.Router(); //route object
const routerVerify = express.Router();



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
    const regex = /^[a-zA-Z ]*$/;
    return regex.test(input);
  }

  function isInteger(input) {
    const regex = /^\p{Nd}+$/u;
    return regex.test(input);
  }

  
//email handler 
const nodemailer = require('nodemailer');

//unique string
const {v4: uuidv4} = require('uuid');//need uuid v4
const { resourceUsage } = require('process');

//nodemailer
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
            user: process.env.VERIFICATION_EMAIL,
            pass: process.env.VERIFICATION_EMAIL_PASSWORD,
          }
})
//testing success
transporter.verify((err,success)=>{
    if(err){
        console.log(err)
    } else {
        console.log("Ready for message!")
        console.log(success)
    }
})


//verification email
const sendVerificationEmail = ({_id, email},res) =>{
    //url to be used in the email
    const currentUrl = "http://localhost:5000/";
    const uniqueString = uuidv4() + _id;

    //mail
    const mailOptions = {
        from: process.env.VERIFICATION_EMAIL,
        to: email,
        subject: "Verification email",
        html: `<p>Verify your email address to complete account creation.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=
        ${currentUrl + "user/verify/" + _id + "/" + uniqueString
        }>here</a>to proceed</p>`,
    }
    console.log(currentUrl)
    //hash the uniqueString
    const saltRounds = 10;
    bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedString)=>{
        //set values in userVerification collection
        const newVerification = new tempUser({
            userId: _id,
            uniqueString: hashedString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000, //expires 6 hours from now
        })
        newVerification
        .save()
        .then(()=>{
            transporter
            .sendMail(mailOptions)
            .then(()=>{
                //email sent and verification saved
                res.json({
                    status: "PENDING",
                    message: "Verification email sent!"
                })
            })
            .catch((error)=>{
                console.log(error)
                res.json({
                    status: "FAILED",
                    message: "Verification email failed!"
                })
            })
        })
        .catch((err)=>{
            console.log(err)
            res.json({
                status: "FAILED",
                message: "Error while saving verification data!"
            })
        })
    })
    .catch((error)=>{
        console.log(error)
        res.json({
            status: "FAILED",
            message: "Error while hashing email!"
        })
    })

}
/************************user**************************/

function authenticateToken(req,res,next){
    //header
    const authHeader = req.headers['authorization'];//getting token which is in headers
    const token = authHeader && authHeader.split(' ')[1];//if have authHeader, get token
    if(token == null){
        return res.sendStatus(401);//Web Dev Simplified JWT Authentication
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
        if(err) return res.sendStatus(403);
        req.user = user
        next()
    })

}

routerUser.route('/user/find')   
    .post((req, res) => {
        let {email,password} = req.body;
        email = email.trim();
        password = password.trim();

        if(email == "" || password == ""){
            res.json({
                status: "FAILED",
                message: "Fields are empty!"
            });
        }
        else {
            User.find({email})
            .then(data =>{
                if(data.length){
                    //check if user is verified
                    if(!data[0].verified){
                        res.json({
                            status: "Failed!",
                            message: "Email has not been verified!",
                        })
                    }else{
                        const hashedPassword = data[0].password;
                        bcrypt//password hashed, need to compare to stored hashedPassword
                        .compare(password, hashedPassword)
                        .then(reslt =>{
                            if(reslt){
                                // //jwt
                                // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                                // res.send({accessToken: accessToken})

                                res.json({
                                        status: "SUCCESS!",
                                        message: "Login success",
                                        data:data,
                                })
                            }else{
                                res.json({
                                    status: "Failed!",
                                    message: "Invalid Password!",
                                })
                            }
                        })

                    }
                }
            })
        }
        // try {
        //     const eE = req.body.email;
        //     const eP = req.body.password;
        //     console.log("hh")
        //     let userEmailCheck = await User.findOne({email: eE}); //finding user
        //     if(userEmailCheck){
        //        let userPassCheck = await User.findOne({password: eP});
        //        if(userPassCheck){

        //             //check if user is verified
        //             if(!userPassCheck.verified){
        //                 return res.json({
        //                     status: "Failed!",
        //                     message: "Email has not been verified!",
        //                 })

        //             }
        //             //res.send(userPassCheck)
        //             const user = {email: userPassCheck.email}
        //             //jwt
        //             const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        //             res.send({accessToken: accessToken})
        //        }
        //        else {
        //         res.status(404).send("pass not found!")
        //        }
        //     }
        //     else{
        //         res.status(404).send("email not found!")
        //     }
        // } catch (error) {
        //     res.status(500).send("Internal Server Error" + error);
        // }
    })
/******************************Lists******************88*/
    router.route('/publisher')
    .get((req,res)=>{
        fs.readFile(filePathToInfo, 'utf-8', (err,heroData)=>{
            try {
                if(err){
                    console.log(err);
                }
                else{
                    var parseHeroes = JSON.parse(heroData);
                    const publishers = []
                    console.log(parseHeroes)
                    for(let h of parseHeroes){
                        if(!publishers.includes(h.Publisher) && h.Publisher!=""){
                            publishers.push(h.Publisher);
                        }
                    }
                    if(publishers.length > 0 ){
                        res.send(publishers);
                    }
                }
            }
            catch (error){
                res.status(500).send(`server unable to fulfill request!`);
            } 
        })
    });
    router.route("/heroes/list/create")
    .post(authenticateToken,async (req, res) => {//creating an empty list
        if(isAlphabetical(req.body.listN)){
            try {
                let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                if (list) {
                    return res.status(400).send("This list exists, choose a new name!");
                }
                else if(req.body.listN) {
                    // If the list doesn't exist, create it and add the superheroes
                    list = new HeroList({
                    listN: req.body.listN,
                    createdBy: req.body.createdBy,//who created the list
                    isPrivate: req.body.isPrivate,
                    superhero: [] // Assuming superheroes is an array of superhero objects
                    });
                }
                const savedList = await list.save();
                res.status(201).json(savedList);    
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
            }
        }
        else{
            res.status(400).send("Invalid list name. It must contain alphabetical characters only.");
        }
    });

    
    routerUser.route('/user/find/:enteredEmail')   //displays all lists
    .get(async (req, res) => {
        try {
            const eE = req.params.enteredEmail;
            let emailCheck = await User.findOne({email: eE}); //finding user
            if(emailCheck){
                console.log("email found")
                res.status(false);
            }
            else{
                console.log("huh")
                res.send(true)
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    })


//routerUser.route('/email-verification/:token')//router to add a user
// .post(async (req, res) => {//creating an empty list
//     try {
//       var url = req.params.token;
//       nev.confirmTempUser(url, function(err, user) {
//             if(err){console.log(err + "After verification")}

//             if(user){
//                 //found user
//                 nev.nev.sendConfirmationEmail(user['email_field_name'], function(err, info) {
//                     // redirect to their profile...
//                     console.log(info)
//                 });
//             }
//             else{
//                 console.log("Expired token")
//             }
//       })
//     } catch (err) {
//         res.status(400).send(`Bad request ${err}`)
//     }
// })


    routerUser.route('/user/create')//router to add a user
        .post(async (req, res) => {//creating an empty list
            try {
                let {username, email, password} = req.body;
                username.trim();
                email.trim();
                password.trim();

                if(username == "" || email == "" || password == ""){
                    res.json({
                        status: "FAILED",
                        message: "Empty input fields!"
                    })
                }
                else if(!/^[a-zA-Z ]*$/.test(username)){
                    res.json({
                        status: "FAILED",
                        message: "Invalid name entered!"
                    })
                }
                else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
                    res.json({
                        status: "FAILED",
                        message: "Invalid email entered!"
                    })
                }

                else {
                    User.find({email}).then(result => {
                        if(res.length){
                            res.json({
                                status: "FAILED",
                                message: "User exists!"
                            })
                        }
                        else {
                            //creating new user

                            //password hashing
                            const saltRounds = 10
                            bcrypt.hash(password, saltRounds).then(hashP => {
                               const user = new User({//creating user using chema
                                                    username,
                                                    email,
                                                    password: hashP,
                                                    verified: false,
                                                    });
                                user.save().then(result =>{//saving user
                                    //handle account verification
                                    sendVerificationEmail(result, res);
                                })
                                .catch(err => {
                                    res.json({
                                        status: "FAILED",
                                        message: "User creation failed!"
                                    })
                                })//error msg
                            })
                            .catch(error => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occured while hashing password!"
                                })
                            })
                        }

                    }).catch(err => {
                        console.log(err);
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while checking for existing user!"
                        })
                    })
                    // let user = await User.findOne({email: email}); //finding user

                    // if (user) {
                    //     return res.status(400).send("This email exists, choose a new name!");
                    // }
                    // else if(email) {
                    
                    //     //If the user doesn't exist, create it and add 
                    //     user = new User({
                    //     username: req.body.username,
                    //     email: req.body.email,
                    //     password: req.body.password
                    //     });
                    // }
                    // const savedUser = await user.save();
                    // res.status(201).json(savedUser);    
                }
               
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
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


    routerVerify.route('/verify/:userId/:uniqueString')//router to add a user
        .get((req, res) => {//creating an empty list
            console.log("in")
                let {userId, uniqueString} = req.params;
                userId.trim();
                uniqueString.trim();
                tempUser
                .find({userId})
                .then((result)=>{
                    //result is an array, check if empty
                    if(result && result.length > 0){
                        //user verification record exists 
                        //check if expired
                        const { expiresAt } = result[0]; 
                        const  hashedString  = result[0].uniqueString;
                        if(expiresAt < Date.now()){
                            //handle expired by deleting
                            tempUser.deleteOne({userId})
                            .then( result => {
                                User.deleteOne({_id: userId})//deleting user since they didnt verify before it expired
                                .then(()=>{
                                    let msg = "Link expired and you need to re-sign up";
                                    res.redirect(`/user/verified/error=true&message=${msg}`);
                                })
                                .catch(err =>{
                                    console.log(err)
                                    let msg = "Clearing user due to expiration failed!";
                                    res.redirect(`/user/verified/error=true&message=${msg}`);
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                let msg = "An error occurred while removing expired user verification";
                                res.redirect(`/user/verified/error=true&message=${msg}`);
                            })
                        }
                        else{
                            //valid verification, so validate user
                            //check if values in link havent been altered
                            bcrypt
                            .compare(uniqueString, hashedString)//comparing the string in the url to the hashedstring to see if it was the previously hashedstring
                            .then(function(result){
                                if(result){//ifstrings match
                                    //updating user record to verified = true
                                    User.updateOne({_id: userId}, {verified: true})
                                    .then(()=>{
                                        tempUser.deleteOne({_id: userId}, {verified: true})//deleting the temporary user since theyre verified
                                        .then(()=>{
                                            res.sendFile(path.join(__dirname,"/views/verified.html"));
                                        })
                                        .catch(err=>{
                                            console.log(err);
                                            let msg = "An error occurred while removing verification record";
                                            res.redirect(`/user/verified/error=true&message=${msg}`);
                                        })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        let msg = "An error occurred while updating user record to verified";
                                        res.redirect(`/user/verified/error=true&message=${msg}`);
                                    })

                                } //result is boolean
                                else {
                                    //details of link not correct
                                    let msg = "Invalid verification details. Check your link.";
                                    res.redirect(`/user/verified/error=true&message=${msg}`);
                                }
                            })
                            .catch(error => {
                                console.log(error +" this error for unique strings")
                                let msg = "An error occurred while comparing unique strings. ";
                                res.redirect(`/user/verified/error=true&message=${msg}`);
                            })

                        }

                    } else {
                        //user verification DNE
                        console.log(__dirname)
                        let msg = "Account record doesnt exist or has been verified";
                        res.redirect(`/user/verified/error=true&message=${msg}`);

                    }
                })
                .catch((err)=>{
                    console.log(err);
                    let msg = "An error occurred while checking for existing user verification email";
                    res.redirect(`/user/verified/error=true&message=${msg}`);
                })
                
        })
    //router for verified page
    routerVerify.route('/verified')
    .get((req, res) => {
           res.sendFile(path.join(__dirname,"/views"))
           
    })


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
app.use('/user',routerVerify);


//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
