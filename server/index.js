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

const port = 5000;
const router = express.Router(); //route object
const routerUser = express.Router(); //route object

//defining path
const joinedPath = path.join(__dirname, '../client');

//setup serving front-end code (middleware using use - middleware is when the server gets a request but before passed to route  )
app.use('/',express.static(joinedPath)); 

//parse data in body as json onto router object using middleware
app.use(express.json()); //no longer need json.parse in each req


//for html
app.get('/',(req,res)=>{
    res.sendFile('index.html', { root: joinedPath });
});

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
  
  
router.route('/limit/:number?/:pattern/:name')
    .get((req,res)=>{
        
        var limit = req.params.number;
        var pattern = req.params.pattern;
        var namePattern = req.params.name;
        if(isInteger(limit) && isAlphabetical(pattern) && isAlphabetical(namePattern)){
            fs.readFile(filePathToInfo, 'utf-8', (err,data2)=>{
                if(err){
                    console.log(err);
                }
                try {
                    var superheroes2 = JSON.parse(data2);
                    const heroesArray = []
    
                    for(hero of superheroes2){
                        for(key in hero){
                            // console.log(String(key).toLowerCase());
                            // console.log(String(pattern).toLowerCase());
                            if(String(key).toLowerCase() === String(pattern).toLowerCase()){
                                if(String(hero[key]).toLowerCase() === String(namePattern).toLowerCase()){
                                    if(String(limit) === String(undefined)){
                                        heroesArray.push(String(hero.id));
                                    }
                                    else if(heroesArray.length <= limit-1){
                                        heroesArray.push(String(hero.id));
                                    }
                                }
                            }
                        }    
                    }
                    if(heroesArray.length > 0){
                        //console.log(heroesArray," the array");
                        res.send(heroesArray);
                    }
                }
                catch (error){     
                    res.status(500).send(`server unable to fulfill request! ${error}`);
                } 
            })
        }
        else{
            console.log("Invalid input. Please enter alphabetical characters only.");
        }
    });


//getting publishers
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
                    for(h of parseHeroes){
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

router.route('/:id')
    .get((req,res) =>{

        if(isInteger(req.params.id)){
            fs.readFile(filePathToInfo, 'utf-8', (err,data)=>{
                try {
                    var parsedHeroes = JSON.parse(data);
                    for(hero of parsedHeroes){
                        // console.log(typeof(hero.id),typeof(req.params.id))
                        if(parseInt(hero.id) === parseInt(req.params.id)){
                            res.send(hero);
                            // found=true;
                            // break;
                        }
                    }
                }
                catch (error){
                    res.status(500).send(`server unable to fulfill request!`);
                } 
            })
        }
     });

    router.route('/field/:field')
    .get((req,res) =>{
        if(isAlphabetical(req.params.field)){
            fs.readFile(filePathToInfo, 'utf-8', (err,data)=>{
                try {
                    var parsedHeroes = JSON.parse(data);
                    const listHeroes = [];
                    for(hero of parsedHeroes){
                        for(key in hero){
                            if(String(hero[key]).toLowerCase() ===  String(req.params.field).toLowerCase()){
                                listHeroes.push(hero);
                            }
                        }
                    }
                    if(listHeroes.length >0 ){
                        res.send(listHeroes);
                    }
                }
                catch (error){
                    res.status(500).send(`server unable to fulfill request!`);
                } 
            })
        }
    });

//getting powers based on ID
router.route('/:id/powers')
    .get((req,res)=>{
        const id = req.params.id;
        if(isInteger(id)){
            fs.readFile(filePathToInfo, 'utf-8', (err,data2)=>{
                if(err){
                    console.log(err);
                }
                try {
                    var superheroes = JSON.parse(data2);
                    for(hero of superheroes){
                        if(parseInt(hero.id) === parseInt(id)){
                            readPowersFile(hero).then((powers)=>{
                                found = true;
                                console.log(found)
                                res.send(powers);
                           
                            }).catch((error2)=> {
                                console.log(error2)
                            })         
                        }
                    }
                }
                catch (error){     
                    res.status(500).send(`server unable to fulfill request! ${error}`);
                } 
            })
        }
    });


//getting based on id
function readPowersFile(hero){//function to read from power file
    return new Promise((resolve, reject) => {
        fs.readFile(filePathPowers, 'utf-8', (err, powerData) => {
            if (err) {
                reject(err);
            } else {
                var parsedPowerData = JSON.parse(powerData);
                var powerFound;
                for (power of parsedPowerData) {
                    if (String(hero.name).toLowerCase() === String(power.hero_names).toLowerCase()) {
                        powerFound = power;
                    }
                }
                resolve(powerFound);
            }
        });
    })
}
router.route(`/h/add`)   
    .post(async (req, res) => {
        if(isAlphabetical(req.body.listN)){
            try {
                let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                // Check if req.body.superheroes is an array and has elements
                if(Array.isArray(req.body.superhero) && req.body.superhero.length){
                    // If the list exists, concatenate the new superheroes to it
                    //console.log("jere2")
                    if (list) {
                        list.superhero = list.superhero.concat(req.body.superhero);
                        
                    }else {
                        return res.status(404).send("this list doesn't exist");
                    }
                }else {
                    // If superheroes is not an array or is empty, send a bad request response
                    return res.status(400).send("Bad request make sure superheroes is a non-empty array");
                }
                // Save the updated list or the new list
                const savedList = await list.save();
                res.status(201).json(savedList);
            } catch (err) {
                res.status(400).send("Bad request please check the format of the superheroes sent")
            }
        }
    });

router.route("/heroes/list/create")
    .post(async (req, res) => {//creating an empty list
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

router.route('/heroes/lists')   //displays all lists
    .get(async (req, res) => {
        try {
            let list = await HeroList.find({}, 'listN superhero');
            if(list.length > 0){
                res.json(list)
            }
            else{
                res.status(404).send('No lists found');
            }
        } catch (error) {
            res.status(500).send("Internal Server Error");
        }
    })

    //display certain list
    router.route('/heroes/lists/:listND')   
    .get(async (req, res) => {
        const listND = req.params.listND;
        if(isAlphabetical(listND)){
            try {
                let list = await HeroList.findOne({listN: `${listND}`});
                //console.log(list.length)
                if(list){
                    return res.json(list)
                }
                else {
                    return res.status(404).send('No list found');
                }
            } catch (error) {
                res.status(404).send('List not found');
            }
        }
    })

router.route('/list/find/:nameS')//finds info to save to a list
    .get((req,res)=>{
        const nameSWant = String(req.params.nameS)
        if(isAlphabetical(nameSWant)){
            fs.readFile(filePathToInfo, 'utf-8', (err,data5)=>{
                if(err){
                    console.log(err);
                }
                try {
                    var superheroes = JSON.parse(data5);
                    var infoAll = {"hero":"","powers":""}
                    var sent = false;
                    for(hero of superheroes){ 
                        if(String(hero.name).toLowerCase() === String(nameSWant).toLowerCase()){
                            infoAll.hero = hero;
                            readPowersFile(hero).then((powers)=>{
                                for(k in powers){
                                    if(String(powers[k]) === "True"){
                                        infoAll.powers += `${k},`;
                                    }
                                }
                                if(!sent){
                                    res.send(infoAll);
                                    sent= true;
                                }
                            }).catch((error2)=> {
                                console.log(error2)
                            })         
                        }
                    }
                }
                catch (error){     
                    res.status(500).send(`server unable to fulfill request! ${error}`);
                } 
                
            })
        }
    })
    
router.route('/delete/hero/:inputNM')
    .post(async (req, res) => {
        //console.log("m2")
        const nameHeroCheck = req.params.inputNM;
        if(isAlphabetical(nameHeroCheck)){
            try {
                    //console.log("m33")
                    let list = await HeroList.findOne({listN: req.body.listN}); //finding list
                    var flag = false;
                    // Check if req.body.superheroes is an array and has elements
                    if(req.body.listN){
                        // If the list exists, remove hero
                        //console.log(list);
                        if (list && (list.superhero.length > 0)) {
                        for(heroOb of list.superhero){
                            //console.log(String(heroOb.name).toLowerCase(),String(nameHeroCheck).toLowerCase(),String(heroOb.name).toLowerCase() == String(nameHeroCheck).toLowerCase())
                            if(String(heroOb.name).toLowerCase() == String(nameHeroCheck).toLowerCase()){
                                //console.log("in")
                                list.superhero = list.superhero.filter(superhero => String(superhero.name).toLowerCase() !== String(nameHeroCheck).toLowerCase());
                                flag=true;
                            }
                        }
                    if(flag==false){
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

////////////////////////////////////////////////////USER///////////////////////////////////////////////////
routerUser.route('/user/create')//router to add a user
    .post(async (req, res) => {//creating an empty list
        if(isAlphabetical(req.body.username)){
            try {
                console.log("hi")
                let user = await User.findOne({username: req.body.username}); //finding list
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
