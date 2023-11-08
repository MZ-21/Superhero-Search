const mongoose = require('mongoose');

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

module.exports = mongoose.model('HeroList', heroSchema);