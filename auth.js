var passport = require('passport');
var Admin = require('../model/admin');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    Admin.findById(id, function(err, user) {
        cb(err, user);
    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    Admin.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if(user.password){
        user.comparePassword(password,function(err,a){          
          if(a){
            return done(null, user);
          }else{
            return done(null, false);
          }
        })
      }else{
        return done(null, false);
      }
    });
  }
));
