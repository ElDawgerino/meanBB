var mongoose = require('mongoose');

var DiscussionSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});

mongoose.model('Discussion', DiscussionSchema);
