var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  text: String,
//  date: Date,
  discussion: {type:mongoose.Schema.Types.ObjectId, ref: 'Discussion'}
});

mongoose.model('Post', PostSchema);
