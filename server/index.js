const express = require('express'); //importing module from dependencies using require
const app = express();//used to configure server
const path = require('path'); //path module to manipulate file paths
const fs = require('fs'); //module for files
// const mongoose = require('mongoose');

// //url for db
// const dbURL = 'mongodb://localhost/superheroes/superhero_info.json';
// //connecting to db
// mongoose.connect(dbURL);
// const db = mongoose.connection;
// db.on('error',(error)=> {console.error(error)})
// db.once('open', ()=> console.log("Connected"))


const port = 5000;
const router = express.Router(); //route object

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
    });
}



//installing the router
app.use('/api/superheroes',router);

//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
