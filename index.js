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



//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})