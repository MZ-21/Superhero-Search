const express = require('express');
const app = express()
const port = 3000; 
const router = express.Router(); //route object


//temporary database
const parts = [
    {id:100, name:"Belt",colour: "brown", stock:0},
    {id:101, name:"Clip",colour: "brown", stock:0},
    {id:102, name:"Belt",colour: "red", stock:0},
    {id:103, name:"Hat",colour: "purple", stock:0},
];

//setup serving front-end code
app.use(`/`,express.static('static'))

//setup middleware to do logging (function inserted into processing pipeline) ->fixes redundency 
app.use((req, res, next) => {//for all the routes. Calls callback function for every request
    console.log(`${req.method} request for ${req.url}`);
    next(); //next allows to continue processing
});

//parse data in body as json onto router object using middleware
router.use(express.json()); 

//grouping routes based on prefix
router.route('/')//all routes to base prefix
    .get((req,res)=>{//get a list of parts
        res.send(parts);

    })

    //create a part
    .post((req,res)=>{
        const newpart = req.body;
        newpart.id = 100 + parts.length;
        if(newpart.name){
            parts.push(newpart);
            res.send(newpart);

        }
        else {
            res.status(400).send('Missing name');
        }
    })
router.route('/:id')
    .get((req,res)=>{//using get request to get info for a part
        const part = parts.find(p => p.id === parseInt(req.params.id)); 
        //if the id in the object === to one in request. checking type = as well. input sanitization when converting id to int
        if(part){
            res.send(part);
        }
        else {
            //if the id doesnt match, there is an error and the part wasnt found
            res.status(404).send(`Part ${req.params.id} was not found!`);
        }
    })
    //create/replace part data for a given id using put
    .put((req,res)=>{
        const newpart = req.body;
        console.log("Part: ", newpart);

        //add id field
        newpart.id = parseInt(req.params.id);

        //replacing part with new one
        const part = parts.findIndex(p => p.id === parseInt(newpart.id));
        if(part < 0 ){//not found
            console.log("Creating new part");
            parts.push(newpart);
        }
        else {
            console.log("Modifying part", req.params.id);
            parts[part] = newpart;
        } 
        res.send(newpart);
    })
    //Update stock level
    .post((req,res)=>{
        const newpart = req.body;
        console.log("Part: ", newpart);

        //add id field
        newpart.id = parseInt(req.params.id);

        //replacing part with new one
        const part = parts.findIndex(p => p.id === parseInt(req.params.id));
        if(part < 0 ){//not found
            res.status(404).send(`Part ${req.params.id} not found`);
        }
        else {
            console.log("Changing stock for ", req.params.id);
            parts[part].stock += parseInt(req.body.stock);//stock property must exist
            res.send(parts[part]);
        } 
        res.send(newpart);
    })



//installing the router at /api/parts
app.use('/api/parts',router); //used for this prefix


//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})