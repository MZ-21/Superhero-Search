const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    uniqueString: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
      },
    verified: {
        type: Boolean,
        default: false,
      }
});

const tempUser = mongoose.model('tempUser',tempUserSchema)
module.exports = {tempUser}