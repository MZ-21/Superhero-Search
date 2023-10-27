const express = require('express');
const app = express()
const port = 3000; 


//temporary database
const parts = [
    {id:100, name:"Belt",colour: "brown"},
    {id:101, name:"Clip",colour: "brown"},
    {id:102, name:"Belt",colour: "red"},
    {id:103, name:"Hat",colour: "purple"},
];
//setup serving front-end code
app.use(`/`,express.static('static'))

//using app.get to get url so when someone access that path, something happens
app.get('/api/parts',(req,res)=>{
    console.log(`Get request for ${req.url}`);
    res.send(parts);
});
//using get request to get info for a part
app.get('/api/parts/:part_id',(req,res)=>{
    const id = req.params.part_id;
    console.log(`Get request for ${req.url}`);//prints in cmd
    const part = parts.find(p => p.id === parseInt(id)); 
    //if the id in the object === to one in request. checking type = as well. input sanitization when converting id to int
    if(part){
        res.send(part);
    }
    else {
        //if the id doesnt match, there is an error and the part wasnt found
        res.status(404).send(`Part ${id} was not found!`);
    }
});



//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})