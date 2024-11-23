const mongoose = require('mongoose');

const LoginDetailsSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailID: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('LoginDetails', LoginDetailsSchema);

