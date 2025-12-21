const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({});
module.exports = mongoose.model('Shop', shopSchema);
