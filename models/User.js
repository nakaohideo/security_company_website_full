const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    depositAddress: {
        type: String
    },
    privateKey: {
        type: String
    }
});

module.exports = User = mongoose.model('user', UserSchema);