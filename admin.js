var express = require('express');
var router = express.Router();
var Park = require('../model/park');
var Adopt = require('../model/adopt');
var Admin = require('../model/admin');
require('../config/auth');
var passport = require('passport');

function isAuthenticated(req, res, next) {
    if (req.user){
        return next();
    }else{
      res.redirect('/admin');
    }
}

router.get('/signout',function(req,res,next){
  req.logout();
  return res.redirect('/admin');
})

router.get('/',function(req,res,next){
  if(!req.user){
      return res.render('adminLogin',{logged:false});
  }else{
      return res.render('adminLogin',{logged:true});
  }
})

router.post('/signin',function(req,res,next){
  if(!req.body.username&&req.body.password){
    return res.status(401).send('Bad Requset');
  }else{
    passport.authenticate('local', function(err, user){
      if(err){
        return res.status(401).send(err);
      }
      if(!user){
        return res.status(401).send('Bad Login');
      }else{
        req.logIn(user,function(err){
          if (err) {
            return res.status(401).send(err);
          }else{
            return res.status(200).send();
          }
        })
      }
    })(req,res,next);
  }
})

router.get('/admins',isAuthenticated, function(req, res, next) {
    Admin.find({},function(err,doc){
      if(err){
        console.error(err);
      }else{
        res.render('admin_admin', {data: doc});
      }
    }).sort({"username":1}).lean();
  }
);

router.get('/parks',isAuthenticated, function(req, res, next) {
    Park.find({},function(err,doc){
      if(err){
        console.error(err);
      }else{
        res.render('admin_park', {data: doc});
      }
    }).sort({"name":1}).lean();
  }
);

router.get('/adopt',isAuthenticated, function(req, res, next) {
    Adopt.find({},function(err,doc){
      if(err){
        console.error(err);
      }else{
        //grab names
        var obj = {};
        for(var i =0; i<doc.length; i++){
          obj[doc[i]['park_id']]=false;
        }
        var arr = Object.keys(obj);
        Park.find({
          '_id': { $in: arr}},'name',function(err,pknames){
          if(err){
            console.error(err);
          }else{
            for(var j=0; j<pknames.length; j++){
              obj[pknames[j]['_id']]=pknames[j]['name'];
            }
            res.render('admin_adopt', {data: doc , pknames: obj});
          }
        }).lean();
      }
    }).sort({"_id":-1}).lean();
});

router.post('/add/parks',isAuthenticated,function(req,res,next){
  var newName = req.body.newName;
  var newAddress = req.body.newAddress;
  var newLat = req.body.newLat;
  var newLng = req.body.newLng;
  var newType = req.body.newType;
  var newDistrict = req.body.newDistrict;
  var newUrl = req.body.newUrl;
  var newAdopted = req.body.newAdopted;
  if(!newName){
    return res.status(401).send('Missing Name.');
  }
  if(!newLat&&newLng || newLat&&!newLng){
    return res.status(401).send('Lat and Lng needs to be either both filled or empty.');
  }
  var query = {name:newName};
  if(newAddress){
    query.address = newAddress;
  }
  if(newLat&&newLng){
    try{
      query.coordinates = [Number(newLng),Number(newLat)];
    }catch(err){
      return res.status(401).send('Lat and Lng needs to be numbers');
    }
  }
  if(newType){
    query.type = newType;
  }
  if(newDistrict){
    try{
      query.district = Number(newDistrict);
    }catch(err){
      return res.status(401).send('distrcit needs to be a number');
    }
  }
  if(newUrl){
    query.url = newUrl;
  }
  if(newAdopted){
    query.adopted = newAdopted;
  }
  var doc = new Park(query);
  doc.save(function(err){
    if(err){
      console.log(err);
      return res.status(401).send(err);
    }else{
      return res.send({});
    }
  })
})

router.post('/remove/parks',isAuthenticated,function(req,res,next){
  if(!req.body.remove){
    return res.status(404).send('Remove nothing...');
  }
  var a = req.body.remove;
  Park.remove({_id: a}, function(err, c) {
    if(c === 0) {
      return res.status(404).send("User Does Not Exist.");
    }else{
      return res.sendStatus(200);
    }
  });
})

router.post('/save/parks',isAuthenticated,function(req,res,next){
  var id = req.body.id;
  var newName = req.body.newName;
  var newAddress = req.body.newAddress;
  var newLat = req.body.newLat;
  var newLng = req.body.newLng;
  var newType = req.body.newType;
  var newDistrict = req.body.newDistrict;
  var newUrl = req.body.newUrl;
  var newAdopted = req.body.newAdopted;
  if(!id){
    return res.status(401).send('No id provided.');
  }
  if(!newName){
    return res.status(401).send('Missing Name.');
  }
  if(!newLat&&newLng || newLat&&!newLng){
    return res.status(401).send('Lat and Lng needs to be either both filled or empty.');
  }
  var query = {name:newName};
  if(newLat&&newLng){
    try{
      query.coordinates = [Number(newLng),Number(newLat)];
    }catch(err){
      return res.status(401).send('Lat and Lng needs to be numbers');
    }
  }
  if(newType){
    query.type = newType;
  }
  if(newDistrict){
    try{
      query.district = Number(newDistrict);
    }catch(err){
      return res.status(401).send('distrcit needs to be a number');
    }
  }
  if(newUrl){
    query.url = newUrl;
  }
  query.address = newAddress;
  query.adopted = newAdopted;

  Park.update({'_id':id},query,function(err,doc){
    if(err){
      console.log(err);
      return res.status(401).send(err);
    }else{
      return res.sendStatus(200);
    }
  });
})

router.post('/remove/adopt',isAuthenticated,function(req,res,next){
  if(!req.body.remove){
    return res.status(404).send('Remove nothing...');
  }
  var a = req.body.remove;
  Adopt.remove({_id: a}, function(err, c) {
    if(c === 0) {
      return res.status(404).send("Adopter Does Not Exist.");
    }else{
      return res.sendStatus(200);
    }
  });
})

router.post('/save/adopt',isAuthenticated,function(req,res,next){
  var id = req.body.id;
  var newProcessed = req.body.newProcessed;
  if(!id){
    return res.status(401).send('No id provided.');
  }

  var query = {
    'name': req.body.newName,
    'email': req.body.newEmail,
    'tel': req.body.newTel,
    processed:newProcessed
  };

  Adopt.update({'_id':id},query,function(err,doc){
    if(err){
      console.log(err);
      return res.status(401).send(err);
    }else{
      return res.sendStatus(200);
    }
  });
})

router.post('/remove/admins',isAuthenticated,function(req,res,next){
  if(!req.body.remove){
    return res.status(404).send('Remove nothing...');
  }
  var a = req.body.remove;
  Admin.remove({_id: a}, function(err, c) {
    if(c === 0) {
      return res.status(404).send("Admin Does Not Exist.");
    }else{
      return res.sendStatus(200);
    }
  });
})

router.post('/add/admins',isAuthenticated,function(req,res,next){
  var newName = req.body.username;
  var newPassword = req.body.password;

  if(!newName){
    return res.status(401).send('Missing Username.');
  }
  if(!newPassword){
    return res.status(401).send('Missing Password.');
  }
  var query = {
    username:newName,
    password:newPassword
  };
  var doc = new Admin(query);
  doc.save(function(err){
    if(err){
      console.log(err);
      return res.status(401).send(err);
    }else{
      return res.send({});
    }
  })
})

module.exports = router;
