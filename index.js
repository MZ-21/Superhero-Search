const express = require('express');
const app = express()
const port = 3000; 

//using app.get to get url so when someone access that path, something happens
app.get('/',(req,res)=>{
    res.send("Hello World");
});

//application should be listening for incoming msgs on this port
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})