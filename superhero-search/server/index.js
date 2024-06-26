const Fuse = require('fuse.js')
require('dotenv').config()
const express = require('express'); //importing module from dependencies using require
const app = express();//used to configure server
const path = require('path'); //path module to manipulate file paths
const fs = require('fs/promises'); //module for files
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

//url for db
const dbURL = 'mongodb+srv://mijz:3e74i5ZMp5PzNrWk@cluster1.1szi2ht.mongodb.net/?retryWrites=true&w=majority';
//const nev = require('email-verification')(mongoose);//email verification
//importing HeroList schema
const {HeroList, Policy} = require("../models/model");
const {User} =  require("../models/model");
const {ReviewList} =  require("../models/model");
const {tempUser} = require("../models/tempModel")//verification
// const {Policy} = require("../models/model")//

//connecting to db
mongoose.connect(dbURL, {
    useNewUrlParser: true,
})
const db = mongoose.connection;
    db.on('error',(error)=> {console.error(error)})
    db.once('open', async ()=>{ 
        console.log("Connected")
        // const collections = await mongoose.connection.db.listCollections().toArray();
        // //console.log(collections)
        // collections.forEach( async collection => {
        //     const indexes = await mongoose.connection.db.collection(collection.name).indexes();
        //     console.log('Indexes:', indexes);
           
        //     console.log(collection.name)});

        //     await ReviewList.collection.dropIndex({ email: 1 });
      
    })
    // Step 1: Check Existing Indexes
    



const port = process.env.PORT || 5000; //use 5000 or another port available
const router = express.Router(); //route object
const routerUser = express.Router(); //route object
const routerVerify = express.Router();//route for verifying



//defining path
const joinedPath = path.join(__dirname, '../superhero-search/src');

//setup serving front-end code (middleware using use - middleware is when the server gets a request but before passed to route  )
app.use('/',express.static(joinedPath)); 

//parse data in body as json onto router object using middleware
app.use(express.json()); //no longer need json.parse in each req


//reading from json 
const filePathToInfo = "superheroes/superhero_info.json"; //path to superhero file
const filePathPowers = "superheroes/superhero_powers.json";//path to powers file

function isAlphabetical(input) {//checking if input is just alphabetical numbers
    const regex = /^[a-zA-Z ]*$/;
    return regex.test(input);
  }
//function to check if input is just an integer
  function isInteger(input) {
    const regex = /^\p{Nd}+$/u;
    return regex.test(input);
  }
//function to check if email is a vaild input, including alphabetical characters, @ symbol, and allowing integers
function isEmailValid(email) {//sets a min and max length for the email
    // Adjust the regex to include length constraints
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //ensures basic structure of email address
    return regex.test(email);
}
function isAlphanumeric(input) {//function to check if it is both numbers and letters -> for password
    const regex = /^[a-zA-Z0-9 ]*$/;
    return regex.test(input);
}
//email handler 
const nodemailer = require('nodemailer');//allows 

//unique string
const {v4: uuidv4} = require('uuid');//need uuid v4
const { log } = require('console');
//const { resourceUsage } = require('process');

//nodemailer
let transporter = nodemailer.createTransport({ //using this valid email to send emails to users for verification
    service: "gmail",
    auth: {
            user: process.env.VERIFICATION_EMAIL, //email used to send 
            pass: process.env.VERIFICATION_EMAIL_PASSWORD, //password of that email so can send
          }
})
//testing success
transporter.verify((err,success)=>{//checking if ready to send emails
    if(err){
        console.log(err)//if there is an error, log the error
    } else {
        console.log("Ready for message!")//else, ready to send  a msg by SMTP
        console.log(success)
    }
})


//verification email //FROM youtube video by ToThePointCode https://www.youtube.com/watch?v=v6Ul3o8D-js -> Followed steps and understood process, implemented while following the video -> made adjustements
const sendVerificationEmail = ({_id, email},res) => {//sending verification email sends an email
    //url to be used in the email
    const currentUrl = "http://localhost:5000/";
    let uniqueString = uuidv4() + _id; //unique string to ensure it hasnt been tampered with
    //mail
    const mailOptions = {
        from: process.env.VERIFICATION_EMAIL, //email used to send
        to: email,
        subject: "Verification email",
        html: `<p>Verify your email address to complete account creation.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=
        ${currentUrl + "user/verify/" + _id + "/" + uniqueString
        }>here</a>to proceed</p>`, //url to direct to page that displays whether theyre verified or not
    }
    
    //hash the uniqueString
    const saltRounds = 10; //
    bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedString)=>{
        //set values in userVerification collection
        const newVerification = new tempUser({
            userId: _id, //user id for uniqueness
            uniqueString: hashedString, //the unique string hashed for protection
            createdAt: Date.now(), //date created
            expiresAt: Date.now() + 21600000, //expires 6 hours from now
        })
        newVerification //saving the temporary user until verified
        .save()
        .then(()=>{//next
            transporter
            .sendMail(mailOptions)//sending the mail to the user
            .then(()=>{
                //email sent and verification saved
                res.json({
                    status: "PENDING",
                    message: "Verification email sent!"
                })
            })
            .catch((error)=>{//catching if there was a problem sending the email
                console.log(error)
                res.json({
                    status: "Failed!",
                    message: "Verification email failed!"
                })
            })
        })
        .catch((err)=>{//catching if there was a problem saving the verification data
            console.log(err)
            res.json({
                status: "Failed!",
                message: "Error while saving verification data!"
            })
        })
    })
    .catch((error)=>{//catching if there was a problem hashing email
        console.log(error)
        res.json({
            status: "Failed!",
            message: "Error while hashing email!"
        })
    })

}
/************************user**************************/

function authenticateToken(req,res,next){//method to check if the token is vaild
    //header
    //console.log("called authenticate token")
    const authHeader = req.headers['authorization'];//getting token which is in headers
    //console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1];//if have authHeader, get token
    if(token == null){
        return res.sendStatus(401);//Web Dev Simplified JWT Authentication https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1189s, followed along with video to understand JWT & implemnt
    }
    //console.log(token)
    //console.log(process.env.ACCESS_TOKEN_SECRET + "SECRET")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user)=>{//using provided jwt method to verify if the token is valid
        if(err) {
            console.log(err + "here is the error from")
            return res.sendStatus(403)};
        req.user = user
        next()
    })

}
const minELength = 5;
const maxLength = 320;

routerUser.route('/user/find')//route to finding user
    .post((req, res) => {
        let {email,password} = req.body; //getting email and passowrd
        email = email.trim();
        password = password.trim();

        if(email == "" || password == ""){ //checking if fields are empty and displaying appropriate msg
            res.json({
                status: "Failed!",
                message: "Fields are empty!"
            });
        }
        if(!isEmailValid(email)){ //checking if email is in valid format
            console.log("Not valid email input!")
            res.json({
                status: "Failed!",
                message: "Not valid email input!!"
            });

        }
        else {
            User.find({ email })
            .then(data =>{
            
                
                if(data){
                    console.log("data has a length")
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
                                //jwt
                               //console.log(data)
                                if(data[0].isDisabled===false){
                                
                                    const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '600s' })
                                    
                                    console.log(accessToken)
                                    //res.send({accessToken: accessToken})
                                    
                                    res.json({
                                            accessToken: accessToken,
                                            status: "SUCCESS!",
                                            message: "Login success",
                                            data: data,
                                    })
                                }
                                else{
                                    res.json({
                                        status: "Failed!",
                                        message: "User is Disabled!",
                                    })

                                }
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
            .catch((err) => {
                console.log(err +"email not")

                res.json({
                    status: "Failed!",
                    message: "Invalid Email!",
                })

            })
        }

    })
/***************SEARCH**********************************/
//Fuse.js 
const options = {
    keys: ['name','Race','Publisher'], //what to search by
    threshold: 0.3,
}
 
// 
const options2 = {
    keys: ["hero_names","Agility","Accelerated Healing","Lantern Power Ring",
    "Dimensional Awareness",
    "Cold Resistance",
    "Durability",
    "Stealth",
    "Energy Absorption",
    "Flight",
    "Danger Sense",
    "Underwater breathing",
    "Marksmanship",
    "Weapons Master",
    "Power Augmentation",
    "Animal Attributes",
    "Longevity",
    "Intelligence",
    "Super Strength",
    "Cryokinesis",
    "Telepathy",
    "Energy Armor",
    "Energy Blasts",
    "Duplication",
    "Size Changing",
    "Density Control",
    "Stamina",
    "Astral Travel",
    "Audio Control",
    "Dexterity",
    "Omnitrix",
    "Super Speed",
    "Possession",
    "Animal Oriented Powers",
    "Weapon-based Powers",
    "Electrokinesis",
    "Darkforce Manipulation",
    "Death Touch",
    "Teleportation",
    "Enhanced Senses",
    "Telekinesis",
    "Energy Beams",
    "Magic",
    "Hyperkinesis",
    "Jump",
    "Clairvoyance",
    "Dimensional Travel",
    "Power Sense",
    "Shapeshifting",
    "Peak Human Condition",
    "Immortality",
    "Camouflage",
    "Element Control",
    "Phasing",
    "Astral Projection",
    "Electrical Transport",
    "Fire Control",
    "Projection",
    "Summoning",
    "Enhanced Memory",
    "Reflexes",
    "Invulnerability",
    "Energy Constructs",
    "Force Fields",
    "Self-Sustenance",
    "Anti-Gravity",
    "Empathy",
    "Power Nullifier",
    "Radiation Control",
    "Psionic Powers",
    "Elasticity",
    "Substance Secretion",
    "Elemental Transmogrification",
    "Technopath/Cyberpath",
    "Photographic Reflexes",
    "Seismic Power",
    "Animation",
    "Precognition",
    "Mind Control",
    "Fire Resistance",
    "Power Absorption",
    "Enhanced Hearing",
    "Nova Force",
    "Insanity",
    "Hypnokinesis",
    "Animal Control",
    "Natural Armor",
    "Intangibility",
    "Enhanced Sight",
    "Molecular Manipulation",
    "Heat Generation",
    "Adaptation",
    "Gliding",
    "Power Suit",
    "Mind Blast",
    "Probability Manipulation",
    "Gravity Control",
    "Regeneration",
    "Light Control",
    "Echolocation",
    "Levitation",
    "Toxin and Disease Control",
    "Banish",
    "Energy Manipulation",
    "Heat Resistance",
    "Natural Weapons",
    "Time Travel",
    "Enhanced Smell",
    "Illusions",
    "Thirstokinesis",
    "Hair Manipulation",
    "Illumination",
    "Omnipotent",
    "Cloaking",
    "Changing Armor",
    "Power Cosmic",
    "Biokinesis",
    "Water Control",
    "Radiation Immunity",
    "Vision - Telescopic",
    "Toxin and Disease Resistance",
    "Spatial Awareness",
    "Energy Resistance",
    "Telepathy Resistance",
    "Molecular Combustion",
    "Omnilingualism",
    "Portal Creation",
    "Magnetism",
    "Mind Control Resistance",
    "Plant Control",
    "Sonar",
    "Sonic Scream",
    "Time Manipulation",
    "Enhanced Touch",
    "Magic Resistance",
    "Invisibility",
    "Sub-Mariner",
    "Radiation Absorption",
    "Intuitive aptitude",
    "Vision - Microscopic",
    "Melting",
    "Wind Control",
    "Super Breath",
    "Wallcrawling",
    "Vision - Night",
    "Vision - Infrared",
    "Grim Reaping",
    "Matter Absorption",
    "The Force",
    "Resurrection",
    "Terrakinesis",
    "Vision - Heat",
    "Vitakinesis",
    "Radar Sense",
    "Qwardian Power Ring",
    "Weather Control",
    "Vision - X-Ray",
    "Vision - Thermal",
    "Web Creation",
    "Reality Warping",
    "Odin Force",
    "Symbiote Costume",
    "Speed Force",
    "Phoenix Force",
    "Molecular Dissipation",
    "Vision - Cryo",
    "Omnipresent",
    "Omniscient"
    ], //what to search by
    threshold: 0.4,
}


router.route('/heroes/name/:nameH')
    .get(async (req,res)=>{

        try{
            console.log("heroes/name called")
            const nameHP = req.params.nameH.toLowerCase().trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search({name:nameHP});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/power/:powerH')
    .get(async (req,res)=>{

        try{
            const powerHP = req.params.powerH.trim(); //name sent
            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];
            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    console.log(pObj)
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    const fuse3 = new Fuse(superheroes,options);
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                    //console.log(search3)
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        // console.log(hero.item)
                        // console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/publisher/:publisherH')
    .get(async (req,res)=>{

        try{
            const pubHP = req.params.publisherH.toLowerCase().trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search({Publisher:pubHP});

            //console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/race/:raceH')
    .get(async (req,res)=>{

        try{
            const raceHP = req.params.raceH.toLowerCase().trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search({Race:raceHP});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/name/:nameH/race/:raceH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const raceHP = req.params.raceH.trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Race: raceHP }]});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
     router.route('/heroes/name/:nameH/publisher/:pubH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const pubHP = req.params.pubH.trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Publisher: pubHP }]});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/name/:nameH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search(nameHP);
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/race/:raceH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const raceHP = req.params.raceH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search(raceHP);
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });

    /********************************************************** */
    router.route('/heroes/publisher/:pubH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const pubHP = req.params.pubH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search(pubHP);
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });

    router.route('/heroes/race/:raceH/publisher/:pubH')
    .get(async (req,res)=>{

        try{
            const raceHP = req.params.raceH.trim();
            const pubHP = req.params.pubH.trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { Race: raceHP}, {Publisher: pubHP }]});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/name/:nameH/race/:raceH/publisher/:pubH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const raceHP = req.params.raceH.trim();
            const pubHP = req.params.pubH.trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Race: raceHP },{Publisher: pubHP }]});

            console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
                //console.log(newSuperHeroes)
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/name/:nameH/publisher/:pubH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            //const raceHP = req.params.raceH.trim();
            const pubHP = req.params.pubH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Publisher: pubHP }]});
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });
    router.route('/heroes/name/:nameH/race/:raceH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const raceHP = req.params.raceH.trim();
            //const pubHP = req.params.pubH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Race: raceHP }]});
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);

            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });

    router.route('/heroes/race/:raceH/publisher/:pubH/power/:powerH')
    .get(async (req,res)=>{

        try{
            //const nameHP = req.params.nameH.trim();
            const raceHP = req.params.raceH.trim();
            const pubHP = req.params.pubH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { Publisher: pubHP}, {Race: raceHP }]});
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });


    router.route('/heroes/name/:nameH/race/:raceH/publisher/:pubH/power/:powerH')
    .get(async (req,res)=>{

        try{
            const nameHP = req.params.nameH.trim();
            const raceHP = req.params.raceH.trim();
            const pubHP = req.params.pubH.trim();
            const powerHP = req.params.powerH.trim(); //name sent

            //console.log(powerHP)
            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);

            let newSuperHeroes = [];
            //console.log(superheroes)
            const fuse1= new Fuse(superheroes,options);
            const search1 = fuse1.search( {$and: [
                { name: nameHP}, {Race: raceHP },{Publisher: pubHP }]});
            //console.log(search1,"Search1")
            const formattedSearch1 = search1.map(item => item.item);




            try{
                const powers = await fs.readFile(filePathPowers, 'utf-8');
                var parsedPowerData = JSON.parse(powers);
                const fuse2= new Fuse(parsedPowerData,options2);
                const search2 = fuse2.search({ [powerHP]: "True"});
                //console.log(search2)
                
                for(let pObj of search2){//going through all the powers
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero
                    for(let p in pObj.item){
                        if(String(pObj.item[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                   try{ 

                    const fuse3 = new Fuse(formattedSearch1,options);
                    //console.log(pObj.item["hero_names"])
                    const search3 = fuse3.search(pObj.item["hero_names"]);     
                   // console.log(search3)  
                    
                    for(let hero of search3){
                        hero.item.powers = powersInfo.powers;
                        //console.log(hero.item)
                        //console.log(hero.item.power)
                        newSuperHeroes.push(hero.item)
                        

                    }
                }
                catch(err){
                    console.log(err)
                }

                }
                
                            
            }
            catch(err){
                console.log(err + "error due to powers file");
            }
            res.json(newSuperHeroes)   
        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }        
    });

    
    async function readPowersFile(hero){//function to read from power file
           try{ 
                    const file = await fs.readFile(filePathPowers, 'utf-8');
                    var parsedPowerData = JSON.parse(file);
                    var powerFound = '';
                    for (let power of parsedPowerData) {
                        if (String(hero.name).toLowerCase() === String(power.hero_names).toLowerCase()) {
                           // console.log(hero.name, power.hero_names)
                            powerFound = power;
                        }
                    }
                
                    return powerFound;
            }
            catch(err){
                console.log(err + "while reading powers file")
                throw err;
            }

        
    }
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
                let {username, email, password} = req.body; //getting parameters from body
                username.trim();
                email.trim();
                password.trim();
                
                if(username == "" || email == "" || password == ""){//checking if parameters are empty and logging appropriate msg
                    res.json({
                        status: "Failed!",
                        message: "Empty input fields!"
                    })
                }
                else if(!isAlphabetical(username)){ //checking if username is alphabetical
                    res.json({
                        status: "Failed!",
                        message: "Invalid name entered!"
                    })
                }
                else if(!isEmailValid(email)){//checking if email is valid
                    res.json({
                        status: "Failed!",
                        message: "Invalid email entered!"
                    })
                }else if(!isAlphanumeric(password)){
                    res.json({
                        status: "Failed!",
                        message: "Invalid password entered! Only numbers and letters allowed!"
                    })
                }
                else {
                    User.find({email})//checking if user with that email already exists and loggin apropriate msg
                    .then(result => {
                        if(result.length){
                            res.json({
                                status: "Failed!",
                                message: "User exists!"
                            })
                        }
                        else {
                            //creating new user
                            //password hashing
                            const saltRounds = 10
                            console.log(password)
                            bcrypt.hash(password, saltRounds).then((hashP) => {//hashing password for extra security
                               const user = new User({//creating user using schema
                                                    username,
                                                    email,
                                                    password: hashP,
                                                    verified: false,
                                                    });
                                console.log(user)
                                user.save().then((result) =>{//saving user
                                    //handle account verification
                                    console.log(result)
                                    sendVerificationEmail(result, res);//sending the verification email
                                })
                                .catch(err => {//catching error if cant create user 
                                    console.log(err)
                                    res.json({
                                        status: "Failed!",
                                        message: "User creation failed!"
                                    })
                                })//error msg
                            })
                            .catch(error => {//catching error if cant hash password
                                console.log(error)
                                res.json({
                                    status: "Failed!",
                                    message: "An error occured while hashing password!"
                                })
                            })
                        }

                    })
                    .catch(err => {//catching error if failed when checking for same user
                        console.log(err);
                        res.json({
                            status: "Failed!",
                            message: "An error occurred while checking for existing user!"
                        })
                    })
                }
               
            } catch (err) {//eror if they made a bad request
                res.status(400).send(`Bad request ${err}`)
            }
        })
        .get(async (req, res) => {//getting all the users created
            try {
                let user = await User.find({}, 'username email password isAdmin'); //finding all info
                if(user.length > 0){
                    res.json(user)
                }
                else{
                    res.status(404).send('No user found');//didnt find that user
                }
            } catch (error) {
                res.status(500).send("Internal Server Error");
            }
        });
        routerUser.route('/user/create/admin')//router to add a user as admin
        .post(async (req, res) => {//creating an empty list
            try {
                let {username, email, password} = req.body;
                username.trim();
                email.trim();
                password.trim();
           
                
                    User.find({email})
                    .then(result => {
                        console.log(result)
                        if(result.length){
                            res.json({
                                status: "Failed!",
                                message: "User exists!"
                            })
                        }
                        else {
                            //creating new user
                            //password hashing
                            const saltRounds = 10
                            console.log(password)
                            bcrypt.hash(password, saltRounds).then((hashP) => {
                               const user = new User({//creating user using chema
                                                    username,
                                                    email,
                                                    password: hashP,
                                                    verified: true,
                                                    isAdmin:true,
                                                    });
                                console.log(user)
                                user.save().then((result) =>{//saving user
                                    
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.json({
                                        status: "Failed!",
                                        message: "User creation failed!"
                                    })
                                })//error msg
                            })
                            .catch(error => {
                                console.log(error)
                                res.json({
                                    status: "Failed!",
                                    message: "An error occured while hashing password!"
                                })
                            })
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.json({
                            status: "Failed!",
                            message: "An error occurred while checking for existing user!"
                        })
                    })
                
               
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
            }
        })


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
                                    console.log(userId +" user userid")
                                    //updating user record to verified = true
                                    User.updateOne({_id: userId}, {verified: true})
                                    .then(()=>{
                                        console.log(userId +" tempuser userid")
                                        tempUser.deleteOne({userId})//deleting the temporary user since theyre verified
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


routerUser.route('/user/delete')//router to delete a user
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
            const oldPasswordS = req.body.oldPassword.trim();
            const newPasswordS = req.body.newPassword.trim();
            const emailUserChange = req.body.email; //email of user
            if(!isAlphanumeric(oldPasswordS) || !isAlphanumeric(newPasswordS)){
                res.json({
                    status: "Failed!",
                    message: "Passwords are not Alphanumeric!"
                })
            }
            else if(!isEmailValid(emailUserChange)){
                res.json({
                    status: "Failed!",
                    message: "Email is not a valid input!"
                })
            }
            else{
                try {
                    let user = await User.findOne({email: emailUserChange}); //finding list
                    if (user) {
                        //If the user exist, change pass
                        bcrypt
                        .compare(oldPasswordS, user.password)//comparing the oldPassword to the password in the db
                        .then(function(results){
                            if(results){//if the passwords match, let them change it
                                //hashing password
                                const saltRounds = 10
                                
                                bcrypt.hash(newPasswordS, saltRounds)
                                .then((hashP) => {
                                    user.password = hashP; //changing old password to new password

                                    const savedUser = user.save(); //saving user 

                                    res.json({
                                        status: "SUCCESS!",//if user pass is saved then send success msg
                                        message: "Password Changed!"
                                    })
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.json({
                                        status: "Failed!", //else password is not acceotable
                                        message: "Unacceptable Password!"
                                    })
                                })
                            }
                            else{
                                res.json({//inputted a passsword that isnt correct
                                    status: "Failed!",
                                    message: "Incorrect Password!"
                                })
                            }
                        })
                        .catch(err => {//error comparing passwords, log msg
                            console.log(err, "There was an error comparing passwords")
                        })
                    
                    }
                    else{//return error if the user doesnt exist
                        console.log("This email doesnt exist")
                        return res.status(400).send("This email doesn't exist!");//sending status bc email doesnt exist
                    }
                } catch (err) {
                    res.status(400).send(`Bad request ${err}`)
                }
            }
    })
    ////////////////////////////////////////////////////////LISTS////////////////////////////////////  
    ///////////////////////////////////////UNATHORIZED//////////////////////////////////////////////
    //display  lists
    router.route('/heroes/lists')   ///finding the lists that are public to display them
    .get(async (req, res) => {
            try {
                let list = await HeroList.find({isPrivate: false});//get the lists that are public
                console.log(list, "All")
                if(list){//if list exists, return those lists
                    return res.json(list)
                }
                else {//return that there isnt any public lists
                    return res.status(404).send('No lists found');
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');
            }
        
    })
    router.route('/heroes/lists/:privateName')   //get the lists made by a specific user
    .get(authenticateToken,async (req, res) => {//only for authenticated users so use the token
            const emailUser = req.params.privateName;//get parameters
            try {
               
                let list = await HeroList.find({createdByPrivate: emailUser});//get hero list for that user
                console.log(list, "All")
                if(list){//return lists if exist
                    return res.json(list)
                }
                else {//user didnt make any lists so return no lists found
                    return res.status(404).send('No lists found');
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');//eror finding lists
            }
        
    })

    router.route('/heroes/list/find/:listName')   //route for finding a specific list
    .get(async (req, res) => {
            try {
                let list = await HeroList.findOne({listN: req.body.listN});//get the specific use the unique name
                console.log(list, "this is the list")
                if(list){//found specific list so send info
                    return res.json(list)
                }
                else {
                    return res.status(404).send('No lists found');//eror bc no list found
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');//error statement
            }
        
    })
    
    ////////////////////////////////////LISTS AUTHORIZED////////////////////////////////////////////
    router.route('/list/delete')//route to delete a list for authorized users
        .delete(async (req, res) => {
            if(isAlphabetical(req.body.listN)){ //making sure list name is just alphabetical
                try {
                    let list = await HeroList.deleteOne({ listN: req.body.listN });//deleting hero from a specific list
                    if(list.deletedCount === 1){
                        // List deleted successfully
                        //console.log('List removed');
                        res.send(list)
                    }
                    else {
                        res.status(404).send("List not found!");
                    }
                } catch (err) {
                    res.status(400).send(`Bad request please check the format of the superheroes  ${err}`)
                }
            } 
    });
    router.route("/heroes/list/create")//creating a list for heroes
    .post(authenticateToken,async (req, res) => {//creating an empty list
        if(isAlphabetical(req.body.listN)){
            try {
                let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                console.log(list)
                if (list) {
                    return res.status(400).send("This list exists, choose a new name!");
                }
                else if(req.body.listN) {
                    console.log(req.body.listN)
                    // If the list doesn't exist, create it and add the superheroes
                    const currentDate = new Date();//getting current date
                    const formattedDate = currentDate.toISOString(); // Converts to a string in the format "YYYY-MM-DDTHH:mm:ss.sssZ"

                    list = new HeroList({
                    listN: req.body.listN,
                    createdBy: req.body.createdBy,//who created the list
                    createdByPrivate: req.body.createdByPrivate,
                    lastModified: formattedDate,
                    isPrivate: req.body.isPrivate,
                    superhero: [] // Assuming superheroes is an array of superhero objects
                    });
                }
                const savedList = await list.save();
                console.log(savedList)
                res.status(201).json(savedList);   

            } catch (err) {
                console.log(err )
                res.status(400).send(`Bad request ${err}`)
            }
        }
        else{
            console.log("Invalid list name. It must contain alphabetical characters only.")
            res.status(400).send("Invalid list name. It must contain alphabetical characters only.");
        }
    });
    
    router.route(`/hero/add`)   //route for adding a hero
    .post(authenticateToken,async (req, res) => {
        if(isAlphabetical(req.body.listN)){//checking if list name is alphabetical
            try {
                console.log("adding hero was called")
                let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                //console.log(req.body.superhero)
                // Check if req.body.superheroes is an array and has elements
                if(req.body.superhero.length){
                    // If the list exists, concatenate the new superheroes to it
                    if (list) {
                        if(req.body.superhero.length > 1){
                            console.log("more than 1 supeerhero to add");
                            for(let hero of req.body.superhero){
                                console.log(hero," this is the hero ")
                                list.superhero = list.superhero.concat(hero);
                            }
                            const currentDate = new Date();//getting current date
                            const formattedDate = currentDate.toISOString()
                            list.lastModified = formattedDate; //formated date

                        }
                        else{
                            list.superhero = list.superhero.concat(req.body.superhero);
                            const currentDate = new Date();//getting current date
                            const formattedDate = currentDate.toISOString()
                            list.lastModified = formattedDate;
                        }
                         // Save the updated list or the new list
                        const savedList = await list.save();
                        res.json({
                            status: "SUCCESS!",
                            message: "List Saved!"
                        })
                       // console.log(list.superhero)
                        
                    }else {
                        return res.status(404).send("this list doesn't exist");
                    }
                }else {
                    // If superheroes is not an array or is empty, send a bad request response
                    return res.status(400).send("Bad request make sure superheroes is a non-empty array");
                }
            } catch (err) {
                res.status(400).send("Bad request please check the format of the superheroes sent")
            }
        }
    });

    router.route('/delete/hero')//deleting a specific hero
    .delete(async (req, res) => {
        //console.log("m2")
        const nameHeroCheck = req.body.nameHero; //checking if hero name isAlphabetical
        if(isAlphabetical(nameHeroCheck)){
            try {
                    let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                    var flag = false;
                    if(req.body.listN){
                        if (list && (list.superhero.length > 0)) {
                        for(let heroOb of list.superhero){
                            //console.log(String(heroOb.name).toLowerCase(),String(nameHeroCheck).toLowerCase(),String(heroOb.name).toLowerCase() == String(nameHeroCheck).toLowerCase())
                            if(String(heroOb.name).toLowerCase() === String(nameHeroCheck).toLowerCase()){
                                list.superhero = list.superhero.filter(superhero => String(superhero.name).toLowerCase() !== String(nameHeroCheck).toLowerCase());
                                const currentDate = new Date();//getting current date
                                const formattedDate = currentDate.toISOString()
                                list.lastModified = formattedDate;
                                flag=true;
                            }
                        }
                    if(flag===false){
                        return res.status(404).send("Superhero not in List!");
                    }
        
                    }else {
                        return res.status(400).send("Bad request, this list is empty");
                    }
                }else {
                    // If superheroes is not an array or is empty, send a bad request response
                    return res.status(400).send("Bad request make sure there is a list");
                }
                // Save the updated list or the new list
                const savedList = await list.save();
                res.status(201).json(savedList);

            } catch (err) {
                console.log("erro11")
                res.status(400).send("Bad request please check the format of the superheroes sent")
            }
        }
    });
    const optionsForFind = {
        keys: ['name','Race','Publisher'], //what to search by
        threshold: 0.000,
    }

    router.route('/heroes/find/name/:nameH')//route for finding a hero with a specific name
    .get(async (req,res)=>{
        if(isAlphanumeric( req.params.nameH.toLowerCase().trim())){

        try{
            const nameHP = req.params.nameH.toLowerCase().trim(); //name sent

            const dataSuperheroes = await fs.readFile(filePathToInfo, 'utf-8');//asynch reading hero file
            const superheroes = JSON.parse(dataSuperheroes);
            let newSuperHeroes = [];

            const fuse1= new Fuse(superheroes,optionsForFind);
            const search1 = fuse1.search(nameHP);

            //console.log(search1)

            try{
                for(let hero of search1){
                    const powers = await readPowersFile(hero.item);
                    let powersInfo = { powers: '' };//object to hold powers of 1 hero

                    for(let p in powers){//going through all the powers
                        if(String(powers[p])==='True'){//if hero has that power
                            powersInfo.powers += `${p},`;
                        } 
                    }
                    
                    hero.item.powers = powersInfo.powers;//adding all powers of one hero to hero
                    newSuperHeroes.push(hero.item);

                }
               // console.log(newSuperHeroes, "new superheroes")
                res.json(newSuperHeroes)
            }
            catch(err){
                console.log(err + "error due to powers file");
            } 

        }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
        }       
    } 
    else {
        console.log("Input is not valid!")
    }
    });
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////ADMIN FUNCTIONALITIES///////////////////////////////////
routerUser.route('/checkAdmin/:email')//checking if user is an admin
.get(authenticateToken,async (req,res)=>{

    try{
        const emailAdmin = req.params.email.toLowerCase().trim(); 
        if(!isEmailValid(emailAdmin)){
            console.log("This is not a valid email input!");
            res.json({
                status:"Failed!",
                msg:"Email not Valid!"
            })
        }
        else{

            try {
                let user = await User.findOne({ $and: [{email: emailAdmin},{isAdmin:true}]}); //finding if that user is an admin, to grant them permissions
                console.log(user)
                
                if(user){
                    res.json(user)

                }else {
                    return res.status(404).send("Not An Admin");//eror msg if not admin
                }
        
            } catch (err) {
                console.log("error",err)
            }
        }

    }catch(error){
            res.status(500).send(`Server unable to fulfill request! ${error}`)
    }    
        
});
router.route('/heroes/lists/display/review')   //displaying reviews
.get(authenticateToken,async (req, res) => {
        try {
            let list = await ReviewList.find({});//getting alll reviews to display
            //console.log(list, "All")
            if(list){
                return res.json(list)
            }
            else {
                return res.status(404).send('No lists found');//no reviews found
            }
        } catch (error) {
            console.log(error)
            res.status(400).send('Error finding list');//trouble while trying to find list
        }
    
})
router.route('/lists/review/updateReview')//route to change the hidden field
.post(authenticateToken,async (req, res) => {
        try {
            const emailR = req.body.email.trim();//getting email
            const listName = req.body.listN.trim();//getting list name
            if(!isAlphanumeric(listName) || !isEmailValid(emailR)){
                res.json({
                    status:"Failed",
                    msg:"Invalid inputs!"
                })

            }
            else{
                // const hidd = req.body.hidden;
                const listReview = await ReviewList.findOne({ $and: [{email: emailR},{listN: listName}]});//finding review by that email and by that list name
                // console.log(listReview, "listReview")
                if(listReview){
                    listReview.hidden = !(listReview.hidden);
                    //console.log(listReview.hidden)
                
                    const savedList = await listReview.save();//saving changes to make review hidden
                    res.json({
                        status:'SUCCESS!',
                        msg:'Changed Hidden Field'//success msg
                    })
                    
                    
                }
                else {
                    return res.status(404).send('No review found');
                }
        }
        } catch (error) {
            console.log(error,"error finding review")//error msgs
            res.status(400).send('Error finding review');
        }
    
})
routerUser.route('/new/admin')//route to add an admin
.post(authenticateToken,async (req, res) => {
        try {
            const emailNewAdmin = req.body.email.trim();//getting email
            if(!isEmailValid(emailNewAdmin)){
                res.json({
                    status:'Failed!',
                    msg:'Email not valid!'//success msg

                })
            }
            else {
        
                const user = await User.findOne({email:emailNewAdmin});//finding user with that email
                console.log(user, "user")
                if(user){
                    if(user.isAdmin === false){//if the admin value is false, make them admin
                        user.isAdmin = true;
                        const userSaved = await user.save();//saved changes
                        res.json({
                            status:'SUCCESS!',
                            msg:'Added New Admin!'//added admin
                        })

                    }
                    else{
                        res.json({
                            msg:'User is already an Admin!' //if try to enter email where user is admin
                        })
                    }
                }
                else {
                    return res.status(404).send('No user found!');
                }
            }
        } catch (error) {
            console.log(error,"error finding user")//eror msg for  adding admin if they cant find user by that email
            res.status(400).send('Error finding user');
        }
    
});
routerUser.route('/disable/user')//route to disable user
.post(authenticateToken,async (req, res) => {
        try {
            const emailUser = req.body.email.trim();//getting email
            if(!isEmailValid(emailUser)){
                res.json({
                    status:'Failed!',
                    msg:'Email not valid!'//success msg

                })
            }
            else{
                const user = await User.findOne({email:emailUser});//finding user by email admin inputted
                
                if(user){
                    user.isDisabled = !user.isDisabled;//saving new info
                    const userSaved = await user.save();//saving new disable info
                    res.json({
                        disabled: user.isDisabled, //reversing disabled status
                        status:'SUCCESS!' //sending success msgs
                    })
                }
                else {
                    return res.status(404).send('No user found!');
                }
            }
        } catch (error) {
            console.log(error,"error finding user")
            res.status(400).send('Error finding user');
        }
    
})
// router.route('/heroes/lists/display/review/delete')   
// .delete(async (req, res) => {
//         try {
//             let list = await ReviewList.deleteOne({ $and: [{email: req.body.email},{listN: req.body.listN}]});
//             console.log(list)
//             console.log(list, "deleted")
//             if(list){
//                 //const savedList = await list.save();
//                 res.json("Deleted")
//             }
//             else {
//                 return res.status(404).send('No review found');
//             }
//         } catch (error) {
//             console.log(error)
//             res.status(400).send('Error finding list');
//         }
    
// })
router.route(`/list/review`)   //getting reviews
.post(authenticateToken,async (req, res) => {
    if(isAlphabetical(req.body.listN)){
        try {
            console.log("review list was called")
            let review = await ReviewList.findOne({ $and: [{listN: req.body.listN},{email:req.body.email}]}); //finding specific list with name and email
                // If the list exists, concatenate the new superheroes to it
                console.log(review,"review")
            if (review) {//if review exists
                if(req.body.review !== ''){
                    console.log(req.body.review,"review")
                    console.log(review.comments,"comments")
                    review.comments = review.comments.concat(req.body.review);//adding new review to it

                }
                else{
                    review.rating = req.body.rating;
                }
                //date modified
                // Save the updated list or the new list
                
                const currentDate = new Date();//getting current date
                const formattedDate = currentDate.toISOString()
                review.lastModified = formattedDate;

                
                let list = await HeroList.findOne({email:req.body.email}); //finding email, updating date since list was modified
                if(list){
                    const currentDate2 = new Date();//getting current date
                    const formattedDate2 = currentDate2.toISOString()
                    list.lastModified = formattedDate2; //new date
                }
                
                
                const savedList = await review.save();//saving list
                console.log(savedList)
                res.json({
                    status: "SUCCESS!",
                    message: "List Saved!" //saving list
                })


                  
                   // console.log(list.superhero)
                    
            }else {//if review DNE, create it
                const currentDate = new Date();//getting current date
                const formattedDate = currentDate.toISOString()
                console.log("in else")

                review = new ReviewList({//creating review if it didnt exist, with appropriate values
                      listN: req.body.listN,
                      username: req.body.username,
                      email: req.body.email,
                      lastModified: formattedDate,
                      rating: req.body.rating,
                      comments: req.body.review,
                });
                let list = await HeroList.findOne({email:req.body.email}); //finding list to modify date
                if(list){
                    const currentDate = new Date();//getting current date
                    const formattedDate = currentDate.toISOString()
                    list.lastModified = formattedDate;
                }
                const savedList = await review.save();
                res.json({
                    review: savedList,
                    status: "SUCCESS!",
                    message: "List Saved!"
                })

                    
            }
            
        } catch (err) {
            console.log(err)
            res.status(400).send("Bad request please check the format of the superheroes sent")
        }
    }
});
routerUser.route('/admin/policy/create')//route to create a policy
.post(authenticateToken,async (req, res) => {
        try {
            const titlePolicy = req.body.title;//getting title
            const contentP = req.body.content;//getting content
            const creator = req.body.createdBy;//getting creator
        
            let policy = await Policy.findOne({title:titlePolicy});//finding if policy exists 
            
            if(policy){//if policy exists, just update it
                policy.content = contentP;
                const currentDate = new Date();//getting current date
                const formattedDate = currentDate.toISOString()
                policy.createdAt = formattedDate;
                const policySaved = await policy.save();//saving policy updates
                res.json({msg:'Policy Modified!'})
                console.log("policy modify")
            }
            else {
                
                policy = new Policy({//policy dne, do screate a new one with values
                    title: titlePolicy,
                    content: contentP,
                    createdBy: creator,
                });
                const policySaved = await policy.save();//save new list
                res.json({msg:'Policy Created!'})
                console.log("policy modified")
            }
        } catch (error) {
            console.log(error,"error making policy")
            res.status(400).send('Error making policy');
        }
    
})
routerUser.route('/policies')//route to get policies and display them
.get(async (req, res) => {
        try {
            let policy = await Policy.find({});//finding if policy exists 
            console.log(policy,"policy")
            
            if(policy){
               res.json(policy)
            }
            else {
                res.json({msg:'No Policy Existing!'})
                console.log("no policy")
            }
        } catch (error) {
            console.log(error,"error finding policy")
            res.status(400).send('Error finding policy');
        }
    
})
/////////////////////////////////////////////////////////////////////////////////////////////////////



//installing the router
app.use('/api/superheroes',router);
//installing router for users
app.use('/api/users',routerUser);
app.use('/user',routerVerify);


//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
