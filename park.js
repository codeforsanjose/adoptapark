var mongoose = require('mongoose');

var parkSchema = mongoose.Schema({
    'name': {type:String},
    'address': {type:String},
    'coordinates': [{type: Number, type: Number}],
    'adopted': {type: Boolean, default:false},
    'type': {type:String},
    'district': {type:Number},
    'url':{type:String}
})

var Park = mongoose.model('Park',parkSchema);
module.exports = Park;
