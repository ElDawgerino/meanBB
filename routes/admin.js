var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'C7F209A547201848BB7BD887A18D9FD7D45D14EE293614C09A734DA4A389E589', userProperty: 'payload'});

/* GET admin page. */
router.get('/', function(req, res, next) {
  res.render('admin', {})
});

/* GET user list */
router.get('/users', auth, function(req, res, next) {
    //Checks if the user is admin
    if(req.payload.admin){
        User.find(function(err, users){
            if(err){
                return next(err);
            }
            res.json(users);
        });
    } else {
        return res.status(403);
    }
});

module.exports = router;
