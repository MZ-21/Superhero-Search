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
const {HeroList} = require("../models/model");
const {User} =  require("../models/model");
const {tempUser} = require("../models/tempModel")//verification

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

            // await HeroList.collection.dropIndex({ createdByPrivate: 1 });
      
    })
    // Step 1: Check Existing Indexes
    



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
const filePathToInfo = "superheroes/superhero_info.json";
const filePathPowers = "superheroes/superhero_powers.json";

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
const { log } = require('console');
//const { resourceUsage } = require('process');

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
const sendVerificationEmail = ({_id, email},res) => {
    //url to be used in the email
    const currentUrl = "http://localhost:5000/";
    let uniqueString = uuidv4() + _id;
    console.log(uniqueString)
    console.log(email)
    console.log(_id)
    //mail
    const mailOptions = {
        from: process.env.VERIFICATION_EMAIL,
        to: email,
        subject: "Verification email",
        html: `<p>Verify your email address to complete account creation.</p><p>This link <b>expires in 6 hours</b>.</p><p>Press <a href=
        ${currentUrl + "user/verify/" + _id + "/" + uniqueString
        }>here</a>to proceed</p>`,
    }
    
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
        console.log(_id, hashedString)
        console.log(newVerification)
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
                    status: "Failed!",
                    message: "Verification email failed!"
                })
            })
        })
        .catch((err)=>{
            console.log(err)
            res.json({
                status: "Failed!",
                message: "Error while saving verification data!"
            })
        })
    })
    .catch((error)=>{
        console.log(error)
        res.json({
            status: "Failed!",
            message: "Error while hashing email!"
        })
    })

}
/************************user**************************/

function authenticateToken(req,res,next){
    //header
    console.log("called authenticate token")
    const authHeader = req.headers['authorization'];//getting token which is in headers
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1];//if have authHeader, get token
    if(token == null){
        return res.sendStatus(401);//Web Dev Simplified JWT Authentication
    }
    console.log(token)
    console.log(process.env.ACCESS_TOKEN_SECRET + "SECRET")
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,user)=>{
        if(err) {
            console.log(err + "here is the error from")
            return res.sendStatus(403)};
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
                status: "Failed!",
                message: "Fields are empty!"
            });
        }
        else {
            User.find({ email })
            .then(data =>{
                console.log("For some reason, email found")
                
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
                                console.log("jwt email error")
                                const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '600s' })
                                
                                console.log(accessToken)
                                //res.send({accessToken: accessToken})
                                
                                res.json({
                                        accessToken: accessToken,
                                        status: "SUCCESS!",
                                        message: "Login success",
                                        data: data,
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
            const search1 = fuse1.search(nameHP);

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
            const search1 = fuse1.search(pubHP);

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
            const search1 = fuse1.search(raceHP);

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
                let {username, email, password} = req.body;
                username.trim();
                email.trim();
                password.trim();
                
                if(username == "" || email == "" || password == ""){
                    res.json({
                        status: "Failed!",
                        message: "Empty input fields!"
                    })
                }
                else if(!/^[a-zA-Z ]*$/.test(username)){
                    res.json({
                        status: "Failed!",
                        message: "Invalid name entered!"
                    })
                }
                else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
                    res.json({
                        status: "Failed!",
                        message: "Invalid email entered!"
                    })
                }

                else {
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
                                                    verified: false,
                                                    });
                                console.log(user)
                                user.save().then((result) =>{//saving user
                                    //handle account verification
                                    console.log(result)
                                    sendVerificationEmail(result, res);
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
            const oldPasswordS = req.body.oldPassword.trim();
            const newPasswordS = req.body.newPassword.trim();
            try {
                let user = await User.findOne({email: req.body.email}); //finding list
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

                                const savedUser = user.save(); 

                                res.json({
                                    status: "SUCCESS!",
                                    message: "Password Changed!"
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                res.json({
                                    status: "Failed!",
                                    message: "Unacceptable Password!"
                                })
                            })
                        }
                        else{
                            res.json({
                                status: "Failed!",
                                message: "Incorrect Password!"
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err, "There was an error comparing passwords")
                    })
                   
                }
                else{//return error if the user doesnt exist
                    console.log("This email doesnt exist")
                    return res.status(400).send("This email doesn't exist!");
                }
            } catch (err) {
                res.status(400).send(`Bad request ${err}`)
            }
    })
    ////////////////////////////////////////////////////////LISTS////////////////////////////////////  
    ///////////////////////////////////////UNATHORIZED//////////////////////////////////////////////
    //display  lists
    router.route('/heroes/lists')   
    .get(async (req, res) => {
            try {
                let list = await HeroList.find({isPrivate: false});
                console.log(list, "All")
                if(list){
                    return res.json(list)
                }
                else {
                    return res.status(404).send('No lists found');
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');
            }
        
    })
    router.route('/heroes/lists/:privateName')   
    .get(authenticateToken,async (req, res) => {

            try {
                const emailUser = req.params.privateName;
                let list = await HeroList.find({createdByPrivate: emailUser});
                console.log(list, "All")
                if(list){
                    return res.json(list)
                }
                else {
                    return res.status(404).send('No lists found');
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');
            }
        
    })

    router.route('/heroes/list/find/:listName')   
    .get(async (req, res) => {
            try {
                let list = await HeroList.findOne({listN: req.body.listN});
                console.log(list, "this is the list")
                if(list){
                    return res.json(list)
                }
                else {
                    return res.status(404).send('No lists found');
                }
            } catch (error) {
                console.log(error)
                res.status(400).send('Error finding list');
            }
        
    })
    
    ////////////////////////////////////LISTS AUTHORIZED////////////////////////////////////////////
    router.route('/list/delete')
        .delete(async (req, res) => {
            if(isAlphabetical(req.body.listN)){
                try {
                    let list = await HeroList.deleteOne({ listN: req.body.listN });
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
    router.route("/heroes/list/create")
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
    router.route(`/hero/add`)   
    .post(authenticateToken,async (req, res) => {
        if(isAlphabetical(req.body.listN)){
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

                        }
                        else{
                            list.superhero = list.superhero.concat(req.body.superhero); 
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
    const optionsForFind = {
        keys: ['name','Race','Publisher'], //what to search by
        threshold: 0.000,
    }

    router.route('/heroes/find/name/:nameH')
    .get(async (req,res)=>{

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
    });
    // router.route(`/hero/add`)   
    // .get(authenticateToken,async (req, res) => {
    //     if(isAlphabetical(req.body.listN)){
    //         try {
    //             let list = await HeroList.findOne({listN: req.body.listN}); //finding list
    //             // Check if req.body.superheroes is an array and has elements
    //             if(Array.isArray(req.body.superhero) && req.body.superhero.length){
    //                 // If the list exists, concatenate the new superheroes to it
    //                 //console.log("jere2")
    //                 if (list) {
    //                     list.superhero = list.superhero.concat(req.body.superhero);
                        
    //                 }else {
    //                     return res.status(404).send("this list doesn't exist");
    //                 }
    //             }else {
    //                 // If superheroes is not an array or is empty, send a bad request response
    //                 return res.status(400).send("Bad request make sure superheroes is a non-empty array");
    //             }
    //             // Save the updated list or the new list
    //             const savedList = await list.save();
    //             res.status(201).json(savedList);
    //         } catch (err) {
    //             res.status(400).send("Bad request please check the format of the superheroes sent")
    //         }
    //     }
    // });
//////////////////////////////////////////////////////////////////////////////////////////////////////



//installing the router
app.use('/api/superheroes',router);
//installing router for users
app.use('/api/users',routerUser);
app.use('/user',routerVerify);


//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
