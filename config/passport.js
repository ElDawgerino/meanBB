var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use('local', new LocalStrategy(
  function(username, password, done){
    process.nextTick(function(){
      User.findOne({username: username}, function(err,user){
        if(err) {
          return done(err);
        }
        if(!user){
          return done(null, false, {message: 'Incorrect username'});
        }
        if(!user.validPassword(password)){
          return done(null, false, {message: 'Invalid password'});
        }
        return done(null, user);
      });
    })
  }
));
