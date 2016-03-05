var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Discussions = mongoose.model('Discussion');
var Posts = mongoose.model('Post');
var User = mongoose.model('User');

var auth = jwt({secret: 'C7F209A547201848BB7BD887A18D9FD7D45D14EE293614C09A734DA4A389E589', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//GET the discussions json model
router.get('/discussionsList', function(req, res, next){
  Discussions.find(function(err, discussionsList) {
    if(err){
      return(next(err));
    }
    res.json(discussionsList);
  });
});

//POST a new discussion
router.post('/discussionsList', auth, function(req, res, next){
  var discussion = new Discussions(req.body);
  discussion.date = new Date();
  discussion.save(function(err, discussion){
    if(err) {
      return(next(err));
    }
    res.json(discussion);
  });
});

//Preloads discussions
router.param('discussion', function(req, res, next, id){
  var query = Discussions.findById(id);

  query.exec(function(err, discussion){
    if(err) {
      return next(err);
    }
    if(!discussion) {
      return next(new Error("Discussion not found"));
    }

    req.discussion = discussion;
    return next();
  });
});

//GET a discussion
router.get('/discussion/:discussion', function(req, res){
  req.discussion.populate('posts', function(err, discussion){
    if(err) {
      return next(err);
    }

    res.json(discussion);
  });
});


//POST a new post in a discussion
router.post('/discussion/:discussion/', auth, function(req,res){
  var post = new Posts(req.body);
  post.discussion = req.discussion;
  post.date = new Date();

  post.save(function(err, post){
    if(err){
      return next(err);
    }

    req.discussion.posts.push(post);
    req.discussion.save(function(err, discussion){
      if(err) {
        return next(err);
      }

      res.json(discussion);
    });
  });
});

//POST to register a new user
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Username or password missing.'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err, user){
    if(err){
      return next(err);
    }
    return res.json({token: user.generateJWT});
  });
});

//POST to login
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Username or password missing.'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }

    if(user){
      res.json({token: user.generateJWT()});
    }
    else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
