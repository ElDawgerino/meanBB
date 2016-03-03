var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Discussions = mongoose.model('Discussion');
var Posts = mongoose.model('Post');

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
router.post('/discussionsList', function(req, res, next){
  var discussion = new Discussions(req.body);
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
router.post('/discussion/:discussion/', function(req,res){
  var post = new Posts(req.body);
  post.discussion = req.discussion;

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

module.exports = router;
