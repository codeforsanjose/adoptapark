var mongoose = require('mongoose');

var adoptSchema = mongoose.Schema({
    'park_id': {type:String},
    'name': {type:String},
    'email': {type:String},
    'tel': {type:String},
    'time': {type:Date, default: new Date()},
    'processed': {type:Boolean, default: false}
})

var Adopt = mongoose.model('Adopt',adoptSchema);
module.exports = Adopt;
