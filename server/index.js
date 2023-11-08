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


const HeroList = require("../models/model");

const port = 5000;
const router = express.Router(); //route object

const router2 = express.Router();

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
const filePathToInfo = "superheroes/superhero_info.json";
const filePathPowers = "superheroes/superhero_powers.json";


router.route('/limit/:number?/:pattern/:name')
    .get((req,res)=>{
        console.log("hiiiiiiiii");
        var limit = req.params.number;
        var pattern = req.params.pattern;
        var namePattern = req.params.name;
        // console.log(limit);
        // console.log(pattern);
        // console.log(namePattern);
        fs.readFile(filePathToInfo, 'utf-8', (err,data2)=>{
            console.log("hii")
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
                    console.log(heroesArray," the array");
                    res.send(heroesArray);
                }
               
            }
            catch (error){     
                res.status(500).send(`server unable to fulfill request! ${error}`);
            } 
        })
    });


//getting publishers
router.route('/publisher')
    .get((req,res)=>{
        console.log("err")
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
    });

    router.route('/field/:field')
    .get((req,res) =>{
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
    });

//getting powers based on ID
router.route('/:id/powers')
    .get((req,res)=>{
        const id = req.params.id;
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
                    if (String(hero.name) === String(power.hero_names)) {
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
        try {console.log("jere")
            let list = await HeroList.findOne({listN: req.body.listN}); //finding list
            // Check if req.body.superheroes is an array and has elements
            if(Array.isArray(req.body.superhero) && req.body.superhero.length){
              // If the list exists, concatenate the new superheroes to it
              console.log("jere2")
              if (list) {
                list.superhero = list.superhero.concat(req.body.superhero);
                console.log("jere3")
        
              }else {
                return res.status(400).send("Bad request, this list doesn't exist");
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
    });

router.route("/heroes/list/create")
    .post(async (req, res) => {//creating an empty list
        try {
            let list = await HeroList.findOne({listN: req.body.listN}); //finding list
            // // Check if req.body.superheroes is an array and doesnt have elements
            // if(Array.isArray(req.body.superhero) && req.body.superhero.some(superhero => superhero.id === "")){
                // If the list exists, not good bc creating a new list
                if (list) {
                    return res.status(400).send("This list exists, choose a new name!");
                }
                else if(req.body.listN) {
                    // If the list doesn't exist, create it and add the superheroes
                    list = new HeroList({
                    listN: req.body.listN,
                    superhero: [] // Assuming superheroes is an array of superhero objects
                    });
                }
              
            //} else {
            //// If superheroes is not an array or isnt empty, send a bad request response
            //return res.status(400).send("Bad request make sure superheroes is a non-empty array");
            // }
            // Save the updated list or the new list
            const savedList = await list.save();
            res.status(201).json(savedList);

        } catch (err) {
            res.status(400).send(`Bad request please check the format of the superheroes sent ${err}`)
        }
    });

router.route('/heroes/lists')   //displays all lists
    .get(async (req, res) => {
        console.log("FFF")
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
        try {
            let list = await HeroList.findOne({listN: `${listND}`});
            console.log(list.length)
            if(list){
                res.json(list)
            }
        } catch (error) {
            res.status(404).send('List not found');
        }
    })

router.route('/list/find/:nameS')//finds info to save to a list
    .get((req,res)=>{
        const nameSWant = String(req.params.nameS)
        fs.readFile(filePathToInfo, 'utf-8', (err,data5)=>{
            if(err){
                console.log(err);
            }
            try {
                var superheroes = JSON.parse(data5);
                var infoAll = {"hero":"","powers":""}
                var sent = false;
                for(hero of superheroes){ 
                    if(String(hero.name) === String(nameSWant)){
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
    })
    
router.route('/delete/hero/:inputNM')
    .post(async (req, res) => {
        console.log("m2")
        const nameHeroCheck = req.params.inputNM;
        try {
            console.log("m33")
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
                        console.log("in")
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
    });

router.route('/list/delete')
    .delete(async (req, res) => {
        try {
            let list = await HeroList.deleteOne({ listN: req.body.listN });
            
            if(list.deletedCount === 1){
                // List deleted successfully
                console.log('List removed');
                res.send(list)
            }
            else {
                res.status(404).send("List not found!");
            }
        } catch (err) {
            res.status(400).send(`Bad request please check the format of the superheroes  ${err}`)
  }
});



//installing the router
app.use('/api/superheroes',router);
app.use('/db/heroes',router2)

//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
