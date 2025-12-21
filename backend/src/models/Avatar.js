const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({});
module.exports = mongoose.model('Avatar', avatarSchema);
