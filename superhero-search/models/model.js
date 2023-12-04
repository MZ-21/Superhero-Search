const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
      },
      verified: {
        type: Boolean,
        default: false,
      }
});

const heroSchema = new mongoose.Schema({
   listN:{
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        default:"Admin",
        required: true
    },
    createdByPrivate: {
        type: String,
        required: true,
    },
    rating: {
        type: String,
        required: false,
        default:"No rating",
    },
    comments: {
        type: String,
        required: false
    },
    lastModified: {
        type: Date,
        required: true
    },
    
    isPrivate: {
        type: Boolean,
        default: true,
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
const User = mongoose.model('User',userSchema)
const HeroList= mongoose.model('HeroList', heroSchema)

module.exports = {HeroList, User}
