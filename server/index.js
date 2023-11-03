const express = require('express'); //importing module from dependencies using require
const app = express();//used to configure server
const path = require('path'); //path module to manipulate file paths
const fs = require('fs'); //module for files
const mongoose = require('mongoose');

//url for db
const dbURL = 'mongodb://localhost/superheroes/superhero_info.json';
//connecting to db
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error',(error)=> {console.error(error)})
db.once('open', ()=> console.log("Connected"))


const port = 5000;
const router = express.Router(); //route object

//defining path
const joinedPath = path.join(__dirname, '../client');

//reading from json 
const filePathToInfo = "server/superheroes/superhero_info.json";

var parsedData = []; //array to hold superhero data
fs.readFile(filePathToInfo, 'utf-8', (err,data)=>{
    if(err) {
        console.error('Error reading the file:',err);
        return;
    }
    try {
        var parsed = JSON.parse(data);
        for(object of parsed){
            parsedData.push(object);
        }
        
    } catch (error){
        console.error('Error parsing json',error)
    }
    
});



//setup serving front-end code (middleware using use - middleware is when the server gets a request but before passed to route  )
app.use('/',express.static(joinedPath)); 

//parse data in body as json onto router object using middleware
app.use(express.json()); //no longer need json.parse in each req

//for html
app.get('/',(req,res)=>{
    res.sendFile('index.html', { root: joinedPath });
})

//getting based on id
router.get('/:id',(req,res) =>{
    res.send();
})

//installing the router
app.use('/api/superheroes',router);

//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})