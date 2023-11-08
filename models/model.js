const mongoose = require('mongoose');
//import Joi from 'joi';

const heroSchema = new mongoose.Schema({
   listN:{
        type: String,
        required: true
    },
    superhero:[
        {
        id: String,
        name: String,
        Gender: String,
        Eyecolor: String,
        Race: String,
        Haircolor: String,
        Height: String,
        Publisher: String,
        Skincolor: String,
        Alignment: String,
        Weight: String,
        Powers: String   
        }
   ]
})

// const schemaVal = 
// Joi.object({
//     id: Joi.string(),
//     name: Joi.string(),
//     Gender: Joi.string(),
//     Eyecolor: Joi.string(),
//     Race: Joi.string(),
//     Haircolor: Joi.string(),
//     Height: Joi.string(),
//     Publisher: Joi.string(),
//     Skincolor: Joi.string(),
//     Alignment: Joi.string(),
//     Weight: Joi.string(),
//     Powers: Joi.string()   
// })
module.exports = mongoose.model('HeroList', heroSchema);