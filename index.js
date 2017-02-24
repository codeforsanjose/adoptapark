var express = require('express');
var router = express.Router();
var Park = require('../model/park');
var Adopt = require('../model/adopt');

/* GET home page. */
router.get('/', function(req, res, next) {
  Park.find({},function(err,doc){
    if(err){
      console.error(err);
    }else{
      res.render('index', {data: doc});
    }
  }).lean()
});

router.get('/jsonToData', function(req, res, next) {
    var fs = require('fs');

    //the following line reads the json code.
    var obj = JSON.parse(fs.readFileSync('./data/togeojson.json', 'utf8'));

    var stuff = obj.features;
    //each item in the array
    for(var i = 0 ; i < stuff.length; i++){
        //print the [data,data,data] in each of them.
        var name = stuff[i].properties.name;
        var a,b;

        if(stuff[i].geometry.coordinates) {
            a = stuff[i].geometry.coordinates[0][0][0];
            b = stuff[i].geometry.coordinates[0][0][1];
        }else{
            a = stuff[i].geometry.geometries[0].coordinates[0][0][0];
            b = stuff[i].geometry.geometries[0].coordinates[0][0][1];
        }
        var counter = 0;
        Park.update({'name': name}, {'coordinates':[a,b],'adopted': false}, {upsert: true}, function (err) {
            if(err){
                console.error(err);
            }
            console.log(counter++); //make sure we are parsing all the data
        });
    }
    res.render('index');
});

router.post('/search',function(req,res,next){
  var query = {};
  //console.log(req.body);
  if(req.body.name){
    query.name= new RegExp(req.body.name.replace(/(\S+)/g, function(s) { return "\\b(" + s + ")(.*)" }).replace(/\s+/g, ''), "gi");
  }
  if(req.body.adopted=='true'&&req.body.available=='true'){
    //do nothing
  }else if(req.body.adopted=='true'){
    query.adopted=true;
  }else if(req.body.available=='true'){
    query.adopted=false;
  }
  Park.find(query,function(err,doc){
    if(err){
      console.error(err);
    }else{
      return res.send({doc});
    }
  }).lean()
})

router.post('/adopt',function(req,res,next){
  var a = req.body.name;
  var b = req.body.email;
  var c = req.body.tel;
  var pid = req.body.pid;
  if(a&&b&&c&&pid){
    var doc = new Adopt({
      'park_id': pid,
      'name': a,
      'email': b,
      'tel': c
    });
    doc.save(function(err){
      if(err){
        return res.status(404).send(err);
      }else{
        return res.send({});
      }
    })

  }else{
    return res.status(404).send('Missing info.');
  }
})

module.exports = router;
